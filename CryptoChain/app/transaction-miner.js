/*
Miner Transaction Class
1. Grab valid transactions in the pool
2. Generate miner's reward
3. CPU validation of valid hash
4. Broadcast the updated blockchain
5. Clear the transaction pool
*/

/*
Acquire the transaction class.
*/
const Transaction = require('../wallet/transaction');

class TransactionMiner {
    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    //Mine transaction method, call the necessary steps before 
    //adding into the block.
    mineTransactions() {
        //1. Retrieve the transaction pool's valid transaction
        const validTransactions = this.transactionPool.validTransaction();

        //2. Miner incentives, Miner rewards
        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })
        );

        //3. Add a block consisting of these transactions to the blockchain 
        this.blockchain.addBlock({ data: validTransactions });

        //4. Broadcast the new updated blockchain
        this.pubsub.broadcastChain();

        //5. Clear the transaction pool
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;