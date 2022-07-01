import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div className="py-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 font-bold text-3xl">
                Decentralized and Verifiable Raffle
            </h1>
            <div className="ml-auto py-3">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    )
}
