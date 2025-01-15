// src/components/init-contract.tsx

import { PainterContractID } from "@/constants";
import { PainterContractFactory } from "@/contracts/PainterContractFactory";
import { Dispatch, SetStateAction, useEffect } from "react";

// Define the props for the InitContract component
interface InitContractProps {
  // User's account address
  account: string;

  // State value and setter to track the contract's initialization status
  initialized: boolean;
  setInitialized: Dispatch<SetStateAction<boolean>>;
}

export default function InitContract({
  account,
  initialized,
  setInitialized,
}: InitContractProps) {

  // The initialize function makes a function call to our smart contract
  async function initialize() {
    if (window.fuel) {

	  // If the user is connected, we fetch their wallet and connect it to our Painter smart contract
      const wallet = await window.fuel.getWallet(account);
      const contract = PainterContractFactory.connect(
        PainterContractID,
        wallet
      );
      try {

		// Once the wallet is connected, we call the `initialize_pixels` function
        await contract.functions
          .initialize_pixels()
          .txParams({ gasPrice: 50 })
          .call();

		// If that transaction succeeds, we refetch `getInitialized`
        await getInitialized();
      } catch (err) {
        console.log("error sending transaction...", err);
      }
    }
  }
  
  // getInitialized does the read-only call to our contract to check if the contract is initialized or not
  async function getInitialized() {
    if (window.fuel) {

	  // Connect user's wallet to our contract instance
      const wallet = await window.fuel.getWallet(account);
      const contract = PainterContractFactory.connect(
        PainterContractID,
        wallet
      );

	  // Get the return value of simulating (read-only call) the `is_initialized` function on our contract
      const { value } = await contract.functions.is_initialized().simulate();
	  // Set our state variable to equal this value
      setInitialized(value);
    }
  }
 
  // This useEffect checks the initialization status when the user connects their wallet
  useEffect(() => {
    if (account) {
      getInitialized();
    }
  }, [account]);


  // If user hasn't connected their wallet, render nothing
  if (!account) return null;

  // If wallet is connected but contract is uninitialized, show button to initialize it
  if (!initialized) {
    return (
      <div className="flex mx-auto flex-col gap-4">
        <p>
          The contract hasn&apos;t been initialized yet. Please initialize the
          contract first.
        </p>

        <button
          className="bg-green-400 hover:bg-green-500 transition-all rounded-lg px-4 py-2 text-slate-900 font-medium"
          onClick={initialize}
        >
          Initialize Contract
        </button>
      </div>
    );
  }

  // If contract is already initialized, render nothing
  return null;
}

