import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { TicketsAbi } from "../abis/TicketsAbi";
import { DegenAbi } from "../abis/DegenAbi";
import { GameAbi } from "../abis/GameAbi";

const useMainnet = process.env.USE_MAINNET === "true";

const gameAddress = "0x9d18a76c3609479968c43fbebee82ed81f6620d2";
const ticketsAddress = "0xbf45933b41fa7733a8cb5b94fc4791cd4f1d0967";
// $DEGEN
// const tokenAddress = "0x4ed4e862860bed51a9570b96d89af5e1b0efefed";
// test token
const tokenAddress = "0x6E67E6AE4A1fB0b8c45897ECCfdCE8408B1e1640";

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

export const getTokenBalance = async (address: string) =>
	await client.readContract({
		address: tokenAddress,
		abi: DegenAbi,
		functionName: "balanceOf",
		args: [address as `0x${string}`],
	});

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

export const getTicketBalance = async (account: string, castHash: string) => {
	const tokenId = await client.readContract({
		address: ticketsAddress,
		abi: TicketsAbi,
		functionName: "castTokenId",
		args: [castHash],
	});

	return await client.readContract({
		address: ticketsAddress,
		abi: TicketsAbi,
		functionName: "balanceOf",
		args: [account as `0x${string}`, tokenId],
	});
};
