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
Declare a Transaction Pool module to add transaction to pool
Declare a Wallet module to create transaction.
Declare a Transaction Miner module to mine the transaction via miner.
*/
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet/');
const TransactionMiner = require('./app/transaction-miner');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const path = require('path');
const timeago = require('timeago.js');

const { MINING_REWARD } = require('./config');

/*
Declare a default port (3000). 
Declare an express object by calling the express function.
Declare a blockchain instance.
Declare a TransactionPool instance
Declare a Wallet instance
Declare a pubSub instance.
Declare a tansactionMiner instance.
Declare a root node address.
*/
const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const serveIndex = require('serve-index');
const serveStatic = require('serve-static');

/*
Experinmental Code 
Test publisher and subscriber function.
Delay with a 1000ms = 1s.
*/
//setTimeout(() => pubsub.broadcastChain(), 1000);

//Tell express to use the middleware - bodyParser.
app.use(bodyParser.json());

var options = {
    customCss: '.swagger-ui .topbar { display: none } '
};


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/**for files */
//app.use(serveStatic(path.join(__dirname, 'public')));
/**for directory */
//app.use('/', express.static('public'), serveIndex('public', { 'icons': true }))

// Request to `/static/some/dir/` will be mapped to `__dirname/public/some/dir/`
app.use(serveStatic(path.join(__dirname, 'public')));

app.locals.formatters = {
    time: (rawTime) => {
        const timeInMS = new Date(rawTime * 1000);
        return `${timeInMS.toLocaleString()} - ${timeago().format(timeInMS)}`;
    },
    timeFor: (rawTime) => {
        const timeInMS = new Date(rawTime * 1000);
        return `${timeInMS.toLocaleString()}`;
    },
    hash: (hashString) => {
        return hashString != '0' ? `${hashString.substr(0, 5)}...${hashString.substr(hashString.length - 5, 5)}` : '<empty>';
    },
    address: (hashString) => {
        return hashString != '0' ? `${hashString.substr(0, 10)}...${hashString.substr(hashString.length - 5, 5)}` : '<empty>';
    },
    amount: (amount) => amount.toLocaleString()
};

/*
Express docket function, get(Type) http request, read, 
2 Parameters in total 
1. End point from the server where it is located. ('/api/blockchain').
2. Callback function fired when get request is used. 2 parameter used.
    req - request (requestor specific request).
    res - respond (define how get is respond).
    res.json - respond in json format.
*/
app.get('/blockchainUI', (req, res) => {
    if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        res.render('blockchainUI/index.pug', {
            pageTitle: 'Cryptochain',
            blocks: blockchain.chain,
            miningRewards: MINING_REWARD
        });
    } else {
        res.status(400)
            .send(`Accept content not supported`);
    }
});

app.get('/blockchainTRXP', (req, res) => {
    if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        res.render('blockchainUI/trx/index.pug', {
            pageTitle: 'Transaction Pool',
            trxP: transactionPool.transactionMap
        });
    } else {
        res.status(400)
            .send(`Accept content not supported`);
    }
});

app.get('/api/blockchain', (req, res) => {
    //res.json(blockchain.chain);
    res.status(200).json(blockchain.chain);
});

app.get('/api/blockchain/blocks/:index', (req, res) => {
    let blockFound = blockchain.getBlockByIndex(parseInt(req.params.index));

    if (blockFound == null) {
        res.status(404)
            .send(`Block with index '${req.params.index}' was not found in the Blockchain.`);
    }

    res.status(200).send(blockFound);
});

app.get('/api/blockchain/blocks/:hash([a-zA-Z0-9]{64})', (req, res) => {
    let blockFound = blockchain.getBlockByHash(req.params.hash);

    if (blockFound == null) {
        res.status(404)
            .send(`Block with hash '${req.params.hash}' was not found in the Blockchain.`);
    }

    res.status(200).send(blockFound);

});


app.get('/api/blockchain/blocks/transaction/:transactionHash([a-zA-Z0-9]{64})', (req, res) => {
    let transactionFromBlock = blockchain.getTransactionFromBlocksByHash(req.params.transactionHash);

    if (transactionFromBlock == null) {
        res.status(404)
            .send(`Block with Transaction Hash '${req.params.transactionHash}' was not found in the Blockchain.`);
    }

    res.status(200).send(transactionFromBlock);

});



/*
Post request to mine a block on the chain.
2 Parameters in total 
1. End point from the server where it is located. ('/api/blockchain').
2. Callback function fired when get request is used. 2 parameter used.
    req - request (requestor specific request).
    res - respond (define how get is respond).

Recieved body in Json format.
*/
app.post('/api/mine', (req, res) => {
    //Destructure the data from the body
    const { transactions } = req.body;

    //Add a new block from the recieved data
    blockchain.addBlock({ transactions });

    //New chain is broadcasted to the network
    pubsub.broadcastChain();

    //Redirect to the /api/blockchain endpoint.
    res.redirect('/api/blockchain');
});


/*
Conduct a transaction, by calling the wallet to create transaction.
Input - receiver and the amount to be send over.
 */
app.post('/api/transact', (req, res) => {
    //Destructure the data from the body.
    const { amount, receiver } = req.body;

    /*
    Ensure if the transaction by this wallet 
    is already done by exisiting requester. Check by 
    calling the exisitingTransaction method with the 
    local wallet public key.
    */
    let transaction = transactionPool.exisitingTransaction({ inputAddress: wallet.publicKey });

    //Try catch block to catch the error of invalid, insufficient amount to be send.
    try {
        if (transaction) {
            //Update to the transaction when requester is making subsequent transaction
            //in short, repeated transaction from the same person.
            transaction.update({ senderWallet: wallet, receiver, amount });
        } else {
            //Create a new transaction by passing the receiver 
            //and amount to the local wallet.
            //Added the local instance blockchain.
            transaction = wallet.createTransaction({
                receiver,
                amount,
                chain: blockchain.chain
            });
        }
    }
    //Catch the error and return a http status of 400, type of error with error message.
    catch (error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }

    //Pass the transaction in to transaction pool.
    transactionPool.setTransaction(transaction);

    //Notify/Broadcast all interested part of the update to the transaction
    pubsub.broadcastTransaction(transaction);

    //Log the transaction.
    //console.log('transactionPool', transactionPool);

    //Respond with a JSON to the transaction itself
    res.json({ type: 'success', transaction });
});


/*
Retrieve data from the transaction pool map.
 */
app.get('/api/trans-pool', (req, res) => {
    res.json(transactionPool.transactionMap);
});


/*
Retrieve the transaction miner and mine the transaction, as a "Miner"
 */
app.get('/api/mine-trans', (req, res) => {
    transactionMiner.mineTransactions();

    res.redirect('/api/blockchain')
});


/*
Retrieve the wallet balance.
*/
app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;

    res.json({
        address,
        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address
        })
    });
});


/*
Synchronization of the blockchain upon peer emulation start up
Synchronization of the transaction upon peer emulation start up. 
Peer get the latest update. 


request(2 parameters)
1. url of the root node address
2. callback function when fired
    error object - error defined if error 
    response object - status code of http get request = 200(successful)
    body object - stringify json response
*/
const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blockchain` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            //Parse the body content.
            const rootChain = JSON.parse(body);

            console.log('replace chain on a sync with', rootChain);

            //Replace chain
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/trans-pool` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            //Parse the body content.
            const rootTransactionPoolMap = JSON.parse(body);

            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);

            //Replace the entire transaction pool map
            transactionPool.setMap(rootTransactionPoolMap);
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

const HOST = "127.0.0.1";

this.server = app.listen(PORT, HOST, () => {

    //Display the address of the API document on the console. 
    console.info(`Listening http on port: ${PORT}.`);
    console.info(`API documentation go to http://${HOST}:${PORT}/api-docs/`);

    //Only sync the chain if is not the default port(root node).
    //Remove self synchronization of root node with root node.
    if (PORT !== DEFAULT_PORT) {
        //Synchronization by getting the latest update.
        syncWithRootState();
    }

    //Synchronization by getting the latest update. 
    //(removed to avoid root node get update from itself)
    //syncChains();
})