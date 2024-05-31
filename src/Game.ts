import { ponder } from "@/generated";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import {
	getChannelId,
	getFeeAmount,
	getTicketBalance,
	getTokenBalance,
} from "./viem";

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

ponder.on("Game:Purchased", async ({ event, context }) => {
	const { Transaction, Round, Ticket, User } = context.db;
	console.log(event.args);

	const [channelId, feeAmount, isHolder] = await Promise.all([
		getChannelId(),
		getFeeAmount(event.args.price),
		!!(await User.findUnique({
			id: `${event.args.buyer}:${event.args.castHash}`,
		})),
	]);

	await Promise.all([
		// Increase prize pool
		await Round.update({
			id: channelId,
			data: ({ current }) => ({
				prizePool: current.prizePool + event.args.price,
			}),
		}),
		// Update ticket supply + holders
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
		}),
		// Increase buyer balance
		await User.upsert({
			id: `${event.args.buyer}:${event.args.castHash}`,
			create: {
				ticketBalance: event.args.amount,
				referralFeesEarned: 0n,
				creatorFeesEarned: 0n,
			},
			update: ({ current }) => ({
				ticketBalance: current.ticketBalance + event.args.amount,
			}),
		}),
		// Track creator fees
		await User.upsert({
			id: `${event.args.castCreator}:${event.args.castHash}`,
			create: {
				ticketBalance: 0n,
				referralFeesEarned: 0n,
				creatorFeesEarned: feeAmount,
			},
			update: ({ current }) => ({
				creatorFeesEarned: current.creatorFeesEarned + feeAmount,
			}),
		}),
		// Track referral fees
		await User.upsert({
			id: `${event.args.referrer}:${event.args.castHash}`,
			create: {
				ticketBalance: 0n,
				referralFeesEarned: feeAmount,
				creatorFeesEarned: 0n,
			},
			update: ({ current }) => ({
				referralFeesEarned: current.referralFeesEarned + feeAmount,
			}),
		}),
		// Log transaction
		await Transaction.create({
			id: event.log.id,
			data: {
				castHash: event.args.castHash,
				type: "buy",
				sender: event.args.buyer,
				price: event.args.price,
				amount: event.args.amount,
				timestamp: BigInt(new Date().getTime()),
			},
		}),
	]);
});

ponder.on("Game:Sold", async ({ event, context }) => {
	const { User, Ticket, Transaction, Round } = context.db;
	console.log(event.args);

	const [channelId, feeAmount, ticketBalance] = await Promise.all([
		getChannelId(),
		getFeeAmount(event.args.price),
		getTicketBalance(event.args.seller, event.args.castHash),
	]);

	await Promise.all([
		// Decrease prize pool
		await Round.update({
			id: channelId,
			data: ({ current }) => ({
				prizePool: current.prizePool - event.args.price,
			}),
		}),
		// Update ticket supply + holders
		await Ticket.update({
			id: event.args.castHash,
			data: ({ current }) => ({
				supply: current.supply + event.args.amount,
				holdersCount:
					ticketBalance === 0n
						? current.holdersCount - 1n
						: current.holdersCount,
			}),
		}),
		// Decrease seller balance
		await User.update({
			id: `${event.args.seller}:${event.args.castHash}`,
			data: ({ current }) => ({
				ticketBalance: current.ticketBalance - event.args.amount,
			}),
		}),
		// Track creator fees
		await User.update({
			id: `${event.args.castCreator}:${event.args.castHash}`,
			data: ({ current }) => ({
				creatorFeesEarned: current.creatorFeesEarned + feeAmount,
			}),
		}),
		// Track referral fees
		await User.upsert({
			id: `${event.args.referrer}:${event.args.castHash}`,
			create: {
				ticketBalance: 0n,
				referralFeesEarned: feeAmount,
				creatorFeesEarned: 0n,
			},
			update: ({ current }) => ({
				referralFeesEarned: current.referralFeesEarned + feeAmount,
			}),
		}),
		// Log transaction
		await Transaction.create({
			id: event.log.id,
			data: {
				castHash: event.args.castHash,
				type: "sell",
				sender: event.args.seller,
				price: event.args.price,
				amount: event.args.amount,
				timestamp: BigInt(new Date().getTime()),
			},
		}),
	]);
});
