const Blockchain = require('./blockchain');

const burbcoin = new Blockchain();


const prevBlockHash = "294835720239094f3h2v9b8f2fj290f230";
const currentBlockData = [
    {
        value: 10,
        from: "298t74hf849fh380",
        to: "2984h274hf892",
        data: "tx 1"
    },
    {
        value: 10,
        from: "298t74hf849fh380",
        to: "2984h274hf892",
        data: "tx2"
    },
    {
        value: 10,
        from: "298t74hf849fh380",
        to: "2984h274hf892",
        data: "tx3"
    },
];

//const pow = burbcoin.proofOfWork(prevBlockHash, currentBlockData);

console.log(burbcoin.hashBlock(prevBlockHash, currentBlockData, 754234));
//console.log("The nonce is: ", pow);