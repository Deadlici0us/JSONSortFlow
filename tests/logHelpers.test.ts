import {
    getCircularReplacer,
    formatStructuredLog,
} from '../src/utils/logHelpers';

describe('logHelpers', () => 
{
    describe('getCircularReplacer', () => 
{
        it('should handle non-circular objects', () => 
{
            const replacer = getCircularReplacer();
            const obj = { name: 'test', value: 123 };
            const result = JSON.stringify(obj, replacer);
            const parsed = JSON.parse(result);

            expect(parsed.name).toBe('test');
            expect(parsed.value).toBe(123);
        });

        it('should handle circular references', () => 
{
            const replacer = getCircularReplacer();
            const obj: any = { name: 'test' };
            obj.self = obj; // Create circular reference

            const result = JSON.stringify(obj, replacer);
            const parsed = JSON.parse(result);

            expect(parsed.name).toBe('test');
            expect(parsed.self).toBe('[Circular Reference]');
        });

        it('should handle nested circular references', () => 
{
            const replacer = getCircularReplacer();
            const obj: any = { name: 'test', child: { value: 123 } };
            obj.child.parent = obj; // Create nested circular reference

            const result = JSON.stringify(obj, replacer);
            const parsed = JSON.parse(result);

            expect(parsed.name).toBe('test');
            expect(parsed.child.value).toBe(123);
            expect(parsed.child.parent).toBe('[Circular Reference]');
        });

        it('should handle null and undefined values', () => 
{
            const replacer = getCircularReplacer();
            const obj = { nullValue: null, undefinedValue: undefined };

            const result = JSON.stringify(obj, replacer);
            const parsed = JSON.parse(result);

            expect(parsed.nullValue).toBeNull();
            expect(parsed.undefinedValue).toBeUndefined();
        });
    });

    describe('formatStructuredLog', () => 
{
        it('should format info level log', () => 
{
            const result = formatStructuredLog('info', 'Test message');
            const parsed = JSON.parse(result);

            expect(parsed.level).toBe('info');
            expect(parsed.message).toBe('Test message');
            expect(parsed.timestamp).toBeDefined();
            expect(parsed.meta).toBeUndefined();
        });

        it('should format error level log', () => 
{
            const result = formatStructuredLog('error', 'Error message');
            const parsed = JSON.parse(result);

            expect(parsed.level).toBe('error');
            expect(parsed.message).toBe('Error message');
        });

        it('should include metadata when provided', () => 
{
            const meta = { userId: 123, action: 'test' };
            const result = formatStructuredLog('info', 'Test message', meta);
            const parsed = JSON.parse(result);

            expect(parsed.meta).toEqual(meta);
        });

        it('should not include meta when undefined', () => 
{
            const result = formatStructuredLog(
                'info',
                'Test message',
                undefined
            );
            const parsed = JSON.parse(result);

            expect(parsed.meta).toBeUndefined();
        });

        it('should not include meta when null', () => 
{
            const result = formatStructuredLog('info', 'Test message', null);
            const parsed = JSON.parse(result);

            expect(parsed.meta).toBeUndefined();
        });

        it('should handle circular references in metadata', () => 
{
            const obj: any = { name: 'test' };
            obj.self = obj;

            expect(() => 
{
                const result = formatStructuredLog('info', 'Test message', obj);
                const parsed = JSON.parse(result);
                expect(parsed.meta.self).toBe('[Circular Reference]');
            }).not.toThrow();
        });

        it('should generate valid ISO timestamp', () => 
{
            const result = formatStructuredLog('info', 'Test message');
            const parsed = JSON.parse(result);

            // Check that timestamp matches ISO 8601 format
            const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            expect(parsed.timestamp).toMatch(isoRegex);
        });

        it('should format warn level', () => 
{
            const result = formatStructuredLog('warn', 'Warning message');
            const parsed = JSON.parse(result);

            expect(parsed.level).toBe('warn');
        });

        it('should format debug level', () => 
{
            const result = formatStructuredLog('debug', 'Debug message');
            const parsed = JSON.parse(result);

            expect(parsed.level).toBe('debug');
        });
    });
});
