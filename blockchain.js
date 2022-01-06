const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Transaction {
    constructor(fromAdress, toAdress, amount) {
        this.fromAdress = fromAdress;
        this.toAdress = toAdress;
        this.amount = amount;
    }

    CalculateHash() {
        return SHA256(this.fromAdress + this.toAdress + this.amount).toString();
    }

    SignTransaction(signingKey) {
        if(signingKey.getPublic('hex') != this.fromAdress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.CalculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');   
    }

    IsValid() {
        if(this.fromAdress == null) return true;

        if(!this.signature || this.signature.length == 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAdress, 'hex');
        return publicKey.verify(this.CalculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.CalculateHash();
        this.nonce = 0
    }

    CalculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    MineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) != Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.CalculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

    HasValidTransaction() {
        for(const tx of this.transactions) {
            if(!tx.IsValid()) {
                return false;
            }
        }

        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.CreateGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    CreateGenesisBlock() {
        return new Block("31/12/2021", "Genesis Block", "0");
    }

    GetLatestblock() {
        return this.chain[this.chain.length - 1];
    }

    MinePendingTransactions(miningRewardAdress) {
        const rewardTx = new Transaction(null, miningRewardAdress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.GetLatestblock().hash);
        block.MineBlock(this.difficulty);

        console.log("Block Sucessfully mined!");
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    AddTransaction(transaction) {

        if(!transaction.fromAdress || !transaction.toAdress) {
            throw new Error('Transaction must include from and to adress');
        }

        if(!transaction.IsValid()) {
            throw new Error('Cannot add invalid to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    GetBalanceOfAdress(adress) {
        let balance = 0;

        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAdress == adress) {
                    balance -= trans.amount;
                }

                if(trans.toAdress == adress) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    IsChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.HasValidTransaction()) {
                return false;
            }

            if(currentBlock.hash !== currentBlock.CalculateHash()) {
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;