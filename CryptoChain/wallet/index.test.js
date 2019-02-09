/*
Wallet structure for the cryptocurrency
1. Give user a pulic address to check balance
2. Track and calculate balance of user by examining blockchain history
3. Conduct official and cryptographic secure transaction with other 
members of the network by generating valid signatures. 
*/

/*
Acqurie the wallet class.
Acquire the local transaction class.
Acquire the blockchain class
Verify Signature method from the util (index.js) to verifiy on the signature
Acquire the starting balance for the wallet.
*/

const Wallet = require('./index');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { verifySignature } = require('../util');
const { STARTING_BALANCE } = require('../config');

//Describe how the wallet class should be structure
describe('Wallet', () => {

    let wallet;

    //New instance of wallet for every test.
    beforeEach(() => {
        wallet = new Wallet();
    });

    //Key properties present in wallet class - balance
    it('it has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    //Key properties present in wallet class - publicKey
    it('has a `publicKey`', () => {

        //See how the publicKey look like in hex format
        //console.log(wallet.publicKey);

        expect(wallet).toHaveProperty('publicKey');
    });

    //New testing on signing of data. 
    describe('signing data', () => {
        const data = 'foodata';

        //Verification of a signature and valid
        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        //Verification of a signature and invalid 
        //Create a new wallet with a invalid keyPair
        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    /*
    Wallet able to create its own transaction objects
    */
    describe('createTransaction()', () => {
        //Designated amount of the transaction exceed the wallet balance. 
        describe('and the amount exceeds the balance', () => {
            //Throw and returns an error by having absurd test case.
            it('throws an error', () => {
                expect(() => wallet.createTransaction({
                        amount: 99999,
                        receiver: 'foo-receiver'
                    }))
                    .toThrow('Amount exceeds balance');
            });
        });

        //The amount is valid (Go through)
        describe('and the amount is valid', () => {
            let transaction, amount, receiver;

            beforeEach(() => {
                amount = 50;
                receiver = 'foo-receiver';
                transaction = wallet.createTransaction({
                    amount,
                    receiver
                });
            });

            //Transaction is created as a instance of the Transaction class.
            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            //Ensure the signature comes from the sender and the wallet itself.
            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            //Ensure the transaction output has a amount to the recevier
            it('outputs the amount the receiver', () => {
                expect(transaction.outputMap[receiver]).toEqual(amount);
            });
        });

        //When the chain is passed in.
        describe('and a chain is passed', () => {
            it('it calls `Wallet.calculateBalance`', () => {

                //Check the wallet.calculateBalance is called through jest function.
                const calculateBalanceMock = jest.fn();

                //Restore wallet.calculateBalance after using the jest function
                const originalCalculateBalance = Wallet.calculateBalance;

                //Set the static calculateBalance to the calculateBalanceMock
                Wallet.calculateBalance = calculateBalanceMock;

                //Added with a new blockchain.
                wallet.createTransaction({
                    receiver: 'Test',
                    amount: 10,
                    chain: new Blockchain().chain
                });

                //Ensure that the calculateBalanceMock method have been called.
                expect(calculateBalanceMock).toHaveBeenCalled();

                //Restore wallet.calculateBalance to the calculate balance
                Wallet.calculateBalance = originalCalculateBalance;

            });
        });
    });

    /*
    Calculate the wallet balance.
    */
    describe('calculateBalance()', () => {
        let blockchain;

        //Instantiate the local blockchain instance as a new Blockcahin object
        beforeEach(() => {
            blockchain = new Blockchain();
        });

        //Case No 1, no outputs for the wallet. Return the starting balance.
        describe('and there are no outputs for the wallet', () => {
            it('it returns the `STARTING_BALANCE`', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE);
            });
        });

        //Case No 2, there outputs for the wallet.
        describe('and there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;

            //Instantiate the local transaction instance as a new transaction
            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    receiver: wallet.publicKey,
                    amount: 50
                });

                transactionTwo = new Wallet().createTransaction({
                    receiver: wallet.publicKey,
                    amount: 60
                });

                //Add the transaction into the blockchain
                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });

            //Ensure that the output of the wallet sum up to the total of the 
            //STARTING_BALANCE and all the instatiate transaction.
            it('it adds the sum of all outputs to the wallet balance', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(
                    STARTING_BALANCE +
                    transactionOne.outputMap[wallet.publicKey] +
                    transactionTwo.outputMap[wallet.publicKey]
                );
            });

            //Tracking of wallet making recent transaction, prevention of double spending
            describe('and the wallet has made a transaction', () => {
                let recentTransaction;

                //Ensure that the wallet makes a transaction by 
                //setting recentTransaction to the wallet.createTransaction.
                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        receiver: 'test-receiver',
                        amount: 30
                    });

                    //Add the recentTransaction into the blockchain.
                    blockchain.addBlock({ data: [recentTransaction] });
                });

                //Ensure that the balance is correct after the recent transaction.
                it('it returns the output amount of the recent transaction', () => {
                    //Expect that the calculateBalance from the chain should be equal
                    //to the recent transaction amount.
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });

                //Output from the block with the recent transaction and afterwards are still
                //valid until the wallet makes another transaction
                describe('and there are outputs next to and after the recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction;

                    //Assign the variable
                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            receiver: 'later-test-address',
                            amount: 60
                        });

                        //Miner rewards transaction. (Most relevant as a REWARD TRANSACTION)
                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });

                        //Add the block to the blockchain.
                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });

                        //New Wallet to create this transaction, local wallet as receiver.
                        nextBlockTransaction = new Wallet().createTransaction({
                            receiver: wallet.publicKey,
                            amount: 75
                        });

                        //Add the block to the blockchain.
                        blockchain.addBlock({ data: [nextBlockTransaction] });
                    });

                    //Test that caputes all of the above transaction. Overrall Balance
                    //equals to the addition of all these transaction. 
                    it('it includes the output amount in the returned balance', () => {
                        expect(
                            Wallet.calculateBalance({
                                chain: blockchain.chain,
                                address: wallet.publicKey
                            })
                        ).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] +
                            sameBlockTransaction.outputMap[wallet.publicKey] +
                            nextBlockTransaction.outputMap[wallet.publicKey]
                        )
                    });
                });
            });








        });
    });



});