const fs = require('fs');
const path = require('path');

async function run() {
  // 1. Login
  const loginRes = await fetch('https://psi-carla-martinez.vercel.app/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Carla Martinez', password: 'Martinez2026' })
  });
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Cookies:', cookies);
  
  if (!loginRes.ok) {
    console.error('Login failed', await loginRes.text());
    return;
  }

  // 2. Upload
  const formData = new FormData();
  formData.append('file', new Blob(['test file content'], { type: 'text/plain' }), 'test.txt');

  const uploadRes = await fetch('https://psi-carla-martinez.vercel.app/api/admin/upload', {
    method: 'POST',
    headers: {
      'Cookie': cookies
    },
    body: formData
  });

  const uploadText = await uploadRes.text();
  console.log('Upload Status:', uploadRes.status);
  console.log('Upload Response:', uploadText);
}

run();
