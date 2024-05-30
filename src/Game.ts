import { ponder } from "@/generated";

ponder.on("Game:GameEnded", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("Game:OwnershipTransferred", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("Game:Purchased", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("Game:Sold", async ({ event, context }) => {
  console.log(event.args);
});
