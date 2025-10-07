const http = require('http')

async function test() {
  const data = JSON.stringify({ userInput: 'node test payload' })
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/story',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  }

  const req = http.request(options, (res) => {
    let body = ''
    res.on('data', (chunk) => (body += chunk))
    res.on('end', () => {
      console.log('STATUS', res.statusCode)
      try {
        console.log('BODY', JSON.parse(body))
      } catch (e) {
        console.log('BODY (raw)', body)
      }
    })
  })

  req.on('error', (e) => console.error('Request error', e))
  req.write(data)
  req.end()
}

test()
