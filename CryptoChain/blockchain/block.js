const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } = require('../util');
const { MINING_REWARD } = require('../config');


class Block {
    /*
    Added nonce and difficulty field for POW 
    */
    constructor({ index, hash, lastHash, timestamp, transactions, nonce, difficulty }) {
        this.index = index;
        this.lastHash = lastHash;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.transactions = transactions;
        this.hash = hash;
    }

    toHash() {
        return cryptoHash(this.index, this.timestamp, this.nonce, this.difficulty, this.lastHash, this.transactions);
    }

    static genesis() {
        let block = new Block(GENESIS_DATA);
        block.hash = block.toHash();
        return block;
    }

    static mineBlock({ lastBlock, transactions }) {
        //const timestamp = Date.now();
        const lastHash = lastBlock.hash;

        //Get the current length of the chain from the previous block.
        const index = lastBlock.index + 1;

        //Change to let, reset on every loop
        let hash, timestamp;

        /*
        Added nonce & difficulty field for POW
        grab the difficulty of the last block 
        set the local difficulty by destructuring
        the lastBlock constant. 
        
        Dynamic nonce variable, adjust while 
        going throught mining block algorithm
        */
        let { difficulty } = lastBlock;

        let nonce = 0;

        /*
        To pass difficulty requirements, loop until the difficulty 
        criteria is achieved. Check the sub string of the hash have
        achieved a cetrain number of zeros.
        */
        do {
            //Increment the nonce, changes on everyloop.
            nonce++;
            timestamp = Math.floor(Date.now() / 1000);
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
            hash = cryptoHash(index, timestamp, nonce, difficulty, lastHash, transactions);
            //console.log(index, timestamp, nonce, difficulty, lastHash, data);
        }
        //1. Mining block with binary leading zeros (fine grain/strict)
        while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
        //2. Mining block with hex leading zeros (relax)
        //while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({
            index,
            lastHash,
            timestamp,
            nonce,
            difficulty,
            transactions,
            hash
            //hash: cryptoHash(timestamp, lastHash, data, nonce, difficulty)
        });
    }

    static getReward() {
        return MINING_REWARD;
    }

    /*
    Dynamic adjustment difficulty system. 
    */
    static adjustDifficulty({ originalBlock, timestamp }) {
        //Destruct from the originalBlock
        const { difficulty } = originalBlock;

        //Lowest limit of adjustDifficulty, 1 leading zeros (minimum 1)
        if (difficulty < 1) return 1;

        //Difficulty lowered (incoming timestamp vs original timestamp, 
        //if greater that mine rate),
        if ((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;

        //Difficulty raise.
        return difficulty + 1;
    }
}

module.exports = Block;