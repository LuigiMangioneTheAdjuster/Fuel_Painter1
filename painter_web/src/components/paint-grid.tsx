// src/components/paint-grid.tsx

import { PainterContractID } from "@/constants";
import { PainterContractAbi__factory } from "@/contracts";
import { ColorOutput } from "@/contracts/PainterContractAbi";
import { useState } from "react";

// Define the props for our component
// Includes the pixels 2D Array we get from `get_pixels`
// and user account address
interface PaintGridProps {
  pixels: ColorOutput[][];
  account: string;
}

// Type to make a request to `paintPixelCall` function below
// which calls `paint_pixel` on the contract
type PaintPixelParams = {
  color: ColorOutput;
  row: number;
  col: number;
};

export default function PaintGrid({ pixels, account }: PaintGridProps) {
  // State variable to keep track of which pixel the user is painting over and what colour
  const [activePixel, setActivePixel] = useState<PaintPixelParams | null>(null);

  // Contract call to the `paint_pixel` function with the row, col, and color
  async function paintPixelCall() {
    if (window.fuel && activePixel) {
      const { row, col, color } = activePixel;
      const wallet = await window.fuel.getWallet(account);
      const contract = PainterContractAbi__factory.connect(
        PainterContractID,
        wallet
      );

      await contract.functions.paint_pixel(row, col, color).call();
    }
  }

  // The below code looks a bit confusing, but really it's just a nested loop
  // that goes over every row + col combination in the `pixels` grid
  // and renders an `<input type="color" />` for each pixel
  // with the color that's published on-chain (default white)
  // the user is allowed to edit one pixel at a time and must paint that pixel before being able to
  // paint other pixels
  return (
    <div className="flex mx-auto items-center flex-col space-y-8">
      <div className="flex">
        {pixels.map((pixelRow, rowIdx) => (
          <div key={`pixel-row-${rowIdx}`} className="flex flex-col">
            {pixelRow.map((pixel, colIdx) => {
              let colorValue = "";

              if (
                activePixel &&
                activePixel.row === rowIdx &&
                activePixel.col === colIdx
              ) {
                colorValue = colorToHex(activePixel!.color);
              } else {
                colorValue = colorToHex(pixel);
              }

              return (
                <input
                  type="color"
                  className="h-16 w-16 border"
                  value={colorValue}
                  key={`pixel-col-${rowIdx}-${colIdx}`}
                  onChange={(e) => {
                    const color = hexToColor(e.target.value);
                    setActivePixel({ row: rowIdx, col: colIdx, color });
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <button
        onClick={paintPixelCall}
        className="bg-green-400 w-fit hover:bg-green-500 transition-all rounded-lg px-4 py-2 text-slate-900 font-medium"
      >
        Paint Pixel
      </button>
    </div>
  );
}

// helper function to convert hex color codes to RGB
function hexToColor(hex: string) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5), 16);

  return {
    red: r,
    green: g,
    blue: b,
  };
}

// helper function to convert RGB colors to a hex color code string
function colorToHex(color: ColorOutput) {
  const hexR = color.red.toString(16).padStart(2, "0");
  const hexG = color.green.toString(16).padStart(2, "0");
  const hexB = color.blue.toString(16).padStart(2, "0");

  return `#${hexR}${hexG}${hexB}`;
}
