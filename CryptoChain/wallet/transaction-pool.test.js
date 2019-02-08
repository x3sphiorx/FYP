/*
Acqurie the transaction pool class.
Acquire the transaction class.
Acqurie the wallet class.
*/
const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

//Describe how the transaction pool class
describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;

    /*
    Transaction pool strcuture 
    transactionPool - new instance of transactionPool 
    transaction - new instance of transaction
    senderWallet - new instance of a wallet.
    receiver - person or object receiving the transaction 
    amount - amount to be transacted 
    */
    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            receiver: 'fake-receiver',
            amount: 50
        });
    });

    /*
    Set a transaction by it's id.
    1 - add a transaction.
        expect the transaction is added to the transaction pool.
    */
    describe('setTransaction()', () => {
        it('it adds a transaction', () => {
            transactionPool.setTransaction(transaction);

            //Add the Transaction in the pool.The transaction to be the same as 
            //object that is passing into the function.
            expect(transactionPool.transactionMap[transaction.id])
                .toBe(transaction);
        });
    });

    /*
    Ensure if the transaction by this wallet 
    is already done by exisiting requester. Check by 
    calling the exisitingTransaction method with the 
    local wallet public key.
    */
    describe('exisitingTransaction', () => {
        //Return the transaction given the input address.
        it('it returns an exisiting transaction given an input address', () => {
            transactionPool.setTransaction(transaction);

            //Check the exisiting Transaction in the pool with
            //the input address is a form of transaction.
            expect(
                    transactionPool.exisitingTransaction({ inputAddress: senderWallet.publicKey }))
                .toBe(transaction);

        });
    });


});