# Decentralized Lottery System 
> This project utilizes `hardhat` framework for developing, testing, debugging, deploying the smart contract written in solidity for EVM compatible chains. 
- This is the complete backend of a Dapp which supports a decentralized lottery(Raffle). 
> This project uses `Chainlink VRF`(Verifiable Randomness Function) and `Chainlink Keepers` to automate the process of picking up a lottery winner and then again resetting the lottery to allow new round of players to enter the lottery. 

### Usage
#### Pre Requisites
 Before running any command, make sure to install dependencies:

```bash
$ yarn add
```
#### Compile
 Compile the smart contracts with Hardhat:
```bash
$ yarh compile
```

#### Test
 Run the Mocha tests:

```bash
$ yarn test
```

#### Deploy contract to network (requires Mnemonic and rinkeby API key)

```bash
yarn deploy <--network rinkeby>
```

#### Validate a contract with etherscan (requires API key)
```bash
npx hardhat verify --network <network> <DEPLOYED_CONTRACT_ADDRESS> "Constructor argument 1"
```
#### Added plugins
 - "@nomiclabs/hardhat-etherscan": "^3.1.0",  
 - "hardhat-contract-sizer": "^2.5.1",  
 - "hardhat-deploy": "^0.11.10",  
 - "hardhat-gas-reporter": "^1.0.8",  
 - "prettier": "^2.7.1",  
 - "prettier-plugin-solidity": "^1.0.0-beta.19",  
 - "solhint": "^3.3.7",  
 - "solidity-coverage": "^0.7.21"  


Thanks
If you like it than you shoulda put a start ⭐ on it

Twitter: [@sadityakumar921][https://twitter.com/sadityakumar921]

License
MIT