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
      address: "0xCAc80268aBae7307C2Aa9C169251EBa876303a51",
      network: "baseSepolia",
      startBlock: 13027292,
    },
  },
});
