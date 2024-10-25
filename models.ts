export class Tournament {
	teams: Team[] = [];
	root: RoundNode | undefined;
}

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

export class Team {
	name: string;

	constructor(name: string) {
		this.name = name;
	}
}

export class Match {
	id: string;
	upperSeed: number | undefined;
	lowerSeed: number | undefined;
	upperTeamWins: number;
	lowerTeamWins: number;

	constructor() {
		this.id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
		this.upperTeamWins = 0;
		this.lowerTeamWins = 0;
	}
}