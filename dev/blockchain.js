const sha256 = require('sha256');

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 5;
    //this.miningJobs = [];
}

Blockchain.prototype.createNewBlock = function(nonce, prevBlockHash, blockHash) {
    const newBlock = {
        index: this.chain.length + 1,
        transactions: this.pendingTransactions,
        difficulty: this.difficulty,
        previousBlockHash: prevBlockHash,
        //minedBy: ,
        //blockDataHash: ,
        nonce: nonce,
        timestamp: new Date().toISOString(),
        blockHash: blockHash
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(from, to, value, data) {
    const newTransaction = {
        from: from,
        to: to,
        value: value,
        fee: 10,
        dateCreated: new Date().toISOString(),
        data: data,
        // senderPubKey: ,
        // transactionDataHash: ,
        // senderSignature: , 
    };

    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] + 1;
};

Blockchain.prototype.hashBlock = function(prevBlockHash, currentBlockData, nonce) {
    const dataString = prevBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataString);
    return hash;
};

Blockchain.prototype.proofOfWork = function(prevBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(prevBlockHash, currentBlockData, nonce);
    while(hash.substring(0, this.difficulty) !== '00000') {
        nonce++;
        hash = this.hashBlock(prevBlockHash, currentBlockData, nonce);
    };

    return nonce;
};

module.exports = Blockchain;