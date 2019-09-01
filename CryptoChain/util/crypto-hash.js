/*
Acquire the crypto module.
Acquire the hexToBinary module.
*/

const crypto = require('crypto');
const hexToBinary = require('hex-to-binary');

//n arguments into inputs array 
const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');

    //Added JSON Stringify to map the inputs and converting them to 
    //JSON stringify form. If the properties changes, so does the stringify form
    hash.update(
        inputs.map(
            input => JSON.stringify(input))
        .sort().join(' '));

    //1. Return hash in hex 
    return hash.digest('hex');

    //2. Return hash in binary
    // return hexToBinary(hash.digest('hex'));
};

module.exports = cryptoHash;