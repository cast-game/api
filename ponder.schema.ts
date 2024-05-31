import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
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
    holdersCount: p.bigint()
  }),
  Transaction: p.createTable({
    id: p.string(),
    type: p.string(),
    sender: p.string(),
    castHash: p.string(),
    amount: p.bigint(),
    price: p.bigint(),
    timestamp: p.bigint(),
  }),
  Round: p.createTable({
    // channel id
    id: p.string(),
    prizePool: p.bigint(),
    startTime: p.bigint(),
    tradingEndTime: p.bigint(),
    endTime: p.bigint(),
    winnerCastHash: p.string(),
  }),
}));
