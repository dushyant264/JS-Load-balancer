const http = require('http');
require('dotenv').config();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is healthy');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Server ${process.pid} handled your request.`);
  }
});

const defaultPort = 3000;
const port = process.env.PORT || defaultPort;

server.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`Server ${process.pid} listening on port ${actualPort}`);
});