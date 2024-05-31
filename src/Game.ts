import { ponder } from "@/generated";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { getChannelId, getTokenBalance } from "./viem";

const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

ponder.on("Game:GameStarted", async ({ event, context }) => {
	const { Round } = context.db;
	console.log(event.args);

	const prizePool = await getTokenBalance(context.contracts.Game.address);
	const channelId = await getChannelId();

	await Round.create({
		id: channelId,
		data: {
			prizePool,
			startTime: event.log.blockNumber,
			tradingEndTime: event.args.tradingEndTime,
			endTime: event.args.endTime,
			winnerCastHash: "",
		},
	});
});

ponder.on("Game:GameEnded", async ({ event, context }) => {
});

ponder.on("Game:OwnershipTransferred", async ({ event, context }) => {
	console.log(event.args);
});

ponder.on("Game:Purchased", async ({ event, context }) => {
	const { Transaction, Round } = context.db;
	console.log(event.args);

	const res = await neynar.fetchBulkUsersByEthereumAddress([event.args.buyer]);

	// get erc20 transfer amount from tx

	// TODO: increase prize pool

	await Transaction.create({
		id: event.log.id,
		data: {
			castHash: event.args.castHash,
			type: "buy",
			senderFid: BigInt(res[event.args.buyer]![0]!.fid),
			amount: event.args.amount,
			timestamp: BigInt(new Date().getTime()),
		},
	});
});

ponder.on("Game:Sold", async ({ event, context }) => {
	console.log(event.args);
});
