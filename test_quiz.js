const http = require('http');

const data = JSON.stringify({
  type: 'course',
  referenceId: 'E8KqnIzR9Imw79iKiest',
  interest: 'cricket',
  mode: 'casual'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-quiz',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
