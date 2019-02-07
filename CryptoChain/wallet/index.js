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
    //
    sign(data) {
        return this.keyPair.sign(cryptoHash(data))
    }

    //Wallet creating transaction method.
    createTransaction({ receiver, amount }) {

        //if the amount is greater than what left in the wallet balance. Throw error
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance');
        }

        //Return a instance of a transaction class.
        return new Transaction({ senderWallet: this, receiver, amount });
    }
}

module.exports = Wallet;