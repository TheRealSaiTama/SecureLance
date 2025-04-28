const { Wallet } = require('ethers');
const mnemonic = "wild novel width vapor until siren allow genre climb catalog play sustain";
const wallet = Wallet.fromPhrase(mnemonic);
console.log(wallet.privateKey);