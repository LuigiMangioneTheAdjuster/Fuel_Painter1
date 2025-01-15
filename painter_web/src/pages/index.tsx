// src/pages/index.tsx

import InitContract from "@/components/init-contract";
import Navbar from "@/components/navbar";
import PaintGrid from "@/components/paint-grid";
import { PainterContractID } from "@/constants";
import { ColorOutput } from "@/contracts/PainterContract";
import { useEffect, useState } from "react";
import { PainterContractFactory } from "../contracts";


export default function Home() {
 

  // State variables to keep track of account address, initialization status, and pixels array
  const [account, setAccount] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [pixels, setPixels] = useState<ColorOutput[][]>([[]]);

  // `get_pixels` read only call (simulate)
  async function getPixels() {
    if (window.fuel && initialized) {
      const wallet = await window.fuel.getWallet(account);
      const contract = PainterContractFactory.connect(
        PainterContractID,
        wallet
      );
      try {
        const { value } = await contract.functions.get_pixels().simulate();
        setPixels(value);
        console.log({ value });
      } catch (error) {
        console.error(error);
      }
    }
  }

  // useEffect to trigger `get_pixels` call when account is connected and contract is initialized
  useEffect(() => {
    if (account && initialized) {
      getPixels();
    }
  }, [account, initialized]);

  // Hooking up all our child-components with their proper state props
  return (
    <div className="flex flex-col w-full">
      <Navbar account={account} setAccount={setAccount} />
      {account ? (
        <div className="flex flex-col gap-4">
          <InitContract
            account={account}
            initialized={initialized}
            setInitialized={setInitialized}
          />
          {pixels && <PaintGrid pixels={pixels} account={account} />}
        </div>
      ) : (
        <p className="text-lg mx-auto font-medium p-4">
          Please connect your wallet.
        </p>
      )}
    </div>
  );
}
