const ethers = require('ethers');
const fs = require('fs');

const setupParentArgs = async (args, parent) => {
    args.url= parent.url
    if (!parent.networkId) {
        args.provider = new ethers.providers.JsonRpcProvider(args.url);
    } else {
        args.provider = new ethers.providers.JsonRpcProvider(args.url, {
            name: "custom",
            chainId: Number(parent.networkId)
        });
    }
    args.gasLimit = args.gasLimit ? ethers.utils.hexlify(Number(parent.gasLimit)) : undefined;
    args.gasPrice = args.gasPrice ? ethers.utils.hexlify(Number(parent.gasPrice)) : undefined;
    if (!parent.jsonWallet) {
        args.wallet = new ethers.Wallet(parent.privateKey, args.provider);
    } else {
        const raw = fs.readFileSync(parent.jsonWallet);
        const keyfile = JSON.parse(raw);
        args.wallet = await ethers.Wallet.fromEncryptedJson(keyfile, parent.jsonWalletPassword)
    }
}

const splitCommaList = (str) => {
    return str.split(",")
}

const getFunctionBytes = (sig) => {
    return ethers.utils.keccak256(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(sig))).substr(0, 10)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const waitForTx = async (provider, hash) => {
    console.log(`Waiting for tx: ${hash}...`)
    while (!await provider.getTransactionReceipt(hash)) {
        sleep(5000)
    }
}

const expandDecimals = (amount, decimals = 18) => {
    return ethers.utils.parseUnits(String(amount), decimals);
}

const isValidAddress = (address) => {
    try {
        ethers.utils.getAddress(address);
    } catch (e) { 
        console.log(`${address} is not a valid address: ` + e)
        return false; 
    }
    return true;
}

const log = (args, msg) => console.log(`[${args.parent._name}/${args._name}] ${msg}`)

module.exports = {
    setupParentArgs,
    splitCommaList,
    getFunctionBytes,
    waitForTx,
    log,
    expandDecimals,
    isValidAddress
}
