/*
Acqurie the transaction class.
Acqurie the wallet class.
Acquire the verifySignature method from the util folder
*/
const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util')

//Describe how the transaction class
describe('Transaction', () => {
    /*
    Transaction strcuture 
    transaction - refer to the transaction object
    senderWallet - officially creating transaction.
    receiver - person or object receiving the transaction 
    amount - amount to be transacted 
    */
    let transaction, senderWallet, receiver, amount;

    beforeEach(() => {
        //New instance of the wallet class.
        senderWallet = new Wallet();
        receiver = 'receiver-public-key';
        amount = 50;

        //Create the transaction instance, object into the constructor.
        transaction = new Transaction({ senderWallet, receiver, amount });
    });

    //Ensure transaction has a ID.
    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    /*
    Transaction outputMap strcture. Featuring 
    more than 1 receiver. A key for each receiver 
    whose key going to be the amount it receiving.
    */
    describe('outputMap', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipent', () => {
            expect(transaction.outputMap[receiver]).toEqual(amount);
        });

        it('outputs the remaining balance for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey])
                .toEqual(senderWallet.balance - amount);
        });
    });

    /*
    Transaction input strcture. Make the transaction official by 
    including the signature as the input, the senderWallet validates 
    the transaction.
    */
    describe('input', () => {

        //Contain an input property.
        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        });

        //Contains a timestamp property.
        it('has a `timestamp` in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        //Inspect at the transaction input object itself with the amount property
        //equal to the the senderWallet balance.
        it('set the `amount` to the `senderWallet` balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        //Input object contain the senderWallet's publickey. Use to verify 
        //the transaction itself.
        it('sets the `address` to the `senderWallet` publicKey', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        //Verify the signature in the input fields.
        it('signs the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true);
        });
    });

    /*
    Validate transaction method. True or false value. 
    Trust the transaction outputMap data and input object
    */
    describe('validTransaction()', () => {
        let errorMock;

        //Reset errormock to jest function. 
        //Assert if the jest function was called in a cetrain method.
        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;
        });

        /*
        2 Cases when validating the transaction
        1 - transaction is valid.
        2 - transaction is invalid. (Output Map is invalid.) or (Input signature is fake.)
        */
        describe('when the transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        });

        describe('when the transaction is invalid', () => {
            describe('and a transaction outputMap values is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 999999;

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('and the transaction input signature is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.input.signature = new Wallet().sign('Invalid Signature From New Wallet');

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
    });

    /*
    Update function having the ability to add new amount 
    within the transaction ouputMap for a new recevier. 

    Input signature will be changed. (Resign).
    New amount will be deducted from the wallet.
    */
    describe('update()', () => {
        let originalSignature, originalSenderOutput, nextReceiver, nextAmount;

        describe('and the amount is valid', () => {
            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput =
                    transaction.outputMap[senderWallet.publicKey];
                nextReceiver = 'next-receiver';
                nextAmount = 50;

                //Update the transaction from the current senderWallet.
                transaction.update({ senderWallet, receiver: nextReceiver, amount: nextAmount });
            });

            //Ensure that the next receiver is equal to the next amount to be send.
            it('it outputs the amount to the next receiver', () => {
                expect(transaction.outputMap[nextReceiver]).toEqual(nextAmount);
            });

            //Remaining balance is accurate. 
            it('it subtracts the amount from the original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(originalSenderOutput - nextAmount);
            });

            //Total output values is still accurate, reduce the overrall output by callback
            //to accumlate the amount. Must be equal to transaction.input.amount .
            it('it maintains a total output values that still matches the input amount', () => {
                expect(
                        Object.values(transaction.outputMap).reduce(
                            (total, outputAmount) => total + outputAmount))
                    .toEqual(transaction.input.amount);
            });

            //Transaction being resign after adding the neccessary changes. 
            it('transaction is being re-signs', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });

            //Edge cases, when repeated update from the same receiver.
            describe('and another update that came from the same receiver', () => {
                let addedAmount;

                /*
                Assign the addedAmount in the beforeEach, 
                called the update() method
                */
                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update({
                        senderWallet,
                        receiver: nextReceiver,
                        amount: addedAmount
                    });
                });

                //Ensure that the next recevier get the amount.
                it('adds to the receiver amount', () => {
                    expect(transaction.outputMap[nextReceiver])
                        .toEqual(nextAmount + addedAmount);
                });

                //Ensure that the original sender has an apporaite balance after sending.
                it('subtract the amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey])
                        .toEqual(originalSenderOutput - nextAmount - addedAmount);
                })
            });
        });

        //Edge cases, when the amount exceeds balance. 
        describe('and the amount is invalid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({ senderWallet, receiver: 'invalidTestCase', amount: 999999 })
                }).toThrow('Amount exceeds balance');

            });
        });

    });

});;