const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PharmaLink backend is running' });
});

app.get('/', (req, res) => {
    res.send('Welcome to the PharmaLink backend!');
    endpoints: {
        health: '/api/health'
    }
    frontend: 'http://localhost:5173'
});

app.listen(PORT, () => {
  console.log(`PharmaLink backend running at http://localhost:${PORT}`);

  
});