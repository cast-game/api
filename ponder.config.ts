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
      address: "0x9d18a76c3609479968c43fbebee82ed81f6620d2",
      network: "baseSepolia",
      startBlock: 10671762,
    },
  },
});
