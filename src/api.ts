import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { priceTiers } from "./constants";
import { Cast } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { parseEther } from "viem";

export const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

export const getActiveTier = async (cast: Cast) => {
	const user = cast.author;

	let tier;
	if (user.follower_count < 400) {
		tier = 0;
	} else if (user.follower_count > 400 && user.follower_count < 1000) {
		tier = 1;
	} else if (user.follower_count > 1000 && user.follower_count < 10000) {
		tier = 2;
	} else if (user.follower_count > 10000 && user.follower_count < 50000) {
		tier = 3;
	} else {
		tier = 4;
	}

	if (!user.power_badge && tier > 0) tier--;
	return BigInt(tier);
};

export function getPrice(
	tier: number,
	supply: number,
	applyFee?: boolean
): bigint {
	const priceTier = priceTiers[tier]!;
	const growthRate =
		Math.log(priceTier.priceAt50 / priceTier.startingPrice) / 50;
	const newSupply = supply;
	const pricePerShare =
		priceTier.startingPrice * Math.exp(growthRate * newSupply);
	const result = (Math.ceil(pricePerShare * 100000) / 100000)

	if (applyFee) return parseEther((result * 0.64).toString());
	return parseEther(result.toString());
}
