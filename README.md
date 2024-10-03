# JSONSortFlow 

EDIT: Now there is a live endpoint available at https://api.anibal-flores.com/$algorithm. For example, you can test the bubble-sort algorithm by making a request to https://api.anibal-flores.com/bubble-sort. Below is an example of how to test the API using a POST request with a JSON body that contains an array of numbers to be sorted.

```
curl -X POST https://api.anibal-flores.com/bubble-sort \
-H "Content-Type: application/json" \
-d '{"numbers": [8, 4, 7, 6, 3]}'
```

Welcome to JSONSortFlow - where sorting meets visualization in the world of JSON-powered awesomeness! 🚀

## Getting Started

### Prerequisites

Make sure you're equipped with Docker and Docker Compose – if not, it's time to level up! 🐳

### Running with Docker

**Clone & Dive In!** 🏊‍♂️

```
git clone https://github.com/Deadlici0us/JSONSortFlow.git
cd JSONSortFlow
```

### Launch the Magic! ✨

```
docker-compose up -d
```

## Testing with Curl

Now, let's play with some numbers! Use curl to test your sorting skills:

### Bubble Sort test 🛁

```
 curl -X POST \
 http://localhost:80/bubble-sort \
 -H 'Content-Type: application/json' \
 -d '{"numbers": [17, 5, 12, 1, 3, 9, 14, 20, 8, 6, 15, 2, 19, 10, 16, 7, 11, 4, 13, 18]}'
```

Replace 80 with the port specified in your sorter.dev.env file (PORT_OUT=80).

### Other Sorting Algorithms

For other sorting algorithms, replace /bubble-sort in the endpoint with the desired algorithm. For example, /quick-sort, /merge-sort, etc.

## Visualizing Sorting Algorithms 📊

The JSONSortFlow output includes two important elements that can be utilized for visualization:

- Indexes 📈
  The indexes array provides information about the indices of the elements being compared or moved in each step of the sorting algorithm.

- Steps 🔄
  The steps array contains the sorted array at each step of the algorithm. You can use this information to create animations and visualize how the sorting algorithm progresses.

## Example from quick-sort algorithm:

### Input:

`{"numbers": [8,4,7,6,3]}`

### Output:

`{"steps":[[3,4,7,6,8],[3,4,7,6,8],[3,4,7,6,8],[3,4,7,6,8],[3,4,7,6,8],[3,4,7,6,8],[3,4,6,7,8]],"indexes":[[0,4],[1,1],[2,2],[3,3],[4,4],[1,1],[2,3]]}`

## Licensing 📜

JSONSortFlow is licensed under the GNU General Public License (GNU GPL) - see the LICENSE file for details.

## Contributing 🤝

We ❤️ contributions! Check out our Contribution Guidelines to join the fun. Whether you're fixing bugs, adding features, or just sharing ideas – let's sort things out together!

## Happy sorting! 🌟
