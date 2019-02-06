// //Primitives number, strings, boolean, object
// let fooArray = [1, 2, 'foo', 'bar', true, false, { foo: 1, bar: 2 }]
//     //const = cant be reassign (more strict, safe)
//     //const fooArray = [1, 2, 'foo', 'bar', true, false, { foo: 1, bar: 2 }]
// fooArray = ['foo', 'bar', 'goo'];

// console.log(fooArray);

// // for (let i = 0; i < 10; i++) {

// //     if (i == 5) {
// //         console.log('i is 5!!!');
// //     }
// //     //more strict type is both match type
// //     if (i === 5) {

// //     }
// //     //undefinied is neither true or false (==)
// //     console.log(i);
// // }

// //function
// const runLoop = (paramOne, paramTwo) => {
//     for (let i = 0; i < 10; i++) {

//         if (i == 5) {
//             console.log('i is 5!!!');
//         }
//         //more strict type is both match type
//         if (i === 5) {

//         }
//         //undefinied is neither true or false (==)
//         console.log(i);
//     }
//     console.log(paramOne, paramTwo);

//     //execute by the parameter name 
//     paramTwo();
// }

// const logBam = () => console.log('bam');

// //runLoop('zoo', 'bat');

// //Javascript callbacks, pass callback function to runloop
// runLoop('zoo', logBam);




class Lion {
    constructor(name, hairColor) {
        //this - create a special object that can be use to represent any instance of the class
        //own fields of themsleves 
        this.name = name;
        this.hairColor = name;
    }

    logName() {
        console.log('Roar! I am', this.name, '.');
    }
}

const goldenLion = new Lion('Mufasa', 'Golden');
const redLion = new Lion('Scar', 'Red');

console.log(goldenLion);
console.log(redLion);

goldenLion.logName();
redLion.logName();