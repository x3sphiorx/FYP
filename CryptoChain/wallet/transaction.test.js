const Transaction = require('./transaction');
const Wallet = require('./index');

describe('Transaction', () => {
    let transaction, senderWallet, receiver, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        receiver = 'receiver-public-key';
        amount = 99;

        transaction = new Transaction({ senderWallet, receiver, amount });
    });

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    })


});