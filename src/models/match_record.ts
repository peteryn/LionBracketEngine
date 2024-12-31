export type Seed = number;

export class MatchRecord {
	upperSeed: Seed;
	lowerSeed: Seed;
	upperSeedWins: number;
	lowerSeedWins: number;

	constructor(upperSeed: Seed, lowerSeed: Seed) {
		this.upperSeed = upperSeed;
		this.lowerSeed = lowerSeed;
		this.upperSeedWins = 0;
		this.lowerSeedWins = 0;
	}
}

export type UpperRecord = {
	upperSeed: Seed;
	upperSeedWins: number;
};

export type LowerRecord = {
	lowerSeed: Seed;
	lowerSeedWins: number;
};

export type FullRecord = UpperRecord & LowerRecord;

export type MatchRecord2 = UpperRecord | LowerRecord | FullRecord;
