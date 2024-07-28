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
      address: "0x95Fe2f778BA3DA6116636860bf40aC12C41b813E",
      network: "baseSepolia",
      startBlock: 13210134,
    },
  },
});
