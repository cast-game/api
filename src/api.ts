import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

export const getActiveTier = async (address: string) => {
  const res = await neynar.fetchBulkUsersByEthereumAddress([address]);

  const meta = {
    "x-dune-api-key": "LTug38ZlH9FblTfYjwLCyaJ768mMHsTs" || "",
  };
  const header = new Headers(meta);
  try {
    const latest_response = await fetch(
      `https://api.dune.com/api/v1/query/3418402/results?&filters=fid=${
        res[address]![0]?.fid
      }`,
      {
        method: "GET",
        headers: header,
      }
    );

    const body = await latest_response.text();
    const recs = JSON.parse(body).result.rows[0];
    return BigInt(recs.fid_active_tier);
  } catch (error) {
    return 0n;
  }
};
