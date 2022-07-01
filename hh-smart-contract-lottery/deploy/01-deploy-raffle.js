//Deploy script for Raffle.sol smart contract.

const { network, ethers } = require("hardhat")
const {
    developmentChains,
    networkConfig,
    BASE_FEE,
    VRF_SUB_FUND_AMOUNT,
    GAS_PRICE_LINK,
} = require("../helper-hardhat.config")

const { verify } = require("../utils/verify.js")

module.exports = async function ({ getNamedAccouts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        //creating the subscriptionId and funding the subscriptionId
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        //Fund the subscription
        //Usually, you'd need the link token on a real network or test network.
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        //we can create a subscriptionId and fund that in a real network in the same programmatic way also. But we're not going to do it here.
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const entranceFees = networkConfig[chainId]["entranceFees"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]
    const args = [
        vrfCoordinatorV2Address,
        entranceFees,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitCofirmations: network.config.blockConfirmations || 1,
    })
    log("Raffle.sol smart contract deployed!")
    log("##############################################")
    //verifying the contract
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying the contract...")
        await verify(raffle.address, args)
        log("contract verified!")
        log("#############################################")
    }
}

module.exports.tags = ["raffle", "all"]
