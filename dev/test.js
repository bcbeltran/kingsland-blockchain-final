const Blockchain = require('./blockchain');

const burbcoin = new Blockchain();

const bc1 = 
{
"chain": [
{
"index": 1,
"transactions": [],
"difficulty": 5,
"prevBlockHash": "0",
"minedBy": "http://localhost:3001",
"blockDataHash": "0",
"nonce": 0,
"dateCreated": "2022-04-28T15:17:23.809Z",
"timestamp": 1651159043809,
"blockHash": "0"
},
{
"index": 2,
"transactions": [],
"difficulty": 5,
"prevBlockHash": "0",
"minedBy": "http://localhost:3001",
"blockDataHash": "61fc0561197972aa8139549079f5b39cabae0ecb0942054e9077f4277ede4c2c",
"nonce": 599170,
"dateCreated": "2022-04-28T15:18:27.109Z",
"timestamp": 1651159107109,
"blockHash": "0000002b403e6668769cec3ce44d7e9e111b9db0ee9aa6c2b5928375415f6876"
},
{
"index": 3,
"transactions": [
{
"from": "coinbase",
"to": "http://localhost:3001",
"value": 100,
"fee": 0,
"dateCreated": "2022-04-28T15:18:27.694Z",
"data": "Mining reward",
"transactionId": "745288e0c70611eca1d92b6d57474a4a"
},
{
"from": "jb09etj803gpo3984gh8u54hg7hg8h893hg8h0",
"to": "afh733hgi350h768dgergwr6gveh6r595",
"value": 1,
"fee": 10,
"dateCreated": "2022-04-28T15:21:11.406Z",
"data": "First broadcasted transaction.",
"transactionId": "d5e700e0c70611eca1d92b6d57474a4a"
},
{
"from": "jb09etj803gpo3984gh8u54hg7hg8h893hg8h0",
"to": "afh733hgi350h768dgergwr6gveh6r595",
"value": 374972,
"fee": 10,
"dateCreated": "2022-04-28T15:21:31.143Z",
"data": "Second broadcasted transaction.",
"transactionId": "e1aaa170c70611eca1d92b6d57474a4a"
}
],
"difficulty": 5,
"prevBlockHash": "0000002b403e6668769cec3ce44d7e9e111b9db0ee9aa6c2b5928375415f6876",
"minedBy": "http://localhost:3001",
"blockDataHash": "9484f0a3f688eb8d5a8d8450071c598881d971d43f22fcd3c2a08a96d2c9bbe3",
"nonce": 319342,
"dateCreated": "2022-04-28T15:22:07.492Z",
"timestamp": 1651159327492,
"blockHash": "0000047254a34673cb594740dfbbb16148f93dede2caa66617535a3cd5d8615a"
},
{
"index": 4,
"transactions": [
{
"from": "coinbase",
"to": "http://localhost:3001",
"value": 100,
"fee": 0,
"dateCreated": "2022-04-28T15:22:07.508Z",
"data": "Mining reward",
"transactionId": "f7577d40c70611eca1d92b6d57474a4a"
}
],
"difficulty": 5,
"prevBlockHash": "0000047254a34673cb594740dfbbb16148f93dede2caa66617535a3cd5d8615a",
"minedBy": "http://localhost:3001",
"blockDataHash": "6d66a036d4f2bc1c2b4aec03d6078f5fab82744623222096f55d24c67eead3b3",
"nonce": 1517207,
"dateCreated": "2022-04-28T15:23:55.723Z",
"timestamp": 1651159435723,
"blockHash": "000002aff0a6e30f663702ba4a75ec3677e7407ff99fd3777c787cae50efd133"
}
],
"pendingTransactions": [
{
"from": "coinbase",
"to": "http://localhost:3001",
"value": 100,
"fee": 0,
"dateCreated": "2022-04-28T15:23:55.784Z",
"data": "Mining reward",
"transactionId": "37e13f90c70711eca1d92b6d57474a4a"
}
],
"difficulty": 5,
"selfUrl": "http://localhost:3001",
"peers": [],
"maxSupply": 1e+72
}

console.log("Is valid: ", burbcoin.chainIsValid(bc1.chain));