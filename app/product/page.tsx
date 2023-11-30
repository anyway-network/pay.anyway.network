"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount, useNetwork, erc20ABI } from "wagmi";
import MarkdownViewer from "../../components/MarkdownViewer";
import {
  sendTransaction,
  waitForTransaction,
  readContract,
  writeContract,
} from "@wagmi/core";
import tokenList from "../../assets/buy_token_list.json";

function Page() {
  const { address, isConnected } = useAccount();
  const { chain, chains } = useNetwork();

  type Data = {
    to: string;
    value: number;
    gas: number;
    chainId: number;
    sell_amount: number;
    price: string;
    gasPrice: number;
    nonce: number;
    data: string;
  };
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentToken, setPaymentToken] = useState("");
  const [paymentTokenData, setPaymentTokenData] = useState<any>(null);
  const [step, setStep] = useState("product");
  const [data, setData] = useState<Data | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [recipientData, setRecipientData] = useState<{
    _id: string;
    network: string;
    address: string;
    token_address: string;
    user_id: string;
    create_time: string;
    token_name: string;
    nickname: string;
  } | null>(null);
  const [hash, setHash] = useState("");
  const [needApprove, setNeedApprove] = useState(false);
  async function getCallbackData() {
    if (isConnected && recipientData) {
      setLoading(true);
      let productId = new URLSearchParams(location.search).get("id");
      const { _id: paymentId } = await fetch(
        `https://api.anyway.network/api/transaction/payment/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.json());
      setTransactionId(paymentId);
      const res = await fetch(
        "https://tbh-api.anyway.network/query_fees_and_calldata",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token_from: paymentToken,
            token_to: recipientData.token_address,
            network_from: chain?.name,
            network_to: recipientData.network!,
            buy_amount: productData.price * 10 ** paymentTokenData.decimals,
            sender: address,
            recipient: recipientData.address!,
            paymentId,
          }),
        }
      );
      const data = await res.json();
      let allowance = await readContract({
        chainId: data.chainId,
        //@ts-ignore
        address: paymentToken,
        functionName: "allowance",
        abi: erc20ABI,
        //@ts-ignore
        args: [address, data.to],
      });
      console.log(allowance);
      //@ts-ignore
      if (allowance < data.sell_amount) {
        // approve
        setNeedApprove(true);
      }

      setLoading(false);
      if (data.detail) {
        alert(data.detail);
        return;
      }
      setData(data);
      setStep("payment");
    } else {
      alert("Please connect your wallet");
    }
  }

  async function getApprove() {
    if (data) {
      try {
        setLoading(true);
        let approve = await writeContract({
          chainId: data.chainId,
          //@ts-ignore
          address: paymentToken,
          method: "approve",
          functionName: "approve",
          //@ts-ignore
          args: [data.to, data.sell_amount],
          abi: erc20ABI,
        });
        await waitForTransaction({
          chainId: data.chainId,
          hash: approve.hash,
        });
        setNeedApprove(false);
      } catch (e) {
        console.error(e);
        //@ts-ignore
        if (e.toString().includes("ChainMismatchError")) {
          alert("Please switch network");
        }
        //@ts-ignore
        else if (e.toString().includes("TransactionExecutionError")) {
          alert("Transaction failed");
        } else {
          alert("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    }
  }

  async function purchase() {
    if (data) {
      try {
        setLoading(true);

        let tx = await sendTransaction({
          chainId: data.chainId,
          nonce: data.nonce, // convert to bigint
          to: data.to,
          gasPrice: BigInt(data.gasPrice), // convert to bigint
          gas: BigInt(data.gas), // convert to bigint
          value: BigInt(data.value), // convert to bigint
          //@ts-ignore
          data: data.data, // add '0x' prefix to data string
        });
        setHash(tx.hash);
        await fetch(
          `https://api.anyway.network/api/transaction/${transactionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tx_id: tx.hash,
              chain_type:
                recipientData?.network === chain?.name
                  ? "same_chain"
                  : "cross_chain",
              chain_id: chain?.id,
            }),
          }
        );
        await waitForTransaction({
          chainId: data.chainId,
          hash: tx.hash,
        });
        setStep("done");
      } catch (e) {
        console.error(e);
        //@ts-ignore
        if (e.toString().includes("ChainMismatchError")) {
          alert("Please switch network");
        }
        //@ts-ignore
        else if (e.toString().includes("TransactionExecutionError")) {
          alert("Transaction failed");
        } else {
          alert("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    }
  }
  async function fetchProductData() {
    setLoading(true);
    // get product id from query params
    let productId = new URLSearchParams(location.search).get("id");
    let res = await fetch(
      `https://api.anyway.network/api/product/${productId}`
    );
    let data = await res.json();

    let recipientRes = await fetch(
      `https://api.anyway.network/api/recipient/${data.recipient_id}`
    );
    let recipientResData = await recipientRes.json();
    setLoading(false);
    if ("detail" in data || "detail" in recipientResData) {
      alert("Product not found");
      location.href = "/";
      return;
    }
    //@ts-ignore
    const tokens = tokenList[recipientResData.network!];
    recipientResData.token_name = Object.entries(tokens)
      .filter(
        //@ts-ignore
        ([token, detail]) => detail.address === recipientResData.token_address
      )
      .map(([token, detail]) => token.toUpperCase())[0];

    setProductData(data);
    setRecipientData(recipientResData);
  }
  useEffect(() => {
    fetchProductData();
  }, []);
  return (
    <>
      <div className="flex justify-between items-center p-3 sticky top-0 backdrop-blur bg-[#f5fff8] bg-opacity-90">
        <div className="text-2xl font-bold flex items-center gap-2 font-logo text-[#5b9763]">
          <img src="/logo.svg" className="w-10 h-10 inline-block" alt="logo" />
          <span className="hidden md:inline-block">AnyWay Network</span>
          <span className="md:hidden">AnyWay</span>
        </div>
        <ConnectButton />
      </div>
      <AnimatePresence mode="wait">
        {step === "product" && productData && (
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
              <motion.div className="bg-white flex items-center justify-center aspect-square rounded-lg border border-[#76c481] border-opacity-20">
                <img
                  src={productData?.image_url}
                  className="h-full w-full object-cover rounded-lg"
                  alt="product"
                />
              </motion.div>
              <motion.h2 className="text-2xl font-logo mt-3">
                {productData.name}
              </motion.h2>
              <motion.h3 className="font-logo mt-1">
                ${productData.price} {productData.token_name}
              </motion.h3>
              <MarkdownViewer content={productData.description} />
              {chain?.name && (
                <>
                  <label className="text-sm text-[#5b9763] mt-2">
                    Payment Token
                  </label>
                  <select
                    value={paymentToken}
                    onChange={(e) => {
                      let token =
                        //@ts-ignore
                        Object.entries(tokenList[chain?.name]).filter(
                          //@ts-ignore
                          ([token, detail]) => detail.address === e.target.value
                        )[0];
                      setPaymentToken(e.target.value);
                      setPaymentTokenData({
                        name: token[0],
                        //@ts-ignore
                        ...token[1],
                      });
                    }}
                    className="bg-[#5b9763] bg-opacity-10 rounded-lg mt-1 p-3 text-black flex items-center justify-center gap-2"
                  >
                    <option value="" disabled>
                      Select Payment Token
                    </option>
                    {
                      //@ts-ignore
                      Object.entries(tokenList[chain?.name]).map(
                        ([token, detail]) => (
                          //@ts-ignore
                          <option value={detail.address} key={token}>
                            {token.toUpperCase()}
                          </option>
                        )
                      )
                    }
                  </select>
                </>
              )}
              {!loading && (
                <motion.button
                  className="w-full bg-[#5b9763] hover:bg-opacity-80 active:bg-opacity-90 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => getCallbackData()}
                  disabled={!paymentToken}
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
              {!chain?.name && !paymentToken && (
                <p className="text-center">Please connect your wallet.</p>
              )}
              {loading && (
                <motion.button className="w-full bg-[#5b9763] bg-opacity-80 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2">
                  <div className="h-6 w-6 rounded-full border-2 border-white border-b-transparent animate-spin"></div>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
        {step === "payment" && data && (
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
                <motion.div className="bg-white flex items-center justify-center rounded-lg border border-[#76c481] border-opacity-20 h-20 w-20">
                  <img
                    src={productData?.image_url}
                    className="h-full w-full object-cover rounded-lg"
                    alt="product"
                  />
                </motion.div>
                <div>
                  <motion.h2 className="text-2xl font-logo">
                    {productData.name}
                  </motion.h2>
                  <motion.h3 className="font-logo mt-1">
                    {" "}
                    ${productData.price} {productData.token_name}
                  </motion.h3>
                </div>
              </div>
              {!loading && (
                <>
                  {needApprove ? (
                    <motion.button
                      className="w-full bg-[#5b9763] hover:bg-opacity-80 active:bg-opacity-90 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2"
                      onClick={() => getApprove()}
                    >
                      Approve{" "}
                      {(
                        data.sell_amount /
                        10 ** paymentTokenData.decimals
                      ).toFixed(4)}{" "}
                      {paymentTokenData.name.toUpperCase()}
                    </motion.button>
                  ) : (
                    <motion.button
                      className="w-full bg-[#5b9763] hover:bg-opacity-80 active:bg-opacity-90 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2"
                      onClick={() => purchase()}
                    >
                      Pay $
                      {(
                        data.sell_amount /
                        10 ** paymentTokenData.decimals
                      ).toFixed(4)}{" "}
                      {paymentTokenData.name.toUpperCase()}
                    </motion.button>
                  )}
                </>
              )}
              {loading && (
                <motion.button className="w-full bg-[#5b9763] bg-opacity-80 rounded-lg mt-3 p-3 text-white flex items-center justify-center gap-2">
                  <div className="h-6 w-6 rounded-full border-2 border-white border-b-transparent animate-spin"></div>
                </motion.button>
              )}
            </div>
            <p className="text-sm text-[#5b9763] mt-2 opacity-50 px-4 text-center">
              Any transaction fees will be deducted from the payment amount.
            </p>

            <div className="grid grid-cols-[8em_1fr] gap-2 mt-4 px-4 text-sm text-[#5b9763] opacity-30 hover:opacity-80 transition-opacity">
              <div className="font-bold">To</div>
              <div>{data.to}</div>
              <div className="font-bold">Value</div>
              <div>{data.value}</div>
              <div className="font-bold">Gas</div>
              <div>{data.gas}</div>
              <div className="font-bold">Chain ID</div>
              <div>{data.chainId}</div>
              <div className="font-bold">Sell Amount</div>
              <div>{data.sell_amount}</div>
              <div className="font-bold">Gas Price</div>
              <div>{data.gasPrice}</div>
              <div className="font-bold">Nonce</div>
              <div>{data.nonce}</div>
            </div>
          </motion.div>
        )}
        {step === "done" && data && (
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col mx-auto w-[95vw] max-w-[512px] my-8"
            key={3}
          >
            <h1 className="text-4xl font-logo font-bold p-4 pb-2">Done</h1>
            <div className="flex flex-col bg-[#76c481] bg-opacity-10 rounded-2xl p-4 border border-[#76c481] border-opacity-20">
              <h1 className="text-2xl font-logo">Payment Successful</h1>
              <p className="mt-2">
                Your payment has been successfully processed.
              </p>
            </div>
            <div className="flex flex-col bg-[#76c481] bg-opacity-10 rounded-2xl p-4 border border-[#76c481] border-opacity-20 mt-2">
              <div className="flex gap-4 items-center">
                <motion.div className="bg-white flex items-center justify-center rounded-lg border border-[#76c481] border-opacity-20 h-20 w-20">
                  <img
                    src={productData?.image_url}
                    className="h-full w-full object-cover rounded-lg"
                    alt="product"
                  />
                </motion.div>
                <div>
                  <motion.h2 className="text-2xl font-logo">
                    {productData.name}
                  </motion.h2>
                  <motion.h3 className="font-logo mt-1">
                    ${productData.price} {productData.token_name}
                  </motion.h3>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[8em_1fr] gap-2 mt-4 px-4 text-sm text-[#5b9763] opacity-30 hover:opacity-80 transition-opacity">
              <div className="font-bold">To</div>
              <div>{address}</div>
              <div className="font-bold">Value</div>
              <div>{data.value}</div>
              {chain?.blockExplorers?.default?.url && (
                <>
                  <div className="font-bold">Explorer</div>
                  <div>
                    <a
                      href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Explorer 🔗
                    </a>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Page;
