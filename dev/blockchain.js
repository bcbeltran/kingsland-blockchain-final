const sha256 = require('sha256');
const uuid = require("uuid");

// BLOCKCHAIN IMPLEMENTATION
function Blockchain(nodeAddress) {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 5;
    this.createNewBlock(
		0,
		"0",
		this.hashBlock(
			"0",
			{
				index: 0,
				transactions: [],
				difficulty: this.difficulty,
				nodeAddress: "0000000000000000000000000000000000000000",
			},
			0
		),
		"0000000000000000000000000000000000000000",
		this.hashBlockData({
			index: 0,
			transactions: [],
			difficulty: this.difficulty,
			nodeAddress: "0000000000000000000000000000000000000000",
		})
	);
    this.addTransactionToPending({
		from: "0000000000000000000000000000000000000000",
		to: "1234567890",
		value: 1000000000000,
		data: "Genesis block",
		dateCreated: new Date().toISOString(),
		transactionId: uuid.v1().split("-").join(""),
		transactionDataHash: this.hashBlockData(
			"0000000000000000000000000000000000000000",
			"1234567890",
			1000000000000,
			0,
			new Date().toISOString(),
			"Genesis block"
		),
	});
}

Blockchain.prototype.resetChain = function() {
    let genesisBlock = this.chain[0];
    this.pendingTransactions = [this.chain[1].transactions[0]];
    this.chain = [];
    this.chain.push(genesisBlock);
    this.difficulty = 5;
}

Blockchain.prototype.createNewBlock = function(nonce, prevBlockHash, blockHash, minedBy, blockDataHash) {
    let index = 0;
    if(this.chain.length === 0) {
        index = 0;
    } else {       
        index = this.chain.length;
    }

    const newBlock = {
        index: index,
        transactions: this.pendingTransactions,
        difficulty: this.difficulty,
        prevBlockHash: prevBlockHash,
        minedBy: minedBy,
        blockDataHash: blockDataHash,
        nonce: nonce,
        dateCreated: new Date().toISOString(),
        timestamp: Date.now(),
        blockHash: blockHash
    };

    this.pendingTransactions.forEach(transaction => {
        transaction.minedInBlockIndex = this.chain.length;
        transaction.transferSuccessful = true;
    });
    
    this.pendingTransactions = [];
    
    this.chain.push(newBlock);
    
    return newBlock;
};


Blockchain.prototype.chainIsValid = function(blockchain) {
    let validChain = true;

    for (var i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i - 1];
        // console.log("this is the current block: ", currentBlock);
        // console.log('this is the prevblock: ', prevBlock);
        const hashedBlock = this.hashBlock(
			prevBlock["blockHash"],
			{
				index: currentBlock['index'],
				transactions: currentBlock['transactions'],
				difficulty: currentBlock['difficulty'],
				prevBlockHash: prevBlock['blockHash'],
                nodeAddress: currentBlock['minedBy']
			},
			currentBlock["nonce"]
		);

        if(currentBlock['prevBlockHash'] != prevBlock['blockHash']) {
            console.log('failed at hash');
            validChain = false;
        }
        
        if(hashedBlock.substring(0, 5) != "00000") {
            console.log('failed at substring');
            validChain = false;
        }
    }

    const genesisBlock = blockchain[0];
    const genesisNonce = genesisBlock.nonce === 0;
    const genesisPrevBlockHash = genesisBlock.prevBlockHash === "0";
    const genesisHash = genesisBlock.blockHash === "0";
    const genesisTransactions = genesisBlock.transactions.length === 0;

    if(!genesisNonce || !genesisPrevBlockHash || !genesisHash || !genesisTransactions) {
        console.log('failed at genesis block');
        validChain = false;
    }

    return validChain;
};

Blockchain.prototype.createNewTransaction = function(from, to, value, data) {
    let txFee = 0;

    if (from !== "1234567890") {
		txFee = 10;
	}
    const dateCreated = new Date().toISOString();
    const txHash = this.hashBlockData(from, to, value, txFee, dateCreated, data);
    const newTransaction = {
        from: from,
        to: to,
        value: value,
        fee: txFee,
        dateCreated: dateCreated,
        data: data,
        transactionDataHash: txHash,
        // senderPubKey: ,
        // senderSignature: , 
    };
    return newTransaction;

};

Blockchain.prototype.addTransactionToPending = function(transactionObj) {
    this.pendingTransactions.push(transactionObj);
    
    if(this.chain.length === 0){
        return "Genesis block created";
    } else {

        return this.getLastBlock()['index'] + 1;
    }
};

Blockchain.prototype.hashBlockData = function(currentBlockData) {
    const dataString = JSON.stringify(currentBlockData);
    const hash = sha256(dataString);
    return hash;
};

Blockchain.prototype.hashBlock = function(prevBlockHash, currentBlockData, nonce) {
    
    const dataString = prevBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    
    const hash = sha256(dataString);
    return hash;
};

Blockchain.prototype.proofOfWork = function(prevBlockHash, currentBlockData) {
    let nonce = 0;
    let leadingZero = '0';

    if(this.chain.length > 1) {
        let lastBlock = this.getLastBlock();
        let timestampComparison = this.chain[lastBlock.index - 1].timestamp;
        let difficultyAdjustment = lastBlock.timestamp - timestampComparison;
    
        if(difficultyAdjustment >= 30000) {
            this.difficulty--;
        } else if (difficultyAdjustment <= 5000) {
            this.difficulty++;
        }

        console.log("last block timestamp: ", lastBlock.timestamp);
        console.log('block before last block timestamp: ', timestampComparison);
        console.log('difficulty adjustment: ', difficultyAdjustment);
        console.log('current difficulty: ', this.difficulty);
    }

    let hash = this.hashBlock(prevBlockHash, currentBlockData, nonce);
    while(hash.substring(0, this.difficulty) !== leadingZero.repeat(this.difficulty)) {
        nonce++;
        hash = this.hashBlock(prevBlockHash, currentBlockData, nonce);
    }
    
    return nonce;
};

//BLOCK EXPLORER INFO

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
};

Blockchain.prototype.getBlock = function(blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if (block.blockHash === blockHash) {
            correctBlock = block;
        }
    });
    return correctBlock;
    
};

Blockchain.prototype.getBlockByIndex = function(blockIndex) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if (block.index == blockIndex) {
            correctBlock = block;
        }
    });
    return correctBlock;

};

Blockchain.prototype.getTransaction = function(transactionId) {
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.transactionId == transactionId) {
                correctTransaction = transaction;
                correctBlock = block;
            }
        });
    });
    return { transaction: correctTransaction, block: correctBlock };
};

Blockchain.prototype.getTransactionByDataHash = function(transactionDataHash) {
    let correctTransaction = null;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.transactionDataHash == transactionDataHash) {
                correctTransaction = transaction;
            }
        });
    });
    return { transaction: correctTransaction };
};


Blockchain.prototype.getConfirmedTransactions = function() {
    let confirmedTransactions = [];
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.transferSuccessful) {
                confirmedTransactions.push(transaction);
            }
        });
    });

    return confirmedTransactions;
};

Blockchain.prototype.getAddressInfo = function(address) {
    const addressTransactions = [];
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.from == address || transaction.to == address) {
                addressTransactions.push(transaction);
            }
        });
    });

    return {
        address: address,
        transactions: addressTransactions
    };
};

Blockchain.prototype.getAddressBalance = function(address) {
    let safeBalance = 0;
    let confirmedBalance = 0;
    let pendingBalance = 0;
    let addressTransactions = [];

    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.from === address || transaction.to === address) {
                addressTransactions.push(transaction);
            }
        });
    });
    
    let lastBlockIndex = this.getLastBlock().index;

    addressTransactions.forEach(transaction => {
        if ((lastBlockIndex - transaction.minedInBlockIndex) >= 6) {
            if (transaction.to === address) {
                safeBalance += transaction.value;
            } else if (transaction.from === address) {
                safeBalance -= transaction.value;
            }
        } else if ((lastBlockIndex - transaction.minedInBlockIndex) >= 1 && (lastBlockIndex - transaction.minedInBlockIndex) < 6) {
            if (transaction.to === address) {
				confirmedBalance += transaction.value;
			} else if (transaction.from === address) {
				confirmedBalance -= transaction.value;
			}
        } else {
            if (transaction.to === address) {
				pendingBalance += transaction.value;
			} else if (transaction.from === address) {
				pendingBalance -= transaction.value;
			}
        }
    });

    return {
        address: address,
        safeBalance,
        confirmedBalance,
        pendingBalance
    }
};

module.exports = Blockchain;