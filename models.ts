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
}

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
