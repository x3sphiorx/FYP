/*
Acquire the blockchain module.
Acqurie the block module.
Acquire the cryptohash module.
Acquire the wallet module.
Acquire the transaction module.
*/
const Blockchain = require('./index');
const Block = require('./block');
const { cryptoHash } = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe('Blockchain', () => {
    //Make a fresh blockchain instance; newChain(incoming chain); originalChain before replace; Stub console outputs. (Quiet output) 
    //let blockchain, newChain, originalChain;
    let blockchain, newChain, originalChain, errorMock;

    //Own instance instead of sharing everytime.
    beforeEach(() => {
        blockchain = new Blockchain();

        newChain = new Blockchain();

        originalChain = blockchain.chain;

        //Shifted the errorMock out from the replaceChain method. 
        errorMock = jest.fn();
        //Replace global method with errorMock, logMock.
        global.console.error = errorMock;
    });


    //1.Contain chain array.
    //True & Fasle => .toBe function
    it('contain a `chain` Arrary instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    //2.Blockchain start with Genesis Block.
    //Look at the first item in the Blockchain.chain = Block.genesis.
    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    //3.Ability to add a new block to the chain.
    it('adds a new block to the chain', () => {
        const newTransaction = 'foo bar';
        blockchain.addBlock({ transactions: newTransaction });

        //Accessing the last item in the blockchain.chain array = newData.
        expect(blockchain.chain[blockchain.chain.length - 1].transactions).toEqual(newTransaction);
    });


    //Group of test for validation .
    describe('isValidChain()', () => {

        //When it does not start with genesis.
        describe('when the chain does not start with the genesis block', () => {

            it('returns false', () => {

                //Genesis block not equal to the Genesis block.
                blockchain.chain[0] = { transactions: 'fake-genesis' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        //When it start with genesis.
        describe('when the chain starts with the genesis block and has multiple blocks', () => {

            //Multiple Added Blocks before each tests, reduce duplicate code.
            beforeEach(() => {
                blockchain.addBlock({ transactions: 'Bears' });
                blockchain.addBlock({ transactions: 'Beets' });
                blockchain.addBlock({ transactions: 'Boots' });
            });

            //Invalid block down the chain, lashHash was changed. Return False.
            describe('and a lastHash reference has changed', () => {

                it('return false', () => {

                    //Invalid lastHash field.
                    blockchain.chain[2].lastHash = 'broken-lastHash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            //Invalid field. Return False. 
            describe('and the chain contains a block with an invalid field', () => {

                it('returns false', () => {

                    //Invalid data field.
                    blockchain.chain[2].transactions = 'broken-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            //Invalid block with a jump difficulty, prevent legit block and chains 
            //but with reduce or increase difficulty that dont scale with the dynamic 
            //adjustment of the blockchain difficulty.
            describe('and the chain contains a block with a jumped difficulty', () => {

                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const lastIndex = lastBlock.index;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const transactions = [];

                    //Modified difficulty with a reduction of 3 (Test case)
                    const difficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(lastIndex, timestamp, lastHash, difficulty, nonce, transactions);

                    const corruptedBlock = new Block({
                        lastIndex,
                        timestamp,
                        lastHash,
                        hash,
                        nonce,
                        difficulty,
                        transactions
                    });

                    blockchain.chain.push(corruptedBlock);

                    //Value should be false, since the blockchain contain the corrupted block.
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            //Valid and correct chain. Return True.
            describe('and the chain does not contain any invalid blocks', () => {

                it('returns true', () => {

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });

        });


    });

    /*
    Blockchain replacement method. Replace and synchronization upon peer starting up.
    */
    describe('replaceChain()', () => {

        //Stub console outputs. (Quiet output)
        //let errorMock, logMock;
        let logMock;

        beforeEach(() => {
            //Create temporarily method for test, keep track of method being call while execution.
            //errorMock = jest.fn();
            logMock = jest.fn();

            //Replace global method with errorMock, logMock.
            //global.console.error = errorMock;
            global.console.log = logMock;
        });

        //New chain is not longer.
        describe('when the new chain is not longer', () => {

            beforeEach(() => {
                newChain.chain[0] = { new: 'chain' }

                blockchain.replaceChain(newChain.chain);
            });

            //Don't replace chain.
            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            //Check if errorMock function has been fired.
            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        //New chain is longer.
        describe('when the chain is longer', () => {

            //Multiple added blocks before each tests, reduce duplicate code.
            beforeEach(() => {
                newChain.addBlock({ transactions: 'Bears' });
                newChain.addBlock({ transactions: 'Beets' });
                newChain.addBlock({ transactions: 'Boots' });
            });

            //Chain is invalid.
            describe('and the chain is invalid', () => {

                beforeEach(() => {
                    //Modifying hash of item 2.
                    newChain.chain[2].hash = 'broken-hash';

                    blockchain.replaceChain(newChain.chain);
                });

                //Don't replace chain.
                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            //Chain is valid.
            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                //Replace chain.
                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs about the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                })
            });

        });

        //validateTransaction flag is true to skip the validation, require
        //for some test case.
        describe('and the validateTransaction flag is true', () => {

            it('it calls validTransactionData()', () => {

                const validTransactionDataMock = jest.fn();

                blockchain.validTransactionData = validTransactionDataMock;

                //A a block such that the chain is longer than the original chain.
                newChain.addBlock({ transactions: 'test-data' });

                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
    });

    /*
    Valid transaction data within the blockchain. (Further enchancement)
    */
    describe('validTransactionData()', () => {

        //Declare the transaction variable, the rewardTransaction(simulate block reward), the wallet instance.
        let transaction, rewardTransaction, wallet;

        //Before each test, set new instances before testing.
        beforeEach(() => {

            //New wallet based on the wallet instance.
            wallet = new Wallet();

            //Simulate the transaction by creating a test trasnaction.
            transaction = wallet.createTransaction({
                receiver: 'test-receiver',
                amount: 65
            });

            //Simulate the reward transaction upon miner verify block (mining).
            rewardTransaction = Transaction.rewardTransaction({
                minerWallet: wallet
            });
        });

        /*
        2 situation to cover address the validity of the transaction data.  
        1st when the transaction contains valid transaction data
        2nd when the transaction contain a malformed transaction data.
        */
        describe('and the transaction data is valid', () => {

            it('it returns true', () => {

                //Simulate a new chain with a transaction data and the reward data.
                newChain.addBlock({ transactions: [transaction, rewardTransaction] });

                //Ensure that the simulate chain is valid base on the "OWN, Legit blockchain".
                //Hence, blockchain.validTransaction().
                expect(
                    blockchain.validTransactionData({
                        chain: newChain.chain
                    })
                ).toBe(true);

                //Ensure that the simulate chain doesn't trigger any error and the errorMock not called.
                expect(
                    errorMock
                ).not.toHaveBeenCalled();
            });
        });

        /*
        2nd when the transaction contain a malformed transaction data.
        4 Cases to consider, 
        1st when the transaction data has multiple rewards
        2nd when the transaction data has at least one invalid outputMap.
            a) when the transaction data has a invalid output amount.
            b) when the reward transaction data has invalid output amount.
        3rd when the transaction data has at least one invalid input.
        4th when the transaction data contain multiple identical transaction, unique set of transaction.
        */
        describe('and the transaction data has multiple rewards', () => {

            it('it returns false and logs an error', () => {

                //Simulate multiple rewardTransaction within the block.
                newChain.addBlock({ transactions: [transaction, rewardTransaction, rewardTransaction] });

                //Ensure that the simulate chain is not valid base on the known blockchain 
                //instead of the incoming blockchain
                expect(
                    blockchain.validTransactionData({
                        chain: newChain.chain
                    })
                ).toBe(false);

                //Ensure that the simulate chain trigger the error and the errorMock is called.
                expect(
                    errorMock
                ).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least one invalid outputMap', () => {

            describe('and the transaction is not a reward transaction', () => {

                it('it returns false and logs an error', () => {

                    //Simulate the outputMap of the transaction to have amountof 999k
                    transaction.outputMap[wallet.publicKey] = 999999;

                    //Simulate the blockchain by adding the malformed block into the chain
                    newChain.addBlock({ transactions: [transaction, rewardTransaction] });

                    //Ensure that the simulate chain is not valid base on the known blockchain 
                    //instead of the incoming blockchain
                    expect(
                        blockchain.validTransactionData({
                            chain: newChain.chain
                        })
                    ).toBe(false);

                    //Ensure that the simulate chain trigger the error and the errorMock is called.
                    expect(
                        errorMock
                    ).toHaveBeenCalled();
                });
            });

            describe('and the transaction is a reward transaction', () => {

                it('it returns false and logs an error', () => {

                    //Simulate the outputMap of the reward transaction to have amountof 999k
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;

                    //Simulate the blockchain by adding the malformed block into the chain
                    newChain.addBlock({ transactions: [transaction, rewardTransaction] });

                    //Ensure that the simulate chain is not valid base on the known blockchain 
                    //instead of the incoming blockchain
                    expect(
                        blockchain.validTransactionData({
                            chain: newChain.chain
                        })
                    ).toBe(false);

                    //Ensure that the simulate chain trigger the error and the errorMock is called.
                    expect(
                        errorMock
                    ).toHaveBeenCalled();
                });
            });
        });

        /*
        The input validation should be according to the blockchain history and not the 
        incoming chain from the peer. Prevent attacker from making malformed input.
        */
        describe('and the transaction data has at least one invalid input', () => {

            it('it returns false and logs an error', () => {

                //Simualte a transaction that can pass the valid transaction check 
                //however the blance of the wallet had been modified to simulate a 
                //malicious transaction.
                wallet.balance = 9000;

                //Construct a valid outputMap with a valid public key and a receiver.
                const evilOutputMap = {
                    [wallet.publicKey]: 8900,
                    testReceiver: 100
                };

                //Construct a valid malformed transaction as close as a valid transaction.
                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                }

                //Simulate the block by adding the malformed transaction in the block following by adding to 
                //the chain.
                newChain.addBlock({ transactions: [evilTransaction, rewardTransaction] });

                //Ensure that the simulate chain is not valid base on the known blockchain 
                //instead of the incoming blockchain
                //Hence, blockchain.validTransaction().
                expect(
                    blockchain.validTransactionData({
                        chain: newChain.chain
                    })
                ).toBe(false);

                //Ensure that the simulate chain trigger the error and the errorMock is called.
                expect(
                    errorMock
                ).toHaveBeenCalled();
            });
        });

        /*
        The block should only contain unique set of transaction.
        */
        describe('and the block contain multiple identical transaction', () => {

            it('it returns false and logs an error', () => {

                //Simulate by adding a block on the chain and multiple transaction on the block.
                newChain.addBlock({
                    transactions: [transaction, transaction, transaction, rewardTransaction]
                });

                //Ensure that the simulate chain is not valid base on the known blockchain 
                //instead of the incoming blockchain
                //Hence, blockchain.validTransaction().
                expect(
                    blockchain.validTransactionData({
                        chain: newChain.chain
                    })
                ).toBe(false);

                //Ensure that the simulate chain trigger the error and the errorMock is called.
                expect(
                    errorMock
                ).toHaveBeenCalled();
            });
        });



    });




});