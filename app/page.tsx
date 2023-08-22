"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useState } from "react";
function Page() {
  const [loading, setLoading] = useState(false);
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
      <motion.div
        initial={{ opacity: 0, y: 200 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col mx-auto w-[95vw] max-w-[512px] my-8"
      >
        <h1 className="text-4xl font-logo font-bold p-4 pb-2">Payment</h1>
        <div className="flex flex-col bg-[#76c481] bg-opacity-10 rounded-2xl p-4 border border-[#76c481] border-opacity-20">
          <div className="bg-white p-8 flex items-center justify-center aspect-square rounded-lg border border-[#76c481] border-opacity-20">
            <img
              src="/iphone-compare-iphone-14-pro-202209.jpeg"
              className="h-[300px]"
              alt="product"
            />
          </div>
          <h2 className="text-2xl font-logo mt-3">iPhone 15 Pro</h2>
          <h3 className="font-logo mt-1">$1,499.00 USDC</h3>
          <ul className="mt-2 list-disc px-4">
            <li className="font-bold">Demo</li>
            <li>6.1-inch Super Retina XDR display</li>
            <li>Ceramic Shield, tougher than any smartphone glass</li>
            <li>
              Advanced dual-camera system with 12MP Wide and Telephoto cameras
            </li>
            <li>Industry-leading IP68 water resistance</li>
            <li>USB-C connector for charging and accessories</li>
          </ul>
          {!loading && (
            <button
              className="w-full bg-[#5b9763] hover:bg-opacity-80 active:bg-opacity-90 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2"
              onClick={() => setLoading(true)}
            >
              Pay with{" "}
              <img
                src="/logo.svg"
                className="w-6 h-6 inline-block"
                alt="logo"
              />{" "}
              <span className="font-logo">AnyWay</span>
            </button>
          )}
          {loading && (
            <button className="w-full bg-[#5b9763] bg-opacity-80 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2">
              <div className="h-6 w-6 rounded-full border-2 border-white border-b-transparent animate-spin"></div>
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default Page;
