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
      address: "0x3DC173846E9aBD600119095046f0feEa21ef58b4",
      network: "baseSepolia",
      startBlock: 11043574,
    },
  },
});
