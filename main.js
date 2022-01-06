const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const myKey = ec.keyFromPrivate('44f60676e0aa04bb03cad62d9fc21967f86b32cad142906f56ef14286f24468c');
const myWalletAdress = myKey.getPublic('hex');


let napolitanoIrlandes = new Blockchain();

const tx1 = new Transaction(myWalletAdress, 'public key goes here', 10);
tx1.SignTransaction(myKey);
napolitanoIrlandes.AddTransaction(tx1);

console.log('\n[#] Stating the miner....');
napolitanoIrlandes.MinePendingTransactions(myWalletAdress);

console.log('\nBalance of Gutos is: ', napolitanoIrlandes.GetBalanceOfAdress(myWalletAdress));

console.log('Is chain valid? ', napolitanoIrlandes.IsChainValid());