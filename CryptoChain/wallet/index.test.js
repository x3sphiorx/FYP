/*
Wallet structure for the cryptocurrency
1. Give user a pulic address to check balance
2. Track and calculate balance of user by examining blockchain history
3. Conduct official and cryptographic secure transaction with other 
members of the network by generating valid signatures. 
*/

//Acqurie the wallet class.
const Wallet = require('./index');
//Verify Signature method from the util (index.js) to verifiy on the signature
const { verifySignature } = require('../util');

//Describe how the wallet class should be structure
describe('Wallet', () => {

    let wallet;

    //New instance of wallet for every test.
    beforeEach(() => {
        wallet = new Wallet();
    });

    //Key properties present in wallet class - balance
    it('it has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    //Key properties present in wallet class - publicKey
    it('has a `publicKey`', () => {

        //See how the publicKey look like in hex format
        //console.log(wallet.publicKey);

        expect(wallet).toHaveProperty('publicKey');
    });

    //New testing on signing of data. 
    describe('signing data', () => {
        const data = 'foodata';

        //Verification of a signature and valid
        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        //Verification of a signature and invalid 
        //Create a new wallet with a invalid keyPair
        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });


});