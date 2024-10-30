export class RoundNode {
	name: string;
	numTeams: number;
	winRecord: number;
	loseRecord: number;
	winningRound: RoundNode | undefined;
	losingRound: RoundNode | undefined;
	matches: Match[];
	level: number;
	fromUpperParent: Team[];
	fromLowerParent: Team[];
	has2Parents: boolean;

	constructor(
		name: string,
		numTeams: number,
		winRecord: number,
		loseRecord: number,
		level: number
	) {
		this.name = name;
		this.numTeams = numTeams;
		this.winRecord = winRecord;
		this.loseRecord = loseRecord;
		this.matches = [];
		this.level = level;
		this.fromUpperParent = [];
		this.fromLowerParent = [];
		this.has2Parents = false;
	}

	toString(): string {
		return `RoundNode: { name: ${this.name}, numTeams: ${this.numTeams}, winRecord: ${this.winRecord}, loseRecord: ${this.loseRecord} }`;
	}
}

export class Match {
	id: string;
	roundNode: RoundNode | undefined;
	matchRecord: MatchRecord | undefined;

	constructor(nodeName: string, index: number, node?: RoundNode) {
		this.id = `${nodeName}.${index}`;
		this.roundNode = node;
	}
}

export class MatchRecord {
	upperTeam: Team;
	lowerTeam: Team;
	upperTeamWins: number;
	lowerTeamWins: number;

	constructor(upperTeam: Team, lowerTeam: Team) {
		this.upperTeam = upperTeam;
		this.lowerTeam = lowerTeam;
		this.upperTeamWins = 0;
		this.lowerTeamWins = 0;
	}

	isFilledOut() {
		return this.upperTeamWins - this.lowerTeamWins !== 0;
	}
}

// TODO potentially change to interface and make methods functional for better serialization
export class Team {
	seed: number;
	matchHistory: MatchRecord[];

	constructor(seed: number) {
		this.seed = seed;
		this.matchHistory = [];
	}

	getMatchDifferential() {
		let wins = 0;
		let losses = 0;
		for (let index = 0; index < this.matchHistory.length; index++) {
			const match = this.matchHistory[index];
			const isUpperSeed = match.upperTeam.seed === this.seed;
			const isUpperTeamWinner = match.upperTeamWins > match.lowerTeamWins;

			if ((isUpperSeed && isUpperTeamWinner) || (!isUpperSeed && !isUpperTeamWinner)) {
				wins++;
			} else {
				losses++;
			}
		}
		return wins - losses;
	}

	getGameDifferential() {
		let gamesWon = 0;
		let gamesLost = 0;
		for (let index = 0; index < this.matchHistory.length; index++) {
			const match = this.matchHistory[index];
			const isUpperSeed = match.upperTeam.seed === this.seed;

			if (isUpperSeed) {
				gamesWon += match.upperTeamWins;
				gamesLost += match.lowerTeamWins;
			} else {
				gamesWon += match.lowerTeamWins;
				gamesLost += match.upperTeamWins;
			}
		}
		return gamesWon - gamesLost;
	}
}

export interface MatchRecordSerialized {
	upperTeamWins: number;
	lowerTeamWins: number;
}
