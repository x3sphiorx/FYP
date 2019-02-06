/*
Publisher Subscriber Pattern
Sender - Publish message on specific channel. 
Receiver - Listen to message on the channel.
*/

//Acquire the redis node.js modules
const redis = require('redis');

//Define overrall channel map.
//Added Blockchain network channel.
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

//Publish Subscriber Class.
class PubSub {
    //Added blockchain object to the constructor.
    constructor({ blockchain }) {

        //local blockchain instance is equal to the incoming blockchain instance.
        this.blockchain = blockchain;

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
        if (channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsedMessage);
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
}

//Make an instance of the pubsub class.
//const testPubSub = new PubSub();

//Received a message on the test channel.
//publisher.publish(channel, message)
//Set a delay, all this subscribtion and registration finishes before the publish occurs 
//Timeout for 1000ms = 1s
//setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);

module.exports = PubSub;