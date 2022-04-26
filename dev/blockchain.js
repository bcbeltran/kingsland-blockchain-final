function Blockchain() {
    this.chain = [];
    this.newTransactions = [];
    this.difficulty = 5;
    //this.miningJobs = [];
}

Blockchain.prototype.createNewBlock = function(nonce, prevBlockHash, blockHash) {
    const newBlock = {
        index: this.chain.length + 1,
        transactions: this.newTransactions,
        difficulty: this.difficulty,
        previousBlockHash: prevBlockHash,
        //minedBy: ,
        //blockDataHash: ,
        nonce: nonce,
        timestamp: Date.now(),
        blockHash: blockHash
    };

    this.newTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
};

module.exports = Blockchain;