/*
Publisher Subscriber Pattern
Sender - Publish message on specific channel. 
Receiver - Listen to message on the channel.
*/

//Acquire the redis node.js modules
const redis = require('redis');

/*
Define overrall channel map.
Added Blockchain network channel.
Added Transaction network channel
*/
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

//Publish Subscriber Class.
class PubSub {
    //Added blockchain object to the constructor.
    constructor({ blockchain, transactionPool }) {

        //local blockchain instance is equal to the incoming blockchain instance.
        //local transaction pool instance is equal to the incoming transaction pool instance
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        //Subscriber subscribe to the specific channels.(Code duplication)
        //this.subscriber.subscribe(CHANNELS.TEST);
        //this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);

        //Generic function to subscribe to the channels.
        //Change to a function to dynamic subscribe to channels.
        this.subscribeToChannels();

        //Handle incoming message via callback function.
        //2 Parameters in total. 
        //1. string of 'message' - message event.
        //2. Callback function fired when message even is received. 2 parameter used.
        //  channel - channel it get fired.
        //  message - message it is receiving.
        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage(channel, message)
        );
    }

    //Helper method. take a channel and a message.
    handleMessage(channel, message) {
        //Log the message.
        console.log(`Message received. Channel :${channel}. Message :${message}.`);

        //Parsing the incoming message. 
        const parsedMessage = JSON.parse(message);

        //If the incoming Message is publish via the BLOCKCHAIN Channel
        //then replace the chain if and only if it is a valid one with the longest
        //length.
        //if (channel === CHANNELS.BLOCKCHAIN) {
        //    this.blockchain.replaceChain(parsedMessage);
        //}

        //Replace with a switch statement.
        //Added transaction channel message handler.
        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                //Added Upon replacing the blockchain, clear the transaction already in the blockchain.
                //by calling the callback function to clearBlockchainTransaction with the parsedMessage.
                this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransaction({
                        chain: parsedMessage
                    });
                });
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }

    /*
    Automatically subscription
    Iterate through all the channels in the channel map
    and then subscribe to the channel.
    */
    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }

    /*
    Helper method to help the instance publish the message through the channel.
    Pass in the channel and the message. 
    */
    publish({ channel, message }) {
        //Unsubscribe from the channel first, publish then resubscribe again.
        //Remove redundant duplicated message of self publishing.
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });

        //this.publisher.publish(channel, message);
    }

    /*
    Blockchain interaction behaviour
    1. Broadcast the chain on the network.
    2. Replacing the chain when received a valid block message. 
    */
    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            //Only publish string messages over the channel; Wrap in JSON.
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    /*
    Broadcast the transaction
    1. Broadcast the transaction on the network.
    */
    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            //Only publish string messages over the channel; Wrap in JSON.
            message: JSON.stringify(transaction)
        });
    }
}

//Make an instance of the pubsub class.
//const testPubSub = new PubSub();

//Received a message on the test channel.
//publisher.publish(channel, message)
//Set a delay, all this subscribtion and registration finishes before the publish occurs 
//Timeout for 1000ms = 1s
//setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);

module.exports = PubSub;