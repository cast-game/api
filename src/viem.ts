import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { TicketsAbi } from "../abis/TicketsAbi";
import { GameAbi } from "../abis/GameAbi";
import { gameAddress, ticketsAddress } from "./constants";

const useMainnet = process.env.USE_MAINNET === "true";

const chain = useMainnet ? base : baseSepolia;

const account = privateKeyToAccount(
	process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`
);

export const client = createPublicClient({
	chain,
	transport: http(),
});

const walletClient = createWalletClient({
	chain,
	transport: http(),
	account,
});

export const getFeeAmount = async (amount: bigint) => {
	const feePercent = await client.readContract({
		address: gameAddress,
		abi: GameAbi,
		functionName: "feePercent",
	});

	return (amount * feePercent) / BigInt(100);
};

export const getChannelId = async () => {
	return await client.readContract({
		address: gameAddress,
		abi: GameAbi,
		functionName: "channelId",
	});
};

export const setTokenURI = async (castHash: string, ipfsHash: string) => {
	const tokenId = await client.readContract({
		address: ticketsAddress,
		abi: TicketsAbi,
		functionName: "castTokenId",
		args: [castHash],
	});

	const { request } = await client.simulateContract({
		account,
		address: ticketsAddress,
		abi: TicketsAbi,
		functionName: "setTokenUri",
		args: [tokenId, ipfsHash],
	});
	await walletClient.writeContract(request);
};