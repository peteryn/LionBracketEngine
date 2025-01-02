export type Seed = number;

// export class MatchRecord {
// 	upperSeed: Seed;
// 	lowerSeed: Seed;
// 	upperSeedWins: number;
// 	lowerSeedWins: number;

// 	constructor(upperSeed: Seed, lowerSeed: Seed) {
// 		this.upperSeed = upperSeed;
// 		this.lowerSeed = lowerSeed;
// 		this.upperSeedWins = 0;
// 		this.lowerSeedWins = 0;
// 	}
// }

export type MatchId = {
	matchId: string;
};

export type UpperRecord = {
	type: "UpperRecord";
	upperSeed: Seed;
	// consider removing upper seed wins if we want to disallow predicting
	// number of wins for a team when the opponent has not been determined yet
	upperSeedWins: number;
};

export type LowerRecord = {
	type: "LowerRecord";
	lowerSeed: Seed;
	lowerSeedWins: number;
};

export type FullRecord = {
	type: "FullRecord";
	upperSeed: Seed;
	lowerSeed: Seed;
	upperSeedWins: number;
	lowerSeedWins: number;
};

export type EmptyRecord = {
	type: "EmptyRecord";
};

export function FullRecordFactory(upperSeed: Seed, lowerSeed: Seed): FullRecord {
	return {
		type: "FullRecord",
		upperSeed: upperSeed,
		lowerSeed: lowerSeed,
		upperSeedWins: 0,
		lowerSeedWins: 0,
	};
}

export type MatchRecord = UpperRecord | LowerRecord | FullRecord;
