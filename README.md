# Simple Node.js Load Balancer

This is a simple implementation of a load balancer in Node.js. The load balancer distributes incoming HTTP requests across multiple server instances to improve scalability and reliability.

## Features

- Round-robin request distribution algorithm
- Health checks to monitor server availability
- Dynamic server registration and deregistration
- Basic logging of request handling

## Requirements

- Node.js (version 10 or higher)

## Installation

1. Clone the repository:

-git clone https://github.com/ddushyant264/JS-Load-Bal.git
   
## Navigate to the project directory:
- cd JS_Load-Bal
  
## Install dependencies:
-npm install

## Start the load balancer:

-npm run start

## Start multiple server instances:
-npm run server on different terminals

## Send Requests
- cURL ADDR_Load_Bal
- cURL ADDR_Load_Bal/health
