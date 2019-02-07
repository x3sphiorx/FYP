const Block = require('./block');
const { cryptoHash } = require('../util');

class Blockchain {
    // Chain array Instance
    constructor() {
        // Start with genesis block
        this.chain = [Block.genesis()];
    }

    // Add block function, take in object as its argument
    addBlock({
        data
    }) {
        // Mine block function with the reference of the last block and the data
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        // Push it into the end of the chain.
        this.chain.push(newBlock);
    }


    //#region Chain Replacement
    replaceChain(chain) {

            //Check the incoming length of chain is lesser or equal to current length of chain 
            if (chain.length <= this.chain.length) {

                //Output error; incoming chain must be longer.
                console.error('The incoming chain must be longer');

                //Escape out of this function
                return;
            }

            //Check if the incoming chain is valid
            if (!Blockchain.isValidChain(chain)) {

                //Output error; incoming chain must be valid.
                console.error('The incoming chain must be valid');

                //Escape out of this function
                return;
            }

            //Output; replacing chain.
            console.log('Replacing chain with', chain);
            this.chain = chain;
        }
        //#endregion


    //#region Chain Validation
    static isValidChain(chain) {

            //Check if genesis block is correct
            //(chain[0]) can be triple equal === block.genesis (strict quality check)
            //Get the JSON stringify method of the chain to check
            if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
                return false;
            };

            //Go through the entire chain at 1, after the genesis block
            for (let i = 1; i < chain.length; i++) {

                //Using js destructuing syntax (inline destructuing).
                //Added nonce & difficulty for POW.
                const {
                    timestamp,
                    lastHash,
                    hash,
                    nonce,
                    difficulty,
                    data
                } = chain[i];

                //Get the hash of the last block.
                const actualLastHash = chain[i - 1].hash;

                //Check the lastHash must be correct. Return False.
                if (lastHash !== actualLastHash) return false;

                //Retrieve the difficulty of the last block. Protection against difficulty jump.
                const lastDifficulty = chain[i - 1].difficulty;

                //Generate a valid hash based on timestamp, lashHash and data.
                //Added nonce & difficulty for POW.
                const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

                //If hash generated is not matching. Return False.
                if (hash !== validatedHash) return false;

                //Protect and ensure that the difficulty of the last block cannot exceed 1 in +ve/-ve
                //Take the absolute of the difference of the dificulty of the previous and current
                //ensure that it does not exceed more than 1.
                if (Math.abs(lastDifficulty - difficulty) > 1) return false;

            }

            return true;
        }
        //#endregion
}

module.exports = Blockchain;