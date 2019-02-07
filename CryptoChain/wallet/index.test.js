/*
Wallet structure for the cryptocurrency
1. Give user a pulic address to check balance
2. Track and calculate balance of user by examining blockchain history
3. Conduct official and cryptographic secure transaction with other 
members of the network by generating valid signatures. 
*/

/*
Acqurie the wallet class.
Acquire the local transaction class.
Verify Signature method from the util (index.js) to verifiy on the signature
*/

const Wallet = require('./index');
const Transaction = require('./transaction');
const {
    verifySignature
} = require('../util');

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

    //Wallet able to create its own transaction objects
    describe('createTransaction()', () => {
        //Designated amount of the transaction exceed the wallet balance. 
        describe('and the amount exceeds the balance', () => {
            //Throw and returns an error by having absurd test case.
            it('throws an error', () => {
                expect(() => wallet.createTransaction({
                        amount: 99999,
                        receiver: 'foo-receiver'
                    }))
                    .toThrow('Amount exceeds balance');
            });
        });

        //The amount is valid (Go through)
        describe('and the amount is valid', () => {
            let transaction, amount, receiver;

            beforeEach(() => {
                amount = 50;
                receiver = 'foo-receiver';
                transaction = wallet.createTransaction({
                    amount,
                    receiver
                });
            });

            //Transaction is created as a instance of the Transaction class.
            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            //Ensure the signature comes from the sender and the wallet itself.
            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            //Ensure the transaction output has a amount to the recevier
            it('outputs the amount the receiver', () => {
                expect(transaction.outputMap[receiver]).toEqual(amount);
            });
        });
    });
});