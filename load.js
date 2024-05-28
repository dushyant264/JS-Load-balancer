const http = require('http')
const URL = require('url').URL
const httpproxy = require('http-proxy')

const proxy = httpproxy.createProxyServer({})

const servers = [
    { host: 'localhost', port: 3000, isActive: true },
    { host: 'localhost', port: 3001, isActive: true },
    { host: 'localhost', port: 3002, isActive: true },
    { host: 'localhost', port: 3003, isActive: true }
];

let activeservers = servers.slice()
let currindex = -1
const timeout = 2000

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




