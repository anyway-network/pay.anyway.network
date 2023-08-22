"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";
function Page() {
  const { address, isConnected } = useAccount();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("product");
  const [data, setData] = useState(null);
  async function getCallbackData() {
    if (isConnected) {
      setLoading(true);
      const res = await fetch(
        "https://tbh-api.anyway.network/query_fees_and_calldata",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token_from: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            network_from: "Polygon",
            network_to: "Avalanche",
            buy_amount: 10000,
            sender: address,
            recipient: address,
            paymentId: "vytxeTZskVKR7C7WgdSP3d",
          }),
        }
      );
      const data = await res.json();
      console.log(data);
      setData(data);
      setStep("payment");
    } else {
      alert("Please connect your wallet");
    }
  }
  return (
    <>
      <div className="flex justify-between items-center p-3 sticky top-0 backdrop-blur bg-[#f5fff8] bg-opacity-90">
        <div className="text-2xl font-bold flex items-center gap-2 font-logo text-[#5b9763]">
          <img src="/logo.svg" className="w-10 h-10 inline-block" alt="logo" />
          <span className="hidden md:inline-block">AnyWay Network</span>
          <span className=" md:hidden">AnyWay</span>
        </div>
        <ConnectButton />
      </div>
      <AnimatePresence mode="wait">
        {step === "product" && (
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -200 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col mx-auto w-[95vw] max-w-[512px] my-8"
            key={1}
          >
            <h1 className="text-4xl font-logo font-bold p-4 pb-2">Payment</h1>
            <div className="flex flex-col bg-[#76c481] bg-opacity-10 rounded-2xl p-4 border border-[#76c481] border-opacity-20">
              <motion.div className="bg-white p-8 flex items-center justify-center aspect-square rounded-lg border border-[#76c481] border-opacity-20">
                <img
                  src="/iphone-compare-iphone-14-pro-202209.jpeg"
                  className="h-[300px]"
                  alt="product"
                />
              </motion.div>
              <motion.h2 className="text-2xl font-logo mt-3">
                iPhone 15 Pro
              </motion.h2>
              <motion.h3 className="font-logo mt-1">$1.00 USDC</motion.h3>
              <ul className="mt-2 list-disc px-4">
                <li className="font-bold">Demo</li>
                <li>6.1-inch Super Retina XDR display</li>
                <li>Ceramic Shield, tougher than any smartphone glass</li>
                <li>
                  Advanced dual-camera system with 12MP Wide and Telephoto
                  cameras
                </li>
                <li>Industry-leading IP68 water resistance</li>
                <li>USB-C connector for charging and accessories</li>
              </ul>
              {!loading && (
                <motion.button
                  className="w-full bg-[#5b9763] hover:bg-opacity-80 active:bg-opacity-90 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2"
                  onClick={() => getCallbackData()}
                >
                  Pay with{" "}
                  <img
                    src="/logo.svg"
                    className="w-6 h-6 inline-block"
                    alt="logo"
                  />{" "}
                  <span className="font-logo">AnyWay</span>
                </motion.button>
              )}
              {loading && (
                <motion.button className="w-full bg-[#5b9763] bg-opacity-80 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2">
                  <div className="h-6 w-6 rounded-full border-2 border-white border-b-transparent animate-spin"></div>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
        {step === "payment" && (
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col mx-auto w-[95vw] max-w-[512px] my-8"
            key={2}
          >
            <h1 className="text-4xl font-logo font-bold p-4 pb-2">Payment</h1>
            <div className="flex flex-col bg-[#76c481] bg-opacity-10 rounded-2xl p-4 border border-[#76c481] border-opacity-20">
              <div className="flex gap-4 items-center">
                <motion.div className="bg-white p-3 flex items-center justify-center rounded-lg border border-[#76c481] border-opacity-20 h-20 w-20">
                  <img
                    src="/iphone-compare-iphone-14-pro-202209.jpeg"
                    className="h-full w-full object-contain"
                    alt="product"
                  />
                </motion.div>
                <div>
                  <motion.h2 className="text-2xl font-logo">
                    iPhone 15 Pro
                  </motion.h2>
                  <motion.h3 className="font-logo mt-1">$1.00 USDC</motion.h3>
                </div>
              </div>
              <motion.button className="w-full bg-[#5b9763] hover:bg-opacity-80 active:bg-opacity-90 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2">
                Pay $1,000
              </motion.button>
              <p className="text-sm text-[#5b9763] mt-2 opacity-50">
                Any transaction fees will be deducted from the payment amount.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Page;
