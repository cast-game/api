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
    holders: p.string().list(),
  }),
  Transaction: p.createTable({
    id: p.string(),
    type: p.string(),
    sender: p.string(),
    castHash: p.string(),
    amount: p.bigint(),
    price: p.bigint(),
    timestamp: p.bigint(),
  })
}));
