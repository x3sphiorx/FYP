 /*
 Experiment file to test for the efficiency of mining of leading zeros in hex vs in binary form 
 Fine tune the efficiency of the proof of work system due to dynamic implemenation of adjusting 
 the difficulty based on the timestamp (millis) and the mining rate.  
 */

 //Make a instance of the blockchain class
 //Acquire the blockchain file.
 const Blockchain = require('../blockchain');

 //Create a blockchain instance of the Blockchain class
 const blockchain = new Blockchain();

 //Adding a block based on the differences of timestamp between each new block 
 //Timestamp based on millis based on 1st Jan 1970
 blockchain.addBlock({ data: 'initial' });

 //Variables for checking the average time taking to mine block.
 let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average

 //Average time in a times array
 const times = [];

 //Loop up to 10000
 for (let i = 0; i < 10000; i++) {

     //Track the previous timestamp from the previous block 
     prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

     //Add a block with a unique data, data get from the i variable
     //Backticks `` - Template literals are string literals allowing embedded expressions.
     //${} - string interpolation
     blockchain.addBlock({ data: `block ${i}` });
     nextBlock = blockchain.chain[blockchain.chain.length - 1];

     console.log('first block', blockchain.chain[blockchain.chain.length - 1]);

     //Calculate the time difference from mining the block
     nextTimestamp = nextBlock.timestamp;
     timeDiff = nextTimestamp - prevTimestamp;
     times.push(timeDiff);

     //Calculate average from the times array
     //Use js reduce function, which reduce the array to a single value
     //The single value is kept in a total variable
     //Num - to capture the using of 1 itme at a time,
     //Callback function to iterate the num and add to the growing total
     //Calculate average by divding by the length of the times array.
     average = times.reduce((total, num) => (total + num)) / times.length;

     console.log(`Time to mine block: ${timeDiff}ms. \t Difficulty: ${nextBlock.difficulty}. \t Average time: ${average}ms`);

     /*
     End result; Average time of mining did not increase to a average of 1000ms due
     to the efficency of the operating system & node js. 
     */
 }