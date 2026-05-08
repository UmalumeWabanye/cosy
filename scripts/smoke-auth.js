const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cosy-backend.onrender.com/api';

async function run() {
  try {
    console.log('Checking API health...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('Health response:', health.data);

    console.log('Attempting dummy login (expected to 401)...');
    try {
      const login = await axios.post(`${API_BASE}/auth/login`, {
        email: 'doesnotexist@example.com',
        password: 'badpass'
      });
      console.log('Unexpected login success:', login.data);
    } catch (err) {
      if (err.response) {
        console.log('Login response status:', err.response.status);
        console.log('Login response data:', err.response.data);
      } else {
        console.error('Login request failed:', err.message);
      }
    }
  } catch (err) {
    console.error('Smoke test failed:', err.message || err);
    process.exit(2);
  }
}

run();
