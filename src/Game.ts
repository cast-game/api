import { ponder } from "@/generated";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { getChannelId, getFeeAmount, getTokenBalance } from "./viem";

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
	const { Round } = context.db;
	console.log(event.args);

	const channelId = await getChannelId();

	await Round.update({
		id: channelId,
		data: {
			winnerCastHash: event.args.castHash,
		},
	});
});

// ponder.on("Game:OwnershipTransferred", async ({ event, context }) => {});

ponder.on("Game:Purchased", async ({ event, context }) => {
	const { Transaction, Round, Ticket, User } = context.db;
	console.log(event.args);

	const res = await neynar.fetchBulkUsersByEthereumAddress([event.args.buyer]);
	const user = res[event.args.buyer]![0]!;

	const channelId = await getChannelId();
	const feeAmount = await getFeeAmount(event.args.price);

	// Increase prize pool
	await Round.update({
		id: channelId,
		data: ({ current }) => ({
			prizePool: current.prizePool + event.args.price,
		}),
	});

	// Update ticket supply + holders
	const isHolder = !!(await User.findUnique({
		id: `${event.args.buyer}:${event.args.castHash}`,
	}));

	await Ticket.upsert({
		id: event.args.castHash,
		create: {
			channelId,
			supply: event.args.amount,
			holdersCount: BigInt(1),
		},
		update: ({ current }) => ({
			supply: current.supply + event.args.amount,
			holdersCount: isHolder
				? current.holdersCount
				: current.holdersCount + BigInt(1),
		}),
	});

	// Increase buyer balance
	await User.upsert({
		id: `${event.args.buyer}:${event.args.castHash}`,
		create: {
			ticketBalance: event.args.amount,
			referralFeesEarned: BigInt(0),
			creatorFeesEarned: BigInt(0),
		},
		update: ({ current }) => ({
			ticketBalance: current.ticketBalance + event.args.amount,
		}),
	});

	// Track creator fees
	await User.upsert({
		id: `${event.args.castCreator}:${event.args.castHash}`,
		create: {
			ticketBalance: BigInt(0),
			referralFeesEarned: BigInt(0),
			creatorFeesEarned: feeAmount,
		},
		update: ({ current }) => ({
			creatorFeesEarned: current.creatorFeesEarned + feeAmount,
		}),
	});

	// Track referral fees
	await User.upsert({
		id: `${event.args.referrer}:${event.args.castHash}`,
		create: {
			ticketBalance: BigInt(0),
			referralFeesEarned: feeAmount,
			creatorFeesEarned: BigInt(0),
		},
		update: ({ current }) => ({
			referralFeesEarned: current.referralFeesEarned + feeAmount,
		}),
	});

	// Log transaction
	await Transaction.create({
		id: event.log.id,
		data: {
			castHash: event.args.castHash,
			type: "buy",
			senderFid: BigInt(user.fid),
			price: event.args.price,
			amount: event.args.amount,
			timestamp: BigInt(new Date().getTime()),
		},
	});
});

ponder.on("Game:Sold", async ({ event, context }) => {
	const { Transaction, Round } = context.db;
	console.log(event.args);
});
