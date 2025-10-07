const http = require('http');
const fs = require('fs');

const data = JSON.stringify({ userInput: { name: 'Preeti', age: '22', occupation: 'AI Developer', background: 'I studied AI', goals: 'Build helpful AI'} });

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/video',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', res.headers);
  const file = fs.createWriteStream('out.mp4');
  res.pipe(file);
  file.on('finish', () => {
    console.log('Saved out.mp4');
    file.close();
  });
});

req.on('error', (e) => console.error('Request error', e));
req.write(data);
req.end();
