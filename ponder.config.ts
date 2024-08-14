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
      address: "0x1db3D1955E9De53cAE51EE196A0f56ea6e390DfF",
      network: "baseSepolia",
      startBlock: 13210134,
    },
  },
});
