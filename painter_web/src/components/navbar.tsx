import { Dispatch, SetStateAction } from "react";
import {
  Fuel,
  FuelWalletConnector,
} from "@fuel-wallet/sdk";

// Define the interface for the components' props
interface NavbarProps {
  // Address of connected user - empty string if not connected
  account: string;
  // Setter function for 'account'
  setAccount: Dispatch<SetStateAction<string>>;
}

export default function Navbar({ account, setAccount }: NavbarProps) {

  // The function to connect to a Fuel wallet
  async function connect() {
    // If already connected, pressing this doesn't do anything
    if (!!account) return null;

    // If not connected and window.fuel exists, i.e. a Fuel Wallet browser extension was detected
    if (window.fuel) {
      try {
 	 	// Try to connect to the browser extension
        await window.fuel.connect();
		// If connection succeeds, request the list of accounts for the user and select the first one 
        const [account] = await window.fuel.accounts();
		// Set the currently connected address to the first account we got
        setAccount(account);
      } catch (err) {
        console.log("error connecting: ", err);
      }
    }
  }

  // The following is mostly just CSS to have an okay-ish looking Navbar
  // The button on the right side of the Navbar calls the `connect` function when clicked
  return (
    <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-900">
      <p className="text-2xl font-medium">Fuel Painter</p>

      <button
        className="bg-green-400 hover:bg-green-500 transition-all rounded-lg px-4 py-2 text-slate-900 font-medium"
        onClick={connect}
      >
        {!account
          ? "Connect Wallet"
          : `Hello, ${account.substring(0, 8)}...${account.substring(59)}`}
      </button>
    </div>
  );
}
