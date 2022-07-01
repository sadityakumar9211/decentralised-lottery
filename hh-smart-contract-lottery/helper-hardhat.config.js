//Configurations for deployment on various networks --> values of vrfCoordinatorV2 changes on
//various networks

const { ethers } = require("ethers")

const networkConfig = {     //all the parameters that are different chain-to-chain.
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFees: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",   //30 GWei GasLane
        subscriptionId: 7203,
        callbackGasLimit: "500000",
        interval: "30", //30 seconds
        waitConfirmations: 6,
    }, 
    31337: {
        name: "hardhat",
        entranceFees: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        interval: "30",
        waitConfirmations: 1,
    }

}

const developmentChains = ["hardhat", "localhost"]

const BASE_FEE = ethers.utils.parseEther("0.25")    //0.25 is the premium. It costs 0.25 LINK to request a random number
const GAS_PRICE_LINK =  1e9       //link per gas
//calculated value based on the gas price on the chain.
//chainlink nodes pay the gas fees to give us randomness & do external execution
//so they price of the request changes based on the price of gas.
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

module.exports = {
    networkConfig,
    developmentChains,
    BASE_FEE,
    GAS_PRICE_LINK,
    VRF_SUB_FUND_AMOUNT,
}
