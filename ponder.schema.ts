import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
	GameStats: p.createTable({
		id: p.bigint(),
		users: p.string().list(),
	}),
	User: p.createTable({
		// address:castHash
		id: p.string(),
		ticketBalance: p.bigint(),
		referralFeesEarned: p.bigint(),
		creatorFeesEarned: p.bigint(),
	}),
	Ticket: p.createTable({
		// cast hash
		id: p.string(),
		channelId: p.string(),
		supply: p.bigint(),
		holders: p.bigint().list(),
		activeTier: p.bigint(),
	}),
	Transaction: p.createTable({
		id: p.string(),
		type: p.string(),
		senderFid: p.bigint(),
    senderAddress: p.string(),
		castHash: p.string(),
		amount: p.bigint(),
		price: p.bigint(),
		timestamp: p.bigint(),
	}),
}));
