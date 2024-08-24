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
      address: "0x9B2839f3a1B76F00dCb23580AfDa8d93FAe334F9",
      network: "baseSepolia",
      startBlock: 14372488,
    },
  },
});
