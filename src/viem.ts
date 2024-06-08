import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { TicketsAbi } from "../abis/TicketsAbi";
import { DegenAbi } from "../abis/DegenAbi";
import { GameAbi } from "../abis/GameAbi";

const useMainnet = process.env.USE_MAINNET === "true";

const gameAddress = "0x3DC173846E9aBD600119095046f0feEa21ef58b4";
const ticketsAddress = "0x85e80330806bd6c9032a2dFA5eb40bAAba030d94";

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

export const setTokenURI = async (tokenId: bigint, ipfsHash: string) => {
	const { request } = await client.simulateContract({
		account,
		address: ticketsAddress,
		abi: TicketsAbi,
		functionName: "setTokenUri",
		args: [tokenId, ipfsHash],
	});
	await walletClient.writeContract(request);
};