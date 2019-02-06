/*
Acqurie the starting balance for the wallet.
Acquire the crypto hash modules for hashing before signing the data
Acquire the ec instance to generate keypairs(public & private)
*/
const { STARTING_BALANCE } = require('../config');
const cryptoHash = require('../util/crypto-hash');
const { ec } = require('../util');

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
}

module.exports = Wallet;