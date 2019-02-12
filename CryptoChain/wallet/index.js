/*
Acquire the local transaction class.
Acqurie the starting balance for the wallet.
Acquire the crypto hash modules for hashing before signing the data
Acquire the ec instance to generate keypairs(public & private)
*/
const Transaction = require('./transaction');
const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        //Generate a local keyPair constant.
        this.keyPair = ec.genKeyPair();

        //Convert the Public keyPair to hex format.
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    //Sign the incoming data.
    sign(data) {
        return this.keyPair.sign(cryptoHash(data))
    }

    /*
    Wallet creating transaction method.
    Added the chain into the receiving parameter. 
    */
    createTransaction({ receiver, amount, chain }) {

        //if a chain is passed in and definied.
        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            });
        }

        //if the amount is greater than what left in the wallet balance. Throw error
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance');
        }

        //Return a instance of a transaction class.
        return new Transaction({ senderWallet: this, receiver, amount });
    }

    /*
    Calculate the wallet balance method.
    Added a boolean to track 'hashConductedTransaction'
    */
    static calculateBalance({ chain, address }) {
        let hasConductedTransaction = false;
        let outputsTotal = 0;

        //Loop through the chain in REVERSE. Skip the genesis block.
        //Recent transaction at the end of the chain.
        for (let i = chain.length - 1; i > 0; i--) {

            //Instantiate the individual blocks
            const block = chain[i];

            //Loop through the transactions.
            for (let transaction of block.data) {

                //If the address/wallet has conducted a transaction.
                if (transaction.input.address === address) {
                    hasConductedTransaction = true;
                }

                const addressOutput = transaction.outputMap[address];

                //If the addressOutput is definied.
                if (addressOutput) {
                    outputsTotal += addressOutput;
                }
            }

            //If hasConductedTransaction, break away from forloop.
            if (hasConductedTransaction) {
                break;
            }
        }

        //return only the outputTotal if indeed the wallet has conducted a transaction.
        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }
}

module.exports = Wallet;