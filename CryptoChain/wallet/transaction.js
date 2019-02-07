/*
Acqurie the uuid modules for the unique id.
Acqurie the verifySignature method for the transaction verification
*/
const uuid = require('uuid/v1');
const { verifySignature } = require('../util');


class Transaction {

    constructor({ senderWallet, receiver, amount }) {
        //Unique ID base on the uuid version 1
        this.id = uuid();

        //OutputMap trigger by calling the helper method and passing in the object
        this.outputMap = this.createOutputMap({ senderWallet, receiver, amount });

        //input trigger by calling the helper method and passing in the object.
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    /*
    Helper method to create the outputMap.
    Take in the object with the senderWallet, receiver and amount.
    */
    createOutputMap({ senderWallet, receiver, amount }) {

        const outputMap = {};

        //Receiver is taking the amount.
        outputMap[receiver] = amount;

        //Deduction from the sender. Balance - amount to be send.
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    /*
    Helper method to create the inputs. 
    senderWallet - require for the signature
    outputMap - data which is to be sign that part of this transaction
    */
    createInput({ senderWallet, outputMap, }) {
        return {

            //Return the timestamp 
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }


    /*
    Validates the transaction
    */
    static validTransaction(transaction) {
        //Destructure input and the transaction strcture.
        const {
            input: { address, amount, signature },
            outputMap
        } = transaction;

        //Check all the values in the outputMap but reduce the 
        //array into a single value.
        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);

        //Function return false if is invalid
        //Check the overrall outputTotal equals to the amount.
        if (amount !== outputTotal) {
            console.error(`Invalid Transaction from this : ${address}.`);
            return false;
        }
        //Chekc if the signature is valid.
        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid Signature from this : ${address}`);
            return false;
        }
        return true;
    }

    /*
    Update function having the ability to add new amount 
    within the transaction ouputMap for a new recevier. 
    */
    update({ senderWallet, receiver, amount }) {

        /*
        Ensure that if the amount is lesser than the amount in the sender wallet.
        Case when senderWallet does not have enough amount.
        */
        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }

        //If the receiver is not within the outputMap
        if (!this.outputMap[receiver]) {
            //Designate the amount to the next receiver. (Not repeated receiver) 
            this.outputMap[receiver] = amount;
        } else {
            //Repeated receiver or already exisit, hence add the amount instead of overwriting. 
            this.outputMap[receiver] = this.outputMap[receiver] + amount;
        }

        //Subtract new amount from the senderWallet publicKey.
        this.outputMap[senderWallet.publicKey] =
            this.outputMap[senderWallet.publicKey] - amount;

        //Recreate the input field by resign.
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }
}

module.exports = Transaction;