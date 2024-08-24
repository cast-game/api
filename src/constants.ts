export const gameAddress = "0x9B2839f3a1B76F00dCb23580AfDa8d93FAe334F9";
export const channelId = "castgame";

// in ETH
export const priceTiers = [
	{
		basePrice: 0.0001, // $0.25
		curveExponent: 1.2,
    scaleFactor: 0.00015,
	},
  {
		basePrice: 0.0002, // $0.50
		curveExponent: 1.25,
    scaleFactor: 0.00015,
	},
  {
		basePrice: 0.0004, // $1
		curveExponent: 1.3,
    scaleFactor: 0.00015,
	},
  {
		basePrice: 0.0006, // $1.50
		curveExponent: 1.3,
    scaleFactor: 0.0002,
	},
  {
		basePrice: 0.0008, // $2
		curveExponent: 1.35,
    scaleFactor: 0.0002,
	},
];