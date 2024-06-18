const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

const windowState = [];

const testServerUrls = {
  'p': 'http://20.244.56.144/test/primes',
  'f': 'http://20.244.56.144/test/fibo',
  'e': 'http://20.244.56.144/test/even',
  'r': 'http://20.244.56.144/test/rand',
};

// Set your access token here
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4NjkyMDE5LCJpYXQiOjE3MTg2OTE3MTksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjUwOWViYmI5LWM4MjgtNDkxMy04OTk3LTAyNjNkMDQzZGVhYyIsInN1YiI6ImFydW11Z2FtYWsuMjFjc2VAa29uZ3UuZWR1In0sImNvbXBhbnlOYW1lIjoiQWZmb2VkbWVkIiwiY2xpZW50SUQiOiI1MDllYmJiOS1jODI4LTQ5MTMtODk5Ny0wMjYzZDA0M2RlYWMiLCJjbGllbnRTZWNyZXQiOiJTQk1yVU9Zc09OYU5uZkdaIiwib3duZXJOYW1lIjoiQXJ1bXVnYW0gQUsiLCJvd25lckVtYWlsIjoiYXJ1bXVnYW1hay4yMWNzZUBrb25ndS5lZHUiLCJyb2xsTm8iOiIyMUNTUjAwOSJ9.eiXoSTXuS2glR-DoGp4RmvFBVybDdfzcMyRHcoG-CUQ";
async function fetchNumbers(type) {
    try {
      const source = axios.CancelToken.source();
      const timeout = setTimeout(() => {
        source.cancel();
      }, 2000);  // Increased timeout to 2000 ms (2 seconds)
  
      const response = await axios.get(testServerUrls[type], {
        cancelToken: source.token,
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      });
      clearTimeout(timeout);
  
      return response.data.numbers || [];
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log(`Request canceled for ${type}`);
      } else {
        console.error(`Error fetching ${type} numbers: `, error.message);
  
        // Log additional error details
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Headers:', error.response.headers);
          console.error('Data:', error.response.data);
        } else if (error.request) {
          console.error('Request:', error.request);
        } else {
          console.error('Error Message:', error.message);
        }
      }
  
      return [];
    }
  }

function updateWindow(newNumbers) {
  const uniqueNumbers = [...new Set(newNumbers)];
  for (const number of uniqueNumbers) {
    if (!windowState.includes(number)) {
      if (windowState.length >= WINDOW_SIZE) {
        windowState.shift();
      }
      windowState.push(number);
    }
  }
}

function calculateAverage() {
  if (windowState.length === 0) return 0;
  const sum = windowState.reduce((acc, num) => acc + num, 0);
  return (sum / windowState.length).toFixed(2);
}

app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;

  if (!testServerUrls[type]) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const newNumbers = await fetchNumbers(type);
  const windowPrevState = [...windowState];

  updateWindow(newNumbers);

  const windowCurrState = [...windowState];
  const avg = calculateAverage();

  res.json({
    numbers: newNumbers,
    windowPrevState,
    windowCurrState,
    avg,
  });
});

app.listen(PORT, () => {
  console.log(`Average Calculator Microservice is running on port ${PORT}`);
});
