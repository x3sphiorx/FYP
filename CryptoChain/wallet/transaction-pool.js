/*
Acquire the transaction class.
*/
const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    /*
    Clear the transaction from the transaction pool after transaction is verified
    (local).
    */
    clear() {
        this.transactionMap = {};
    }

    /*
    Clear the transaction from the transaction pool after transaction is verified
    (network).
    */
    clearBlockchainTransaction({ chain }) {
        //Loop through the chain, starting at 1, skip the genesis block.
        for (let i = 1; i < chain.length; i++) {
            //Declare the instance of the block.
            const block = chain[i];

            //Loop through the transaction within the blocks.
            for (let transaction of block.transactions) {
                //If the transactionMap contains a value in transaction id , remove the transaction.
                if (this.transactionMap[transaction.id]) {
                    //Remote the reference.
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }

    /*
    Set a transaction by it's id.
    1 - add a transaction.
    */
    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    /*
    Synchronization of the transaction upon peer emulation start up. 
    */
    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    /*
    Ensure if the transaction by this wallet 
    is already done by exisiting requester. Check by 
    calling the exisitingTransaction method with the 
    local wallet public key.
    */
    exisitingTransaction({ inputAddress }) {
        //Get the array of all the transaction by calling Object.values
        const transactions = Object.values(this.transactionMap);

        //Return 1st item by using transaction.find, looping through the transaction if the 
        //inputAddress matches the given inputAddress.
        return transactions.find(
            transaction =>
            transaction.input.address === inputAddress);
    }

    /*
    Ensure if the transaction is valid in the 
    transaction pool
    */
    validTransaction() {
        //Filter the array by a condition in this case to check every 
        //single transaction check if is valid
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction)
        );
    }


}

module.exports = TransactionPool;