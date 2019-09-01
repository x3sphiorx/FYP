/*
Acqurie the transaction pool class.
Acquire the transaction class.
Acqurie the wallet class.
Acquire the blockchain class.
*/
const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

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

    /*
    Ensure if the transaction is valid in the transaction pool
    */
    describe('validTransaction()', () => {
        let validTransactions, errorMock;

        //Set the local instance variable and the errorMock logging
        beforeEach(() => {
            validTransactions = [];

            errorMock = jest.fn();
            global.console.error = errorMock;

            //Build up a new transaction upon each loops.
            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    receiver: 'any-receiver',
                    amount: 30
                });

                //Make the transaction invalid by messing the amount and the signatures 
                //3,6,9 will have amount set to 999999
                //1,4,7 will have signature assign to a new wallet with the fake signature
                //Other cases will be push into validTransaction
                if (i % 3 === 0) {
                    transaction.input.amount = 999999;
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign('fake-signature');
                } else {
                    validTransactions.push(transaction);
                }

                transactionPool.setTransaction(transaction);
            }
        });

        //Ensure if the transactionPool transaction is valid.
        it('it returns valid transaction', () => {
            expect(transactionPool.validTransaction()).toEqual(validTransactions);
        });

        //Ensure if error is log into the errorMock
        it('it logs errors for the invalid transaction', () => {
            transactionPool.validTransaction();
            expect(errorMock).toHaveBeenCalled();
        })
    });

    /*
    Clear the transaction from the transaction pool after transaction is verified
    (local).
    */
    describe('clear()', () => {
        ('it clears the transaction', () => {
            transactionPool.clear();

            //Clear and expect the transactionMap is equal to a blank object
            expect(transactionPool.transactionMap).toEqual({});
        })
    })

    /*
    Clear the transaction from the transaction pool after transaction is verified
    (network). *More Safe
    */
    describe('clearBlockchainTransaction()', () => {
        it('it clears the pool of any exisiting blockchain transactions', () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            //Loop 6 times, making transaction and setting it to the pool.
            for (let i = 0; i < 6; i++) {
                const transaction = new Wallet().createTransaction({
                    receiver: 'test-receiver',
                    amount: 20
                });

                transactionPool.setTransaction(transaction);

                //Half of the time add to the block, while half of the time is at
                //the expectedTransactionMap.
                //Even iteration - add to the blockchain.
                if (i % 2 === 0) {
                    blockchain.addBlock({ transactions: [transaction] })
                } else {
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            //Remove those transaction from the local blockchain array.
            transactionPool.clearBlockchainTransaction({ chain: blockchain.chain });

            //Only expectedTransactionMap remain in the transaction pool.
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
});