const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
    it('it generates a SHA-256 hashed output', () => {
        expect(cryptoHash('foo'))
            .toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
    });

    it('it produces the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three'))
            .toEqual(cryptoHash('three', 'one', 'two'));
    });

    //Allow new changes made to the input 
    //to generate a new unique hash for it.
    it('it produces a unique hash when the properties have changed on an input', () => {
        const testVariable = {};
        const origialHash = cryptoHash(testVariable);
        testVariable['a'] = 'a';

        expect(cryptoHash(testVariable)).not.toEqual(origialHash);
    });
});