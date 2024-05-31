import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  User: p.createTable({
    // evm address
    id: p.bigint(),
    ticketBalance: p.bigint(),
    referralFeesEarned: p.bigint(),
    creatorFeesEarned: p.bigint(),
  }),
  Transaction: p.createTable({
    id: p.string(),
    type: p.string(),
    senderFid: p.bigint(),
    castHash: p.string(),
    amount: p.bigint(),
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
