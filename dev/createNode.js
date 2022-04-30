const uuid = require('uuid');

const nodeAddress = uuid.v1().split('-').join('');
const nodeUrl = process.argv[3];

// NODE IMPLEMENTATION
function Node() {
    this.about = "KingslandFinalProject/v1";
    this.nodeId = nodeAddress;
    this.nodeUrl = nodeUrl;
    this.peers = [];
}

Node.prototype.getNodeInfo = function(blockchain, blockCount) {
    let confirmedTransactions = 0;
    let pendingTransactions = blockchain.pendingTransactions.length;
    blockchain.chain.forEach(block => {
        confirmedTransactions += block.transactions.length;
    });

    const currentNode = {
        about: this.about,
        nodeId: this.nodeId,
        nodeUrl: this.nodeUrl,
        chain: blockchain.chain,
        peers: this.peers,
        blocksCount: blockCount,
        confirmedTransactions: confirmedTransactions,
        pendingTransactions: pendingTransactions
        
    };

    return currentNode;
};

module.exports = Node;