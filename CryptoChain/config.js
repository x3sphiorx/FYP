//Define gensis block diffculty. 
const INITIAL_DIFFICULTY = 3;

//Global mine rate for dynamic adjustment for difficulty system. 1000ms = 1s
const MINE_RATE = 1000;

//Added initial nonce & difficulty field for the gensis data.
const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '0 exisiting hashes',
    hash: '1st hash from 01-01-2019:12:00:00AM',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

//Added a starting balance for the new wallet.
const STARTING_BALANCE = 1000;

//Added REWARD INPUT (Hardcoded) & MINING Rewards.
const REWARD_INPUT = { address: '*authorized-reward-from-system*' };
const MINING_REWARD = 50;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD
};