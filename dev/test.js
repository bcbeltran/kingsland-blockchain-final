const Blockchain = require('./blockchain');

const burbcoin = new Blockchain();

console.log("Creating genesis block...");
burbcoin.createNewBlock(345136, "9f20932909hg0f9f82g2h0h923", "284h284fj920fh028f09jf3");

burbcoin.createNewTransaction("394gh284h8203392i9d", "2ryfhuh297380f8fwe8982", 48578392, "This is data that is sent with the transaction");
burbcoin.createNewTransaction("394gh284h8203392i9d", "2ryfhuh297380f8fwe8982", 392, "This is data that is sent with the transaction");
burbcoin.createNewTransaction("394gh284h8203392i9d", "2ryfhuh297380f8fwe8982", 85783, "This is data that is sent with the transaction");

console.log("These are the pending transactions before creating a new block: ");
console.log(burbcoin.pendingTransactions);


console.log("Creating new block...");
burbcoin.createNewBlock(3745463, "9f202947g928h93f0h923", "82hf928f284h284fj920fh028f09jf3");


console.log("These are the pending transactions after creating a new block: ");
console.log(burbcoin.pendingTransactions);


console.log("This is the block with the transaction in it: ");
console.log(burbcoin.chain[1]);