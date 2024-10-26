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
	upperTeam: Team | undefined;
	lowerTeam: Team | undefined;
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

	getMatchDifferential() {
		let wins = 0;
		let losses = 0;
		for (let index = 0; index < this.matchHistory.length; index++) {
			const match = this.matchHistory[index];
			// should we use optional chaining operator here? 
			// matchHistory should only include matches that have upperSeed/lowerSeed defined
			const isUpperSeed = match.upperTeam?.seed === this.seed;
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
			const isUpperSeed = match.upperTeam?.seed === this.seed;

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
