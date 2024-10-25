export class RoundNode {
	name: string;
	numTeams: number;
	winRecord: number;
	loseRecord: number;
	winningRound: RoundNode | undefined;
	losingRound: RoundNode | undefined;
	matches: Match[];

	constructor(name: string, numTeams: number, winRecord: number, loseRecord: number) {
		this.name = name;
		this.numTeams = numTeams;
		this.winRecord = winRecord;
		this.loseRecord = loseRecord;
		this.matches = [];
	}

	toString(): string {
		return `RoundNode: { name: ${this.name}, numTeams: ${this.numTeams}, winRecord: ${this.winRecord}, loseRecord: ${this.loseRecord} }`;
	}
}

export class Match {
	id: string;
	upperSeed: number | undefined;
	lowerSeed: number | undefined;
	upperTeamWins: number;
	lowerTeamWins: number;

	constructor(nodeName: string, index: number) {
		this.id = `${nodeName}.${index}`;
		this.upperTeamWins = 0;
		this.lowerTeamWins = 0;
	}
}

export class Team {
	seed: number;
	matchHistory: Match[];

	constructor(seed: number) {
		this.seed = seed;
		this.matchHistory = [];
	}
}