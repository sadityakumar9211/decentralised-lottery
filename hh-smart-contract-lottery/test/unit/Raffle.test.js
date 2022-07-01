//This is kind of almost ideal test.
//writing better tests makes you a better engineer

//we run unit tests on development chains only.
//On a test network we run staging test

//This test is only inteded to run on development chains.

const { developmentChains, networkConfig } = require("../../helper-hardhat.config")
const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle, vrfCoordinatorV2Mock, raffleEntranceFees, deployer, interval
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) //This deploys all the contracts with "all" tag and takes a snapshot of the blockchain state and remembers that snapshot. This reduces the time consumed significantly.
              raffle = await ethers.getContract("Raffle", deployer) //getting the latest deployments of raffle contract and associating it with deployer account. Any function called on "raffle" will now automatically be signed by the "deployer".
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffleEntranceFees = await raffle.getEntranceFees()
              interval = await raffle.getInterval()
          })

          //we can have describe nested directly inside another describe.

          describe("constructor", function () {
              it("initializes the raffle correctly", async function () {
                  //Ideally we make our test to have just 1 assert per it. But we are going to be a little bit loose here.
                  const raffleState = await raffle.getRaffleState() //as on the development chains so don't have to wait for the transaction to finish and I am only reading from the blockchain not trying to change the state of the blockchain.

                  //Note: We can write more test for other variables initialized by the constructor but let's keep it simple for now.

                  assert.equal(raffleState.toString(), "0") //as raffleState is going to be a big number. raffleState will return 0 or 1 if OPEN or CALCULATING.
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })

          describe("enterRaffle", function () {
              //entrance fees is 0.01 ETH
              it("reverts when you don't pay enough", async function () {
                  await expect(
                      raffle.enterRaffle({ value: ethers.utils.parseEther("0.001") })
                  ).to.be.revertedWith("Raffle__NotEnoughETHEntered")
              })
              it("records players when they enter raffle", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFees })
                  const playerFromContract = await raffle.getPlayer(0) //getting the player from the contract which is pushed into the array.
                  assert.equal(playerFromContract, deployer)
              })
              it("emits event on enter", async function () {
                  //checking to see if an event is fired
                  await expect(raffle.enterRaffle({ value: raffleEntranceFees })).to.emit(
                      raffle,
                      "RaffleEnter"
                  ) //we are expecting Raffle contract to emit an event called RaffleEnter event.
              })
          })
          //can't enter the raffle when its  in calculating state.
          it("doesn't allow entrance when raffle is in calculating state", async function () {
              await raffle.enterRaffle({ value: raffleEntranceFees }) //even now the raffle is in open state
              //we want the raffle to go in closed state and test if it allows entrace or not.
              await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) //increasing the time of our blockchain
              // await network.provider.request({method: "evm_mine", params: []})   //below line is same as this.
              await network.provider.send("evm_mine", []) //mining a block
              //Now we have increased the time of our blochain and we have mined a block.
              //So the check upkeep should return true now and we can call performUpkeep
              await raffle.performUpkeep([]) //now the raffle is in calculating state
              await expect(raffle.enterRaffle({ value: raffleEntranceFees })).to.be.revertedWith(
                  "Raffle__NotOpen"
              )
          })
          describe("checkUpkeep", function () {
              it("returns false if people haven't send any ETH", async function () {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) //increasing the time of our blockchain
                  await network.provider.send("evm_mine", []) //mining a block
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded) //passes if the argument is true of assert.
              })
              it("returns false if raffle isn't open", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFees }) //makes hasPlayer and hasBalance true
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) //increasing the time of our blockchain    //This makes sure that the raffle is in Open state
                  await network.provider.send("evm_mine", []) //mining a block
                  await raffle.performUpkeep([]) //This makes the raffle to go in calculating state.
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), "1") //raffle should be in calculating state
                  assert.equal(upkeepNeeded, false) //passes if the argument is true of assert.
              })
              it("returns false if enough time hasn't passed", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFees }) //has balance and has player
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 2]) //enough time has not passed
                  await network.provider.send("evm_mine", []) //but we have mined a block
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert.equal(upkeepNeeded, false) //passes if the argument is true of assert.
              })
              it("returns true if enough time has passed, has players, eth, and is open", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFees }) //has balance and has player
                  //ensuring that the raffle is in open state.
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) //enough time has passed
                  await network.provider.send("evm_mine", []) //but we have mined a block
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(upkeepNeeded, true)
              })
          })
          describe("performUpkeep", function () {
              it("can only run if checkUpkeep is true", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFees }) //has balance and has player
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) //enough time has passed
                  await network.provider.send("evm_mine", []) //but we have mined a block
                  const tx = await raffle.performUpkeep([]) //perform upkeep will not fail here
                  assert(tx) //expecting that the transaction has gone through
              })
              it("reverts when checkUpkeep is false", async function () {
                  await expect(raffle.performUpkeep([])).to.be.revertedWith(
                      "Raffle__UpkeepNotNeeded" //this reverts with some arguments and we can make our test to expect the same arguments by using string interpolation : 15:46:06
                  ) //the contract is deployed currently and enought time hasn't passed and no one has entered the contract yet. So, checkup keep should be false.
              })
              it("perform upkeep runs and updates the raffle state, emits the event and calls the vrfCoordinator", async function () {
                  //for perform upkeep to run the checkupkeep should be true.
                  //making the checkupkeep to reuturn true.
                  await raffle.enterRaffle({ value: raffleEntranceFees }) //has balance and has player
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) //enough time has passed
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const txResponse = await raffle.performUpkeep([]) //I need trasaction receipt for checking the emmission of events.
                  const txReceipt = await txResponse.wait()
                  const requestId = txReceipt.events[1].args.requestId
                  const raffleState = await raffle.getRaffleState()
                  assert(requestId.toNumber() > 0)
                  assert(raffleState == 1) //enum doesn't return the value of enum in bignumber.
              })
          })
          describe("fulfilRandomWords", function () {
              //testing a function which selects a random word...
              //we need to have players in the raffle before we can pick a winner among the players who have entered the raffle.

              beforeEach(async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFees })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) //enough time has passed
                  await network.provider.send("evm_mine", []) //mined a new block
                  //The raffle is in open state and performUpkeep can be called.
              })

              //fulfill randomWords can be called iff requestRandomWords is called
              it("can only be called after performUpkeep", async function () {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address) //we have not called perform upkeep and with this request id (which is random and invalid requestId) we are expecting to get reverted.
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(2, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(3, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
              })
              //way to big
              it("picks a winner, resets the lottery, and sends money", async function () {
                  //we want to add some more people before we pick a winner
                  const additionalEntrants = 3
                  const startingAccountIndex = 1 //as deployer = 0
                  const accounts = await ethers.getSigners()
                  for (
                      let i = startingAccountIndex;
                      i < startingAccountIndex + additionalEntrants;
                      i++
                  ) {
                      //connecting raffle to these new accounts and then entering these new accounts enter the raffle
                      const accountConnectedRaffle = await raffle.connect(accounts[i])
                      await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFees })
                  }
                  const startingTimestamp = await raffle.getLatestTimeStamp()
                  //performUpkeep(mock being chainlink keepers)
                  //fulfillRandomWords(mock being chainlink vrf)
                  //we will have to wait for the fulfillRandomWords to be called.
                  //To simulate the waiting on the local chain, we will have to setup a listener.
                  console.log("#############################################")
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Found the event!")
                          try {
                              //checking if the changes are properly done to the variables
                              //Our assert statements reside here.

                              const recentWinner = await raffle.getRecentWinner()
                              console.log(`Recent Winner --> ${recentWinner}`)
                              console.log(accounts[0].address)
                              console.log(accounts[1].address)
                              console.log(accounts[2].address)
                              console.log(accounts[3].address)

                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[1].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              const numPlayers = await raffle.getNumerOfPlayers()
                              assert.equal(numPlayers.toString(), "0")
                              assert.equal(raffleState.toString(), "0")
                              assert(endingTimeStamp > startingTimestamp)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance
                                      .add(raffleEntranceFees)
                                      .mul(additionalEntrants)
                                      .add(raffleEntranceFees)
                                      .toString()
                              )
                              resolve()
                          } catch (e) {
                              reject(e)
                          }
                          //listening for the event to be emitted and then doing something   //this is the listener
                      }) //setting up listener
                      //below we will fire the event, and the listener will pick it up, and resolve.
                      const tx = await raffle.performUpkeep([]) //mocking the chainlink keepers
                      const txReceipt = await tx.wait()
                      const winnerStartingBalance = await accounts[1].getBalance()

                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          //mocking the chainlink vrf
                          txReceipt.events[1].args.requestId,
                          raffle.address
                      )
                  })
              })
          })
      })
