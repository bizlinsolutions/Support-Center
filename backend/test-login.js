const fetch = require('node-fetch');

async function testLogin() {
  const res = await fetch('http://localhost:5001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'adithya@theesaanam.com', password: 'admin123' })
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
}

testLogin().catch(console.error);
