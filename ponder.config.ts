import { createConfig } from "@ponder/core";
import { http } from "viem";

import { GameAbi } from "./abis/GameAbi";

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: 84532,
      transport: http(process.env.PONDER_RPC_URL_84532),
    },
  },
  contracts: {
    Game: {
      abi: GameAbi,
      address: "0x116affed0a9e9dfb5ee4dd769a8b8a2a476f9927",
      network: "baseSepolia",
      startBlock: 11043574,
    },
  },
});
