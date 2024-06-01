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

/* register servers*/

function registryServer(host, port){
  const serverURL=JSON.stringify({host,port});
  const options={
    hostname:'localhost',
    port:5174,
    path:'/',
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Content-Length':serverURL.length
    }
  };

  const req=http.request(options,(res)=>{
    console.log(`Server registration status  ${res.statusCode}`);
    res.on('data',(chunk)=>{
      console.log(chunk.toString());
    });
  });
  req.on('error',(error)=>{
    console.error(error);
  });
  req.write(serverURL);
  req.end()
}


server.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`Server ${process.pid} listening on port ${actualPort}`);
  registryServer(`localhost`, actualPort);
});