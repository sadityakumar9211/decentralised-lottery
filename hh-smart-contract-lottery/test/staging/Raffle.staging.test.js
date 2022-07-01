const { developmentChains, networkConfig } = require("../../helper-hardhat.config")
const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", function () {
          let raffle, raffleEntranceFees, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              //we don't need fixtures as we're going to deploy our contract on the testnet using the deploy script.
              raffle = await ethers.getContract("Raffle", deployer) //getting the latest deployments of raffle contract and associating it with deployer account. Any function called on "raffle" will now automatically be signed by the "deployer".
              console.log("Contract Deployed at address: ", raffle.address)

              raffleEntranceFees = await raffle.getEntranceFees()
          })
          //This is going to be only one giant test. We can add more tests if we want to.
          describe("fulfillRandomWords", function () {
              //testing fulfill random words on testnet.
              it("works with live chainlink keepers and chainlink vrf, we get a random winner", async function () {
                  //enter the raffle. Chainlink keeper and chainlink vrf will take care of everything else.

                  //grabbing the starting timestamp
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()
                  await new Promise(async (resolve, reject) => {
                      //setup listener before we enter the raffle.
                      //Just in case our blockchain is really fast.
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          //assert statements
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()

                              await expect(raffle.getPlayer(0).to.be.reverted)
                              assert.equal(recentWinner.toString(), accounts[0].addres)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFees).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      //Then
                      await raffle.enterRaffle({ value: raffleEntranceFees })
                      const winnerStartingBalance = await accounts[0].getBalance()
                      //And this code won't finish until the our listener is not finished listening.
                  })
              })
          })
      })
