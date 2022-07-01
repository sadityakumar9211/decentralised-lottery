import { useMoralis } from "react-moralis" //this is a custom hook
import { useEffect } from "react"
export default function ManualHeader() {
    const {
        enableWeb3,
        account,
        isWeb3Enabled,
        Moralis,
        deactivateWeb3,
        isWeb3EnableLoading,
    } = useMoralis() //enableWeb3 is a function from moralis

    useEffect(() => {
        console.log("first useEffect")
        if (isWeb3Enabled) return //if web3 is enabled, do nothing
        if (typeof window != "undefined") {
            if (window.localStorage.getItem("connected")) {
                // enableWeb3()    //enabling the web3
            }
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        console.log("second useEffect")
        Moralis.onAccountChanged((account) => {
            //whenever we reload the account value will change to null
            console.log(`Account changed to ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account found!")
            }
        })
    }, []) //this will run on every refresh (reload)

    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...
                    {account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async function () {
                        try {
                            await enableWeb3() //connecting with the metamask wallet.
                            if (typeof window != "undefined") {
                                window.localStorage.setItem(
                                    "connected",
                                    "injected"
                                )
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
