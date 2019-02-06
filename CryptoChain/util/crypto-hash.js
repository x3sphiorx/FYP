const crypto = require('crypto');
const hexToBinary = require('hex-to-binary');

//n arguments into inputs array 
const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');

    hash.update(inputs.sort().join(' '));

    //1. Return hash in hex 
    return hash.digest('hex');

    //2. Return hash in binary
    // return hexToBinary(hash.digest('hex'));
};

module.exports = cryptoHash;