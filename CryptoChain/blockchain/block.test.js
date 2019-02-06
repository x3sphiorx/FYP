const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const cryptoHash = require('../util/crypto-hash');

describe('Block', () => {
    //2000ms timestamp.
    const timestamp = 2000;
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];

    /*
    Proof of work requirement, start with a certain number of leading '0's. 
    Added nonce & difficulty.
    Difficulty defines how many leading zero's 
    the blocks generated hash should have.
    Nonce defines how miner create new hashes based 
    on the block data difficulty is satisfied. 
    */
    const nonce = 1;
    const difficulty = 1;

    //Original block instances.
    const block = new Block({ timestamp, lastHash, hash, data, nonce, difficulty });


    it('has a timestamp, lasthash, hash, and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('gensis()', () => {
        const genesisBlock = Block.genesis();
        it('return a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });
        it('return the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({
            lastBlock,
            data,
        });

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block)
                .toBe(true);
        });

        it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
            expect(minedBlock.lastHash)
                .toEqual(lastBlock.hash);
            //Expect Actual => Value
        });

        it('sets the `data`', () => {
            expect(minedBlock.data)
                .toEqual(data);
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp)
                .not
                .toEqual(undefined);
        });

        //SHA-256 generation.
        it('creates a SHA-256 `hash` based on the proper inputs', () => {
            expect(minedBlock.hash)
                .toEqual(
                    cryptoHash(
                        minedBlock.timestamp,
                        minedBlock.nonce,
                        minedBlock.difficulty,
                        lastBlock.hash,
                        data
                    )
                );
        });

        /*
        Check the hash meet the difficulty criteria. 
        Generated hash for this block must have a leading number of 
        zeros that matches the mined block difficulty 

        Added hexToBinary, fine tune mining rate
        */
        it('set a `hash` that matches the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
                .toEqual('0'
                    .repeat(minedBlock.difficulty))
        });

        /*
        Dynamic adjustment of the block difficulty with regards to the 
        speed of blocks generated and mining rate. + or - difficulty by 1
        */
        it('adjust the difficulty', () => {
            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });

    });

    /*
    Dynamic adjustment difficulty system. 
    Raises difficulty for a quickly mined block. 
    Lower difficulty for a slowly mined block.
    */
    describe('adjustDifficulty()', () => {
        it('raises the difficulty for a quickly mined block', () => {
            //Used the block above as a originalBlock 
            //Mine rate subtract by 100ms > increase the diffculty 
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });
        //Mine rate added by 100ms > increase the diffculty 
        it('lowers the difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        //Lowest limit of ajdustDifficulty (Equal to 1)
        it('has a lower limit of 1', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
        })
    });

});