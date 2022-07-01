# decentralised-lottery
This is a completely decentralised Lottery(Raffle) System which utilizes following tools and technologies: 

##### Smart Contract
- Hardhat
- Ethers
- Ethereum Waffle
- Chai
- Chainlink VRF - for getting a offchain random number from chainlink oracle network to pick a random winner. 
- Chainlink Keepers - to automate the task of picking a random winner after a certain amount of time has passed. 
- Hardhat Gas Reporter
- Solidity Coverage

##### Frontend
- NextJS
- ReactJS
- Moralis
- Web3UIKit
- TailwindCSS
- PostCSS

##### Hosting Frontend
- IPFS
- Fleek

##### Deploying Smart Contract
###### Deploying the smart contract locally on hardhat network
 1. Install all the `dependencies` and `devDependencies` using 
 ```bash
 yarn 
 ```
 2. Spin up a local hardhat node using: 
 ```bash
 yarn hardhat node
 ```
 visit this url: 
 [https://cold-dew-1053.on.fleek.co/](https://cold-dew-1053.on.fleek.co/)
 change the account in the metamask to hardhat localhost. 
 
 
