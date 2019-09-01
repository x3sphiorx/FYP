/*
Acquire the crypto module.
*/
const crypto = require('crypto');

//Generate a randomID based on the floor or the size of random bytes
const cryptoRandomID = (size) => {
    return crypto.randomBytes(Math.floor(size / 2)).toString('hex');
};

module.exports = cryptoRandomID;