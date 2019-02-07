const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } = require('../util');


class Block {
    /*
    Added nonce and difficulty field for POW 
    */
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {
        //const timestamp = Date.now();
        const lastHash = lastBlock.hash;

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
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp })
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        }
        //1. Mining block with binary leading zeros (fine grain/strict)
        while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
        //2. Mining block with hex leading zeros (relax)
        //while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
            //hash: cryptoHash(timestamp, lastHash, data, nonce, difficulty)
        });
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
        //if greated that mine rate),
        if ((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;

        //Difficulty raise.
        return difficulty + 1;
    }
}

module.exports = Block;