//This is the script which is deployed at the very end of the deployment process.
//It is responsible for updating the front end of the website.
//It creates the constants folders based on the deloyment information.

const { ethers } = require("hardhat")
const fs = require("fs")

const FRONTEND_LOCATION_ADDRESSES_FILE =
    "../nextjs-smartcontract-lottery/constants/contractAddresses.json"
const FRONTEND_LOCATION_ABI_FILE = "../nextjs-smartcontract-lottery/constants/abi.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONTEND) {
        console.log("Updating frontend...")
        updateContractAddress()
        updateAbi()
    }
}

async function updateContractAddress() {
    const raffle = await ethers.getContract("Raffle")
    const chainId = network.config.chainId.toString()
    const currentAddress = await JSON.parse(fs.readFileSync(FRONTEND_LOCATION_ADDRESSES_FILE, "utf8"))
    if (chainId in currentAddress) {      //is the chainId supported
        if(!currentAddress[chainId].includes(raffle.address)){
            currentAddress[chainId].push(raffle.address)
        }
    }else{
        currentAddress[chainId] = [raffle.address]
    }
    //updated the object and now writing to the file.
    await fs.writeFileSync(FRONTEND_LOCATION_ADDRESSES_FILE, JSON.stringify(currentAddress))
}

async function updateAbi(){
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONTEND_LOCATION_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json))
}

module.exports.tags = ["all", "frontend"]
