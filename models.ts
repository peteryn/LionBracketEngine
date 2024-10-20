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

	constructor(name: string, numTeams: number, winRecord: number, loseRecord: number) {
		this.name = name;
		this.numTeams = numTeams;
		this.winRecord = winRecord;
		this.loseRecord = loseRecord;
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
