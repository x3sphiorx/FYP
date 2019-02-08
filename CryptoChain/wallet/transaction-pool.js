/*

*/
class TransactionPool {
    constructor() {
        this.transactionMap = {};
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
}

module.exports = TransactionPool;