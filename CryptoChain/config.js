//Define gensis block diffculty. 
const INITIAL_DIFFICULTY = 2;

//Global mine rate for dynamic adjustment for difficulty system. 1000ms = 1s
const MINE_RATE = 1000;

//Added initial nonce & difficulty field for the gensis data.
const GENESIS_DATA = {
    index: 0,
    lastHash: '0',
    timestamp: 1546300800,
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY,
    transactions: [],
    hash: 'daf309548e39b5f52fb366c009f5dea8113eaa0c8eaf986888f7676f7722e7d3'
};

//Added a starting balance for the new wallet.
const STARTING_BALANCE = 1000;

//Added REWARD INPUT (Hardcoded) & MINING Rewards.
const REWARD_INPUT = { address: '*mining-authorized-reward*' };
const MINING_REWARD = 50;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD
};