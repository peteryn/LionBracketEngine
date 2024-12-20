export class RoundNode {
	name: string;
	numSeeds: number;
	winRecord: number;
	loseRecord: number;
	winningRound: RoundNode | undefined;
	losingRound: RoundNode | undefined;
	matches: Match[];
	level: number;
	has2Parents: boolean;
	// TODO: these can probably be removed in a refactor
	promotionSeeds: Seed[];
	eliminationSeeds: Seed[];

	constructor(
		name: string,
		numSeeds: number,
		winRecord: number,
		loseRecord: number,
		level: number
	) {
		this.name = name;
		this.numSeeds = numSeeds;
		this.winRecord = winRecord;
		this.loseRecord = loseRecord;
		this.matches = [];
		this.level = level;
		this.has2Parents = false;
		this.promotionSeeds = [];
		this.eliminationSeeds = [];
	}
}

export class Match {
	id: string;
	matchRecord: MatchRecord | undefined;

	constructor(nodeName: string, index: number) {
		this.id = `${nodeName}.${index}`;
	}
}

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

export type Seed = number;

export function getMatchDifferential(seed: Seed, matchHistory: MatchRecord[]) {
	let wins = 0;
	let losses = 0;
	for (let index = 0; index < matchHistory.length; index++) {
		const match = matchHistory[index];
		const isUpperSeed = match.upperSeed === seed;
		// if the match is a draw, do not count it as a win or loss
		if (match.upperSeedWins === match.lowerSeedWins) {
			continue;
		}
		const isUpperSeedWinner = match.upperSeedWins > match.lowerSeedWins;

		if ((isUpperSeed && isUpperSeedWinner) || (!isUpperSeed && !isUpperSeedWinner)) {
			wins++;
		} else {
			losses++;
		}
	}
	return wins - losses;
}

export function getGameDifferential(seed: Seed, matchHistory: MatchRecord[]) {
	let gamesWon = 0;
	let gamesLost = 0;
	for (let index = 0; index < matchHistory.length; index++) {
		const match = matchHistory[index];
		const isUpperSeed = match.upperSeed === seed;

		if (isUpperSeed) {
			gamesWon += match.upperSeedWins;
			gamesLost += match.lowerSeedWins;
		} else {
			gamesWon += match.lowerSeedWins;
			gamesLost += match.upperSeedWins;
		}
	}
	return gamesWon - gamesLost;
}

export interface MatchRecordSerialized {
	upperSeedWins: number;
	lowerSeedWins: number;
}

export type MatchTracker = {
	upperSeed: Seed;
	lowerSeed: Seed;
	invalidIndexes: number[];
	index: number;
};

export interface TeamNameMap {
	seed: number;
	name: string;
}

export interface TournamentData {
	teamNames: TeamNameMap[];
	"0-0": MatchRecord[];
	"1-0": MatchRecord[];
	"0-1": MatchRecord[];
	"2-0": MatchRecord[];
	"1-1": MatchRecord[];
	"0-2": MatchRecord[];
	"2-1": MatchRecord[];
	"1-2": MatchRecord[];
	"2-2": MatchRecord[];
}
