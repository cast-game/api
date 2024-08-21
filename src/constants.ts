export const gameAddress = "0x1db3D1955E9De53cAE51EE196A0f56ea6e390DfF";
export const ticketsAddress = "0xedee0c6A3Ef8CEF3cAAa21Df3908379D83012B75";

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