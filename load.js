
const load = http.createServer((req, res) => {
    // Load balancer
    console.log('Request received by Load Balancer');
    // Forward the request to the server
    proxy.web(req, res, { target: 'http://localhost:3000' });
});