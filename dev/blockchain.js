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
        timestamp: Date.now(),
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
        dateCreated: Date.now(),
        data: data,
        // senderPubKey: ,
        // transactionDataHash: ,
        // senderSignature: ,
    };

    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] + 1;
};

module.exports = Blockchain;