//Acqurie the block and the blockchain class.
const Blockchain = require('./index');
const Block = require('./block');
const { cryptoHash } = require('../util');


describe('Blockchain', () => {
    //Make a fresh blockchain instance; newChain(incoming chain); originalChain before replace.
    let blockchain, newChain, originalChain;

    //Own instance instead of sharing everytime.
    beforeEach(() => {
        blockchain = new Blockchain();

        newChain = new Blockchain();

        originalChain = blockchain.chain;
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
        const newData = 'foo bar';
        blockchain.addBlock({ data: newData });

        //Accessing the last item in the blockchain.chain array = newData.
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    //#region Chain Validation.

    //Group of test for validation .
    describe('isValidChain()', () => {

        //When it does not start with genesis.
        describe('when the chain does not start with the genesis block', () => {

            it('returns false', () => {

                //Genesis block not equal to the Genesis block.
                blockchain.chain[0] = { data: 'fake-genesis' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        //When it start with genesis.
        describe('when the chain starts with the genesis block and has multiple blocks', () => {

            //Multiple Added Blocks before each tests, reduce duplicate code.
            beforeEach(() => {
                blockchain.addBlock({ data: 'Bears' });
                blockchain.addBlock({ data: 'Beets' });
                blockchain.addBlock({ data: 'Boots' });
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
                    blockchain.chain[2].data = 'broken-data';

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
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    //Modified difficulty with a reduction of 3 (Test case)
                    const difficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                    const corruptedBlock = new Block({
                        timestamp,
                        lastHash,
                        hash,
                        nonce,
                        difficulty,
                        data
                    });

                    blockchain.chain.push(corruptedBlock);

                    //Value should be false, since the blockchain contain the corrupted block.
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                })
            });

            //Valid and correct chain. Return True.
            describe('and the chain does not contain any invalid vlocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });

        });


    });

    //#endregion

    //#region Chain Replacement.

    describe('replaceChain()', () => {

        //Stub console outputs. (Quiet output)
        let errorMock, logMock;

        beforeEach(() => {
            //Create temporarily method for test, keep track of method being call while execution.
            errorMock = jest.fn();
            logMock = jest.fn();

            //Replace global method with errorMock, logMock.
            global.console.error = errorMock;
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
                newChain.addBlock({ data: 'Bears' });
                newChain.addBlock({ data: 'Beets' });
                newChain.addBlock({ data: 'Boots' });
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

    });
    //#endregion

});