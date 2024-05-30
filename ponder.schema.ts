import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Transaction: p.createTable({
    id: p.string(),
    type: p.string(),
    senderFid: p.bigint(),
    castHash: p.string(),
    amount: p.bigint(),
    timestamp: p.bigint(),
  })
}));
