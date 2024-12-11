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
	promotionTeams: Team[];
	eliminatedTeams: Team[];

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
		this.promotionTeams = [];
		this.eliminatedTeams = [];
	}

	toString(): string {
		return `RoundNode: { name: ${this.name}, numTeams: ${this.numTeams}, winRecord: ${this.winRecord}, loseRecord: ${this.loseRecord} }`;
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

export interface Team {
	seed: number;
}

export function getMatchDifferential(team: Team, matchHistory: MatchRecord[]) {
	let wins = 0;
	let losses = 0;
	for (let index = 0; index < matchHistory.length; index++) {
		const match = matchHistory[index];
		const isUpperSeed = match.upperTeam.seed === team.seed;
		// if the match is a draw, do not count it as a win or loss
		if (match.upperTeamWins === match.lowerTeamWins) {
			continue;
		}
		const isUpperTeamWinner = match.upperTeamWins > match.lowerTeamWins;

		if ((isUpperSeed && isUpperTeamWinner) || (!isUpperSeed && !isUpperTeamWinner)) {
			wins++;
		} else {
			losses++;
		}
	}
	return wins - losses;
}

export function getGameDifferential(team: Team, matchHistory: MatchRecord[]) {
	let gamesWon = 0;
	let gamesLost = 0;
	for (let index = 0; index < matchHistory.length; index++) {
		const match = matchHistory[index];
		const isUpperSeed = match.upperTeam.seed === team.seed;

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

export interface MatchRecordSerialized {
	upperTeamWins: number;
	lowerTeamWins: number;
}

export interface MatchTracker {
	upperTeam: Team;
	lowerTeam: Team;
	invalidIndexes: number[];
	index: number;
}

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
