 /*
        Acquire the elliptic ec module.
        Acquire the cryptoHash module for data hashing.
        */
 const EC = require('elliptic').ec;
 const cryptoHash = require('./crypto-hash');

 //Local instance of the EC class.
 const ec = new EC('secp256k1');

 /*
 Verify signature method. 
 1 Object with 3 fields require.
    publicKey
    data
    signature
 */
 const verifySignature = ({ publicKey, data, signature }) => {
     /*
     EC instance provide an verify signature method. Wrap the EC
     verify method around this verifySignature method.
    
     Get the publicKey from the keyFromPublic method by passing
     in the incoming publicKey in hex format.
     */
     const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

     //Verify takes in "Hash" form only.
     return keyFromPublic.verify(cryptoHash(data), signature);
 };

 module.exports = { ec, verifySignature };