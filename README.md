# JSONSortFlow 

JSONSortFlow is a powerful backend API designed for visualizing sorting algorithms. It processes an array of numbers and returns a step-by-step breakdown of the sorting process, including the state of the array at each step and the specific indices being compared or moved.

## 🌐 Live Demo & Visualization

You can see this backend in action through the visual interface at: 👉 https://anibal-flores.com/sorter

There is also a live API endpoint available for testing: `api.anibal-flores.com/$algorithm` (e.g., /bubble-sort)

Below is an example of how to test the API using a POST request with a JSON body that contains an array of numbers to be sorted.

```
curl -X POST https://api.anibal-flores.com/bubble-sort \
-H "Content-Type: application/json" \
-d '{"numbers": [8, 4, 7, 6, 3]}'
```

## 🛠 Features

- Step-by-Step Execution: Returns every transformation of the array.

- Index Tracking: Identifies which elements are being interacted with at each step (perfect for UI animations).

- Multiple Algorithms: Supports Bubble Sort, Quick Sort, Merge Sort, and more.

- Docker Ready: Easy deployment with Docker and Docker Compose.

### Deployment with Docker

The easiest way to get JSONSortFlow running locally is using Docker Compose.

### 1. Clone the Repository

```
git clone https://github.com/Deadlici0us/JSONSortFlow.git
cd JSONSortFlow
```

### 2. Launch with Docker Compose

```
docker-compose up -d
```

The server will start by default on port `80`

## 🧪 How to Test

Once the server is running, you can test the algorithms using `curl` or any API client like Postman.

```
 curl -X POST \
 http://localhost:80/bubble-sort \
 -H 'Content-Type: application/json' \
 -d '{"numbers": [17, 5, 12, 1, 3, 9, 14, 20, 8, 6, 15, 2, 19, 10, 16, 7, 11, 4, 13, 18]}'
```

### Available Endpoints

Replace `/bubble-sort` with any of the following to test different algorithms:

- `/quick-sort`

- `/merge-sort`

### Expected Output Structure

The API returns a JSON object containing steps and indexes:

- steps: An array of arrays showing the state of the list after each operation.

- indexes: The specific indices involved in that step (e.g., [0, 1] for comparing the first two elements).

### Example from quick-sort algorithm:

### Input:

`{"numbers": [8,4,7,6,3]}`

### Output:

`{"steps":[[3,4,7,6,8],[3,4,7,6,8],[3,4,7,6,8],[3,4,7,6,8],[3,4,7,6,8],[3,4,7,6,8],[3,4,6,7,8]],"indexes":[[0,4],[1,1],[2,2],[3,3],[4,4],[1,1],[2,3]]}`

## 🏗 Development

If you want to run it without Docker:

1. Install dependencies: `npm install`

2. Start in dev mode: `npm run dev`

3. Build for production: `npm run build`

## 📜 Licensing

JSONSortFlow is licensed under the GNU General Public License (GNU GPL) - see the LICENSE file for details.

## 🤝 Contributing

We ❤️ contributions! Check out our Contribution Guidelines to join the fun. Whether you're fixing bugs, adding features, or just sharing ideas – let's sort things out together!

### Happy sorting!
