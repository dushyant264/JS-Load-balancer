const http = require('http')
const URL = require('url').URL
const httpproxy = require('http-proxy')

const proxy = httpproxy.createProxyServer({})

const servers = [
 
];

let activeservers = servers.slice()
let currindex = -1
const timeout = 2000

/* Registry server */

const registryServer = http.createServer((req, res)=>{
    if(req.method==='POST'){
        let body='';
        req.on('data',(chunk)=>{body+=chunk.toString();});

        req.on('end',()=> {
            const serverInfo=JSON.parse(body);
            const serverURL=new URL(`http://${serverInfo.host}:${serverInfo.port}`);

            if(!servers.find(server=>server.host===serverURL.host&&server.port===serverURL.port)){
                servers.push(serverInfo);
                activeservers.push(serverInfo);
                console.log(`Server ${serverURL} added to the registry`);
                res.writeHead(200,{'Content-Type':'text/plain'});
                res.end('Server added to the registry');
            }
            else{
                res.writeHead(200,{'Content-Type':'text/plain'});
                res.end('Server already registered');
            }
        });
    } else{
        res.writeHead(404,{'Content-Type':'text/plain'});
        res.end('Invalid request');
    }
})

/* registry server port */

const registryPort=5174;
registryServer.listen(registryPort,()=>{console.log(`Registry server started on port ${registryPort}`)})

/* Health Check */
function healthcheck() {
    servers.forEach((server) => {
        const url = new URL(`http://${server.host}:${server.port}/health`);
        const req = http.request(new URL(url), (res) => {
            if(res.statusCode===200){
                server.isActive=true
                if(!activeservers.includes(server)){
                    activeservers.push(server)
                }
            }
            else{
                server.isActive=false
                const index=activeservers.indexOf(server)
                if(index>-1){
                    activeservers.splice(index,1)
                }
            }
        });

        req.on('error', ()=>{
            server.isActive=false
            const index=activeservers.indexOf(server)
            if(index>-1){
                activeservers.splice(index,1)
            }
        });

        req.end();
    });
};

/*round robin to choose servers*/

function getNextServer(){
    if(activeservers.length==0){
        throw new Error('No active servers')
    }
    currindex=(currindex+1)%activeservers.length
    return activeservers[currindex]
}

/*foward the request*/ 

function forwardRequest(req,res){
    try{
        const nextServer=getNextServer();
        console.log(`Forwarding request to ${nextServer.host}:${nextServer.port}`);

        proxy.web(req,res,{target:`http://${nextServer.host}:${nextServer.port}`});
    } catch(err){
        console.error(err.message);
        res.status(500).send('No active servers');
    }
}

/*load balancer server*/

const loadBalancer= http.createServer((req,res)=>{
    if(req.url==='/health'){
        res.writeHead(200);
        res.end('OK');
        return;
    } else{
        forwardRequest(req,res);
    }
});

/*start the server load bal*/

const port = process.env.PORT || 5173;
loadBalancer.listen(port,()=>{
    console.log(`Load balancer started on port ${port}`);
});

/*health check every 2 seconds*/

setInterval(healthcheck,timeout);




