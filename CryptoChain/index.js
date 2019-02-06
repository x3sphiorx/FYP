/*
Start up the node.js Express API
Create individual blockchain instance.
*/

/*
Declare express constant from the express module.
Declare the Blockchain class and a blockchain instance.
Declare middleware bodyParser, parse Json body from the body request.
Declare the Publisher and Subscriber class for network communication.
Declare a request module to sync up with the nodes of the blockchan.
*/
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');

/*
Declare a default port (3000). 
Declare an express object by calling the express function.
Declare a blockchain instance.
Declare a pubSub instance.
Declare a root node address.
*/
const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

/*
Experinmental Code 
Test publisher and subscriber function.
Delay with a 1000ms = 1s.
*/
//setTimeout(() => pubsub.broadcastChain(), 1000);

//Tell express to use the middleware - bodyParser.
app.use(bodyParser.json());

/*
Express docket function, get(Type) http request, read, 
2 Parameters in total 
1. End point from the server where it is located. ('/api/blocks').
2. Callback function fired when get request is used. 2 parameter used.
    req - request (requestor specific request).
    res - respond (define how get is respond).
    res.json - respond in json format.
*/
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

/*
Post request to mine a block on the chain.
2 Parameters in total 
1. End point from the server where it is located. ('/api/blocks').
2. Callback function fired when get request is used. 2 parameter used.
    req - request (requestor specific request).
    res - respond (define how get is respond).

Recieved body in Json format.
*/
app.post('/api/mine', (req, res) => {
    //Destructure the data from the body
    const { data } = req.body;

    //Add a new block from the recieved data
    blockchain.addBlock({ data });

    //New chain is broadcasted to the network
    pubsub.broadcastChain();

    //Redirect to the /api/blocks endpoint.
    res.redirect('/api/blocks');
});

/*
Synchronization of the blockchain upon peer emulation start up
Peer get the latest update. 

request(2 parameters)
1. url of the root node address
2. callback function when fired
    error object - error defined if error 
    response object - status code of http get request = 200(successful)
    body object - stringify json response
*/
const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            //Parse the body content.
            const rootChain = JSON.parse(body);

            console.log('replace chain on a sync with', rootChain);

            //Replace chain
            blockchain.replaceChain(rootChain);
        }
    });
};

/*
Listening function, start listening upon startup on the default port
If multiple client, generate a random port (Default + (1 to 1000)).
*/
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT +
        Math.ceil(Math.random() * 1000)
}
/*
2 Parameters in total 
1. Port number (address) by default else generated port.
2. Callback function.
*/
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listen at localhost: ${PORT}`);

    //Only sync the chain if is not the default port(root node).
    //Remove self synchronization of root node with root node.
    if (PORT !== DEFAULT_PORT) {
        //Synchronization by getting the latest update.
        syncChains();
    }

    //Synchronization by getting the latest update. 
    //(removed to avoid root node get update from itself)
    //syncChains();
});