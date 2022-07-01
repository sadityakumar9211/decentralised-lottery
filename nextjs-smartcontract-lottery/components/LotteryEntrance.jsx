//Here we want to have a function to enter the lottery (EnterLottery button which on
//click calls the enterRaffle function of the smart contract)

import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const dispatch = useNotification()

    //We just automated the process of updating our abi's and contract addresses.
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFees, setEntranceFees] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState(
        "0x000000000000000000000000000"
    )

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        //this can both send transactions and read state from the blockchain.
        abi: abi,
        contractAddress: raffleAddress, //specify chainId
        functionName: "enterRaffle",
        params: {}, //enterRaffle doesn't take any parameters

        //right when our LotteryEntrance component mounts, we want to run a function to get the entranceFees value.
        msgValue: entranceFees, // as the contract is already deployed(so constructor has already run) and so the entranceFees is already set
    })

    //try to read the raffle entrance fees from the blockchain
    const { runContractFunction: getEntranceFees } = useWeb3Contract({
        //this can both send transactions and read state from the blockchain.
        abi: abi,
        contractAddress: raffleAddress, //specify chainId
        functionName: "getEntranceFees",
        params: {}, //enterRaffle doesn't take any parameters
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        //this can both send transactions and read state from the blockchain.
        abi: abi,
        contractAddress: raffleAddress, //specify chainId
        functionName: "getNumberOfPlayers",
        params: {}, //enterRaffle doesn't take any parameters
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        //this can both send transactions and read state from the blockchain.
        abi: abi,
        contractAddress: raffleAddress, //specify chainId
        functionName: "getRecentWinner",
        params: {}, //enterRaffle doesn't take any parameters
    })

    //Tried for listening to the events emitted from the smart contract.
    // const winnerPickedEventListener = async function (){
    //     const raffle = await ethers.getContract(raffleAddress, abi)
    //     raffle.events.winnerPicked({}, (error, data)=>{
    //         if(error){
    //             console.log(error)
    //         }else{
    //             updateUI()
    //         }
    //     })
    // }

    async function updateUI() {
        const entranceFeesFromCall = await getEntranceFees({
            onError: (error) => console.log(error),
        })
        setEntranceFees(entranceFeesFromCall) //stored in the form of a wei value
        const numPlayersFromCall = await getNumberOfPlayers({
            onError: (error) => console.log(error),
        })
        setNumPlayers(numPlayersFromCall.toString())
        const recentWinnerFromCall = await getRecentWinner({
            onError: (error) => console.log(error),
        })
        setRecentWinner(recentWinnerFromCall.toString())
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled]) ///only when the component is mounted will this effect run.

    const handleSuccess = async (tx) => {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "pulse",
            iconColor: "green",
        })
    }

    return (
        <div className="m-5 font-extralight font-sans">
            <div>Hi from Lottery Entrance</div>

            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl my-3"
                        disabled={isLoading || isFetching}
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>
                        Entrance Fees :
                        {ethers.utils.formatUnits(entranceFees, "ether")} ether{" "}
                        {/*//this is how we convert from wei to ether.*/}
                    </div>
                    <div>Number of Players entered yet: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <h4>No Raffle Address Detected!</h4>
            )}
        </div>
    )
}
