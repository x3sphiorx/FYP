/*
Acquire the block module.
Acquire the transaction module.
Acquire the wallet module.
Acquire the cryptohash module.
Acquire the REWARD_INPUT and MINING_REWARD from the config file.
*/
const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Blockchain {
    // Chain array Instance
    constructor() {
        // Start with genesis block
        this.chain = [Block.genesis()];
    }

    // Add block function, take in object as its argument
    addBlock({ data }) {
        // Mine block function with the reference of the last block and the data
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        // Push it into the end of the chain.
        this.chain.push(newBlock);
    }


    /*
    Chain Replacement
    Added onSuccess
    Added validateTransaction flag to ignore or skip the validation.
    */
    replaceChain(chain, validateTransaction, onSuccess) {

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

        //Check if the incoming chain with transaction data is correctly 
        //formated and valid (strict)
        if (validateTransaction && !this.validTransactionData({ chain })) {

            //Output error; incoming chain must be valid.
            console.error('The incoming chain has invalid transaction data');

            //Escape out of this function
            return;
        }

        //Added on successful replace chain callback function if is defined. 
        if (onSuccess)
            onSuccess();

        //Output; replacing chain.
        console.log('Replacing chain with', chain);
        this.chain = chain;
    }



    //Chain Validation
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



    /*
    Valid transaction data within the blockchain. (Further enchancement)
    Validation is done based on the current blockchain and not the incoming chain from
    other peers.
    Enforcing the cryptocurrency rules.
    */
    validTransactionData({ chain }) {
        //Iterate the blockchain to enforces the rules.
        //Start from index 1 to skip the gensis block.
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];

            //A constanty of transaction set that is a instance of javascript set class.
            const transactionSet = new Set();

            //Reward transaction counter to ensure that there is only 1 reward transaction per block.
            let rewardTransactionCount = 0;

            //Iterate throught the transaction within the blocks.
            for (let transaction of block.data) {

                //Check and ensure if the transaction if is a kind of reward transaction by comparing
                //the transaction input address with the system REWARD_INPUT.address.
                if (transaction.input.address === REWARD_INPUT.address) {

                    //Increment the reward transaction count
                    rewardTransactionCount += 1;

                    //Ensure that the reward transaction count is never greater than 1. (Malformed Block).
                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit');
                        return false;
                    }

                    //Check the overrall outputMap values and make sure the designated output values 
                    //match the mining reward which is 50 per block reward.
                    //Use object.values to access the transaction outputMap, get the first item if 
                    //the block reward is not equal to 50, is invalid.
                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner rewards amount is invalid.');
                        return false;
                    }
                }
                //When the transaction data is not a reward transaction. 
                else {
                    //Check if the transaction within the block is a valid transaction check.
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid Transactions.');
                        return false;
                    }

                    //Calculate the true balance from the current chain. Validating from the
                    //current blockchain.
                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    //Ensure that the input amount is equal to the true balance. Prevent attacker
                    //from creating a fake balance.
                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount.');
                        return false;
                    }

                    //A collection of unique item. Check and ensure that if the set has the tranaction.
                    //if the transaction exisi, report false and trigger error.
                    if (transactionSet.has(transaction)) {
                        console.error('An identical transaction appears more than once in the block.');
                        return false;
                    }
                    //Transaction set doesn't have the transaction, add the 
                    //transaction to the transaction set.
                    else {
                        transactionSet.add(transaction);
                    }
                }
            }

        }
        return true;
    }

}

module.exports = Blockchain;