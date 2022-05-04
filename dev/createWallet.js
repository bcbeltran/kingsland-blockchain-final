const bip32 = require('bip32').default;
const bip39 = require('bip39');
const { ripemd160 } = require('bitcoinjs-lib/src/crypto');
const { randomBytes } = require('crypto');
const secp256k1 = require('secp256k1');
const sha256 = require('sha256');
let mnemonic = bip39.generateMnemonic();

const msg = new Uint8Array('tomato');

let privKey;
do {
    privKey = randomBytes(32);
} while (!secp256k1.privateKeyVerify(privKey));

const pubKey = secp256k1.publicKeyCreate(privKey);

const sigObj = secp256k1.ecdsaSign(msg, privKey);

const address = ripemd160(pubKey);

console.log("Msg: ", msg);
console.log("Private key: ", Buffer.from(privKey).toString('hex'));
console.log("Public key: ", Buffer.from(pubKey).toString('hex'));
console.log("Address: ", Buffer.from(address).toString('hex'));
console.log("Sig Object: ", sigObj);
console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey));

// createWallet = async () => {
//     const seed = await bip39.mnemonicToSeed(mnemonic);
//     console.log('This is the mnemonic:');
//     console.log(mnemonic);
//     console.log('This is the seed:');
//     console.log(Buffer.from(seed).toString('hex'));

// };

// import("tiny-secp256k1")
// 	.then((ecc) => BIP32Factory(ecc))
// 	.then((bip32) => {
// 		node = bip32.fromBase58(seed);

// 		let child = node.derivePath("m/0/0");
//         return node;
// 	});


//let account = root.derivePath(path);
//let node = account.derive(0).derive(0);

// let address = bitcoin.payments.p2pkh({
//     pubkey: node.publicKey,
//     network: network
// }).address;

// console.log(`Your wallet is:`);
// console.log(`Address: ${address}`);
// console.log(`Key: ${node.toWIF()}`);
// console.log(`Mnemonic: ${mnemonic}`);

//createWallet();
// console.log('This is the root:');
// console.log(node);