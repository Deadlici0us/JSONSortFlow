# Architecture Documentation

This document details the system architecture, design decisions, and constraints for the JSONSortFlow application.

## Table of Contents

1. [Overview](#overview)
2. [Signal Lifecycle Management](#signal-lifecycle-management)
3. [Shutdown Sequence](#shutdown-sequence)
4. [Design Principles](#design-principles)
5. [Code Constraints](#code-constraints)
6. [Testing Strategy](#testing-strategy)
7. [Dependency Management](#dependency-management)

---

## Overview

The JSONSortFlow application is a Node.js/TypeScript microservice providing pathfinding and sorting algorithms via REST API. The architecture follows layered design with strict separation of concerns between infrastructure, domain, and application layers.

### Layered Architecture

```
┌─────────────────────────────────────┐
│           Application Layer         │
│              (app.ts)               │
├─────────────────────────────────────┤
│            Domain Layer             │
│  (Searchers, Sorters, Types)        │
├─────────────────────────────────────┤
│         Infrastructure Layer         │
│ (SignalLifecycleManager, ThreadPool,│
│  ShutdownManager, HTTP Server)      │
└─────────────────────────────────────┘
```

---

## Signal Lifecycle Management

### SignalLifecycleManager Class

The `SignalLifecycleManager` class (located in `src/infrastructure/SignalLifecycleManager.ts`) handles graceful shutdown by managing OS signal handlers and shutdown callbacks.

#### Responsibilities

1. **Register Shutdown Hooks**: Accepts callbacks that execute during shutdown
2. **Attach Signal Handlers**: Listens for SIGTERM and SIGINT signals
3. **Execute Shutdown Sequence**: Invokes all registered callbacks when signals received
4. **Track Shutdown State**: Maintains boolean flag indicating shutdown in progress

#### Public API

```typescript
class SignalLifecycleManager {
  // Register a callback to execute during shutdown
  public RegisterShutdownHook(callback: () => void): void;
  
  // Attach signal handlers for SIGTERM and SIGINT (idempotent)
  public StartListening(): void;
  
  // Returns true if shutdown has been initiated
  public GetShutdownStatus(): boolean;
  
  // Reset state for testing purposes
  public ResetForTesting(): void;
}
```

#### Idempotency Guarantees

- `StartListening()` can be called multiple times; signal handlers are attached **exactly once**
- Shutdown callbacks are executed in registration order
- Once shutdown is initiated, additional signals are ignored (prevents duplicate callback execution)
- The class maintains internal `listeningAttached` flag to prevent duplicate handler registration

#### Error Handling

- Each shutdown callback is wrapped in try-catch
- If one callback throws, remaining callbacks still execute
- Errors are logged but do not prevent shutdown completion

---

## Shutdown Sequence

### Signal Flow

```
1. OS sends SIGTERM or SIGINT
   ↓
2. SignalLifecycleManager receives signal
   ↓
3. GetShutdownStatus() returns true
   ↓
4. All registered callbacks execute in order:
   a. Server.close() - Close HTTP connections
   b. ThreadPool.shutdown() - Drain worker queue
   c. Custom cleanup hooks
   ↓
5. Application exits gracefully
```

### Integration Pattern

In `src/app.ts`:

```typescript
class App {
  private signalLifecycleManager: SignalLifecycleManager;
  private server: Server | null = null;

  constructor() {
    this.signalLifecycleManager = new SignalLifecycleManager();
    
    // Register server close callback BEFORE starting to listen
    this.RegisterShutdownHook();
    
    // Attach signal handlers
    this.signalLifecycleManager.StartListening();
  }

  private RegisterShutdownHook(): void {
    const serverCloseCallback = (): void => {
      if (this.server !== null) {
        this.server.close();
      }
    };
    this.signalLifecycleManager.RegisterShutdownHook(serverCloseCallback);
  }
}
```

### Critical Ordering

1. **Instantiate** SignalLifecycleManager
2. **Register** shutdown hooks (server close, thread pool shutdown, etc.)
3. **Start listening** for signals
4. **Start server** on port

This ordering ensures callbacks are registered before any signals can arrive.

---

## Design Principles

### SOLID Compliance

#### Single Responsibility Principle (SRP)
- `SignalLifecycleManager`: Only manages signal handlers and shutdown callbacks
- `ShutdownManager`: Coordinates shutdown of server and thread pool
- `ThreadPool`: Manages worker thread lifecycle only

#### Open/Closed Principle (OCP)
- Shutdown hooks allow extending shutdown behavior without modifying core logic
- New callbacks can be registered without changing `SignalLifecycleManager` implementation

#### Liskov Substitution Principle (LSP)
- All infrastructure classes use explicit interfaces
- Mock implementations can substitute real classes in tests

#### Interface Segregation Principle (ISP)
- `ILogger` interface provides minimal logging contract
- `ISearcher` and `ISorter` interfaces define only required methods

#### Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions (interfaces)
- Low-level modules implement interfaces
- Tests inject mock implementations

### DRY (Don't Repeat Yourself)

- Signal handler logic centralized in `SignalLifecycleManager`
- Error handling patterns reused across services
- Validation logic extracted to `SorterValidator` utility

---

## Code Constraints

### Cyclomatic Complexity (CC)

**Maximum CC: 5**

All methods must maintain cyclomatic complexity ≤ 5 to ensure:
- Readable, maintainable code
- Complete unit test coverage is achievable
- Easy refactoring without breaking changes

**Enforcement**: ESLint rule `complexity: [error, 5]`

### Lines of Code (LOC)

**Maximum: 50 lines per function/method**

All methods must not exceed 50 lines to ensure:
- Single responsibility per method
- Easier code review
- Better test isolation

**Enforcement**: ESLint rule `max-lines-per-function: [error, 50]`

### Code Style

- **Indentation**: Allman style (4 spaces)
- **Variables**: camelCase
- **Methods/Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Type Safety**: No `any` types in production code

---

## Testing Strategy

### TDD Workflow

All features implemented following Red-Green-Refactor:

1. **Red**: Write failing test
2. **Green**: Implement minimal code to pass test
3. **Refactor**: Improve code while keeping tests green

### Coverage Requirements

- **Minimum Coverage**: 90% for all new code
- **SignalLifecycleManager**: 98.05% achieved
- **Branch Coverage**: Must be ≥90% to catch edge cases

### Mutation Testing

- **Target Score**: ≥80% mutant kill rate
- **SignalLifecycleManager**: 81.82% achieved (27 killed, 6 survived)
- Surviving mutants are defensive patterns (null checks, array resets)

### Mocking Strategy

#### Process Object Mocking

```typescript
// Mock process.on to prevent actual signal handling in tests
const originalOn = process.on;
jest.spyOn(process, 'on').mockImplementation((event, listener) => {
  processOnCalls.push([event as string, listener as Function]);
  return originalOn.call(process, event, listener);
});
```

**Rationale**: Prevents global state mutation while enabling signal handler testing.

#### Test Isolation

- Each test file imports fresh module instances
- `beforeEach` clears all mocks
- `afterEach` restores original implementations
- No shared state between tests

### Edge Cases Tested

1. **Idempotency**: Multiple `StartListening()` calls attach handlers once
2. **Null Safety**: `RegisterShutdownHook(null/undefined)` rejected
3. **Error Resilience**: Callback errors don't prevent other callbacks
4. **State Management**: Shutdown status tracked accurately
5. **Reset Capability**: `ResetForTesting()` enables re-testing

---

## Dependency Management

### Lock File

- **npm-shrinkwrap.json**: Locks all dependencies (prod + dev)
- Ensures deterministic builds across environments
- Prevents unintended dependency upgrades

### Node Version

- **Required**: Node.js 20.x
- **Enforced**: `.nvmrc` and CI workflow
- **Rationale**: LTS version with ES2022+ features

### Key Dependencies

| Package | Purpose | Version Constraint |
|---------|---------|-------------------|
| express | HTTP server | ^4.x |
| piscina | Worker threads | ^4.x |
| jest | Testing framework | ^29.x |
| stryker-mutator | Mutation testing | ^8.x |
| eslint | Linting | ^8.x |
| typescript | Type checking | ^5.x |

---

## File Structure

```
src/
├── app.ts                          # Application entry point
├── infrastructure/
│   ├── SignalLifecycleManager.ts   # Signal handling (NEW)
│   ├── ShutdownManager.ts          # Shutdown coordination
│   └── ThreadPool.ts               # Worker thread pool
├── services/
│   ├── BfsSearcher.ts
│   ├── DfsSearcher.ts
│   ├── AStarSearcher.ts
│   ├── DijkstraSearcher.ts
│   ├── BubbleSorter.ts
│   ├── QuickSorter.ts
│   └── MergeSorter.ts
├── errorhandling/
│   └── *.ts                        # Error types and handlers
└── utils/
    └── *.ts                        # Utility functions

tests/
├── infrastructure/
│   ├── SignalLifecycleManager.test.ts  # NEW
│   └── ShutdownManager.test.ts
├── app.integration.test.ts       # NEW: Integration tests
└── services/
    └── *.test.ts
```

---

## Quality Gates

### CI Pipeline (GitHub Actions)

1. **ESLint**: Zero warnings/errors
2. **TypeScript**: Zero compilation errors
3. **Jest**: All tests pass, ≥90% coverage
4. **Stryker**: Mutation testing on critical paths
5. **Complexity**: CC ≤ 5, LOC ≤ 50

### Pre-Merge Requirements

- All quality gates must pass
- Code review approval required
- No failing tests in PR branch

---

## Maintenance Guidelines

### Adding New Shutdown Hooks

```typescript
// In src/app.ts constructor
this.signalLifecycleManager.RegisterShutdownHook(() => {
  // Cleanup logic here
  this.someResource.dispose();
});
```

### Adding New Infrastructure Components

1. Create in `src/infrastructure/`
2. Write tests in `tests/infrastructure/`
3. Follow TDD workflow
4. Maintain CC ≤ 5 and LOC ≤ 50
5. Update this documentation

### Refactoring Rules

- Never modify public API without updating all consumers
- Always run full test suite before committing
- Update mutation testing baseline if score changes
- Document architectural changes in this file

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-08 | Initial architecture with SignalLifecycleManager |

---

## Contact

For questions about this architecture, consult the team lead or review the original PR that introduced SignalLifecycleManager.
