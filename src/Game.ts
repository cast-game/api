import { ponder } from "@/generated";
import { getChannelId, getFeeAmount, setTokenURI } from "./viem";
import { getActiveTier, neynar } from "./api";
import pinataSDK from "@pinata/sdk";

const pinata = new pinataSDK({
	pinataApiKey: process.env.PINATA_API_KEY,
	pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

ponder.on("Game:Purchased", async ({ event, context }) => {
	const { Transaction, Ticket, User } = context.db;

	const { cast } = await neynar.lookUpCastByHashOrWarpcastUrl(
		event.args.castHash,
		"hash"
	);

	const [tokenExists, channelId, feeAmount] = await Promise.all([
		Ticket.findUnique({ id: event.args.castHash }),
		getChannelId(),
		getFeeAmount(event.args.price),
	]);

	if (!tokenExists) {
		const metadata = await pinata.pinJSONToIPFS({
			name: `Cast by ${cast.author.username}`,
			description: `A cast.game ticket purchased via Farcaster. - https://warpcast.com/${cast.author.username}/${cast.hash}`,
			image: `https://client.warpcast.com/v2/cast-image?castHash=${cast.hash}`,
			properties: {
				cast_hash: cast.hash,
				author_fid: cast.author.fid.toString(),
			},
		});

		await setTokenURI(event.args.castHash, metadata.IpfsHash);
		console.log(
			`Metadata: set ${metadata.IpfsHash} for castHash: ${event.args.castHash}`
		);
	}

	await Promise.all([
		// Update ticket supply
		await Ticket.upsert({
			id: event.args.castHash,
			create: {
				channelId,
				supply: event.args.amount,
				holders: [event.args.buyer],
				activeTier: await getActiveTier(cast),
			},
			update: ({ current }) => ({
				supply: current.supply + event.args.amount,
				holders: current.holders.includes(event.args.buyer)
					? current.holders
					: [...current.holders, event.args.buyer],
			}),
		}),
		// Increase buyer balance
		await User.upsert({
			id: `${event.args.buyer.toLowerCase()}:${event.args.castHash}`,
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
			id: `${event.args.castCreator.toLowerCase()}:${event.args.castHash}`,
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
			id: `${event.args.referrer.toLowerCase()}:${event.args.castHash}`,
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
	const { User, Ticket, Transaction } = context.db;

	const [channelId, feeAmount, user] = await Promise.all([
		getChannelId(),
		getFeeAmount(event.args.price),
		await User.findUnique({
			id: `${event.args.seller.toLowerCase()}:${event.args.castHash}`,
		}),
	]);

	await Promise.all([
		// Update ticket supply + holders
		await Ticket.update({
			id: event.args.castHash,
			data: ({ current }) => ({
				supply: current.supply - event.args.amount,
				holders:
					user?.ticketBalance! > event.args.amount
						? current.holders
						: current.holders.filter((holder) => holder !== event.args.seller),
			}),
		}),
		// Decrease seller balance
		await User.update({
			id: `${event.args.seller.toLowerCase()}:${event.args.castHash}`,
			data: ({ current }) => ({
				ticketBalance: current.ticketBalance - event.args.amount,
			}),
		}),
		// Track creator fees
		await User.update({
			id: `${event.args.castCreator.toLowerCase()}:${event.args.castHash}`,
			data: ({ current }) => ({
				creatorFeesEarned: current.creatorFeesEarned + feeAmount,
			}),
		}),
		// Track referral fees
		await User.upsert({
			id: `${event.args.referrer.toLowerCase()}:${event.args.castHash}`,
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
