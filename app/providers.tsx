"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygon, avalanche, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Loader from "../components/loader";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    avalanche,
    polygon,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : []),
  ],
  [publicProvider()]
);

const projectId = "c9e9f40f8b5dad4cb5019add27c3a606";

const { wallets } = getDefaultWallets({
  appName: "AnyWay Network",
  projectId,
  chains,
});

const demoAppInfo = {
  appName: "AnyWay Network",
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} appInfo={demoAppInfo}>
        {mounted ? children : <Loader />}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
