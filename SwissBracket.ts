import { assert } from "@std/assert/assert";
import { Match, MatchRecord, RoundNode, Team, type MatchTracker } from "./models.ts";

export class SwissBracket {
	rootRound: RoundNode;
	matches: Map<string, Match>;
	teams: Team[];

	constructor(numTeams: number = 16, winRequirement: number = 3) {
		this.rootRound = this.createStructure(numTeams, winRequirement);
		this.matches = this.initializeEmptyMatches(this.rootRound);
		this.teams = createTeams(numTeams);
		// populate root round with the teams in the correct matches
		const matchups = evaluationSort(this.teams);
		populateMatches(this.rootRound.matches, matchups);
	}

	// matchNumber is 1-indexed
	getMatchRecord(roundName: string, matchNumber: number) {
		return this.getMatchRecordById(`${roundName}.${matchNumber - 1}`);
	}

	setMatchRecord(roundName: string, matchNumber: number, matchRecord: MatchRecord) {
		return this.setMatchRecordById(`${roundName}.${matchNumber - 1}`, matchRecord);
	}

	getMatch(matchId: string): Match | undefined {
		return this.matches.get(matchId);
	}

	getMatchRecordById(matchId: string): MatchRecord | undefined {
		return this.getMatch(matchId)?.matchRecord;
	}

	setMatchRecordById(matchId: string, matchRecord: MatchRecord): boolean {
		const match = this.getMatch(matchId);
		if (match) {
			match.matchRecord = matchRecord;

			const roundNode = match.roundNode;
			if (roundNode) {
				// then traverse starting at that node do the traversal
				// with a callback that updates the next round
				this.updateRounds(roundNode);
			}
			return true;
		}
		return false;
	}

	// implementation 1: delete future round data because it is not valid anymore
	// this should only be called on the roundNode that has a match that has been updated
	// a different implementation will be called on all dependent nodes
	updateRounds(roundNode: RoundNode): boolean {
		// check to see if round is filled out (no ties in upperTeamWins and lowerTeamWins)
		const isFilleldOut = isFilledRound(roundNode.matches);
		// if it is not filled out, then we can stop
		if (!isFilleldOut) {
			return false;
		}

		// clear out the history of future rounds for teams in this current roundNode
		const teams: Team[] = roundNode.matches.flatMap((match: Match) => {
			if (match.matchRecord) {
				return [match.matchRecord.upperTeam, match.matchRecord.lowerTeam];
			} else {
				return [];
			}
		});
		for (let index = 0; index < teams.length; index++) {
			const team = teams[index];
			team.matchHistory = team.matchHistory.slice(0, roundNode.level);
		}

		// update the match record status in the dependent RoundNodes
		// this includes updating what teams are in those future matches
		if (roundNode.winningRound) {
			this.levelOrderTraversal(roundNode.winningRound, (node) => {
				const matches = node.matches;
				for (let index = 0; index < matches.length; index++) {
					const match = matches[index];
					match.matchRecord = undefined;
				}
			});
		}

		if (roundNode.losingRound) {
			this.levelOrderTraversal(roundNode.losingRound, (node) => {
				const matches = node.matches;
				for (let index = 0; index < matches.length; index++) {
					const match = matches[index];
					match.matchRecord = undefined;
				}
			});
		}

		// split teams into winners and losers
		const winners: Team[] = [];
		const losers: Team[] = [];
		roundNode.matches.map((match: Match) => {
			const matchRecord = match.matchRecord;
			if (matchRecord) {
				if (matchRecord.upperTeamWins > matchRecord.lowerTeamWins) {
					winners.push(matchRecord.upperTeam);
					losers.push(matchRecord.lowerTeam);
				} else {
					winners.push(matchRecord.lowerTeam);
					losers.push(matchRecord.upperTeam);
				}
			} else {
				throw new Error("Match record doesn't exist when it should");
			}
		});

		// need to pass winners/losers to the next node because some nodes have a 2 dependencies (2 parents)
		// after passing them, need to process them at those nodes
		// for this implementation, we only need to process roundNode.winningRound and roundNode.losingRound
		const winningRound = roundNode.winningRound;
		if (winningRound) {
			if (winningRound.has2Parents) {
				winningRound.fromLowerParent = winners;
				// calculate winning round matchups
				if (
					winningRound.fromUpperParent.length > 0 &&
					winningRound.fromLowerParent.length > 0
				) {
					const matchups = evaluationSort(
						winningRound.fromUpperParent,
						winningRound.fromLowerParent
					);
					populateMatches(winningRound.matches, matchups);
				} else {
					// do nothing, cant calculate round yet
				}
			} else {
				// process winning round by calling evaluation sort for 1 team
				const matchups = evaluationSort(winners);
				populateMatches(winningRound.matches, matchups);
			}
		} else {
			// set these stage winners in a variable somewhere else
		}

		const losingRound = roundNode.losingRound;
		if (losingRound) {
			if (losingRound.has2Parents) {
				losingRound.fromUpperParent = losers;
				if (
					losingRound.fromUpperParent.length > 0 &&
					losingRound.fromLowerParent.length > 0
				) {
					// call evaluation sort for 2 teams
					const matchups = evaluationSort(
						losingRound.fromUpperParent,
						losingRound.fromLowerParent
					);
					populateMatches(losingRound.matches, matchups);
				}
			} else {
				// process losers with sort
				const matchups = evaluationSort(losers);
				populateMatches(losingRound.matches, matchups);
			}
		} else {
			// set these stage losers in a variable somewhere else
		}

		/*
			need to edit roundNode to support a place to put teams before sorting

			after a round has been edited, should user input for future rounds be kept or deleted?
			if they are deleted, then evaluate the current round, update the direct children, and be done
			if they are kept, then need to rerun this function on future rounds that depend on this round

			IDEA: if after regenerating the matchup is the same and at the same position, keep the previous result
		*/
		return true;
	}

	private createStructure(numTeams: number = 16, winRequirement: number = 3) {
		let level = 1;
		const root = new RoundNode("0-0", numTeams, 0, 0, level);
		level++;
		let queue: RoundNode[] = [];
		queue.push(root);
		while (queue.length > 0) {
			const existingNodes: Map<string, RoundNode> = new Map();
			const newQueue: RoundNode[] = [];
			for (let i = 0; i < queue.length; i++) {
				const node = queue[i];
				// update winning child
				if (node.winRecord + 1 < winRequirement) {
					const winningNodeRecord = `${node.winRecord + 1}-${node.loseRecord}`;
					this.checkAndAddNode(existingNodes, winningNodeRecord, node, 1, 0, level);
					node.winningRound = existingNodes.get(winningNodeRecord);
				}
				// update losing child
				if (node.loseRecord + 1 < winRequirement) {
					const losingNodeRecord = `${node.winRecord}-${node.loseRecord + 1}`;
					this.checkAndAddNode(existingNodes, losingNodeRecord, node, 0, 1, level);
					node.losingRound = existingNodes.get(losingNodeRecord);
				}
			}
			existingNodes.forEach((value) => {
				newQueue.push(value);
			});
			queue = newQueue;
			level++;
		}
		return root;
	}

	private checkAndAddNode(
		existingNodes: Map<string, RoundNode>,
		nodeRecord: string,
		parentNode: RoundNode,
		addWinRecord: number,
		addLoseRecord: number,
		level: number
	) {
		const wNode = existingNodes.get(nodeRecord);
		if (wNode) {
			wNode.numTeams += parentNode.numTeams / 2;
			wNode.has2Parents = true;
			return false;
		} else {
			const newNode = new RoundNode(
				nodeRecord,
				parentNode.numTeams / 2,
				parentNode.winRecord + addWinRecord,
				parentNode.loseRecord + addLoseRecord,
				level
			);
			existingNodes.set(nodeRecord, newNode);
			return true;
		}
	}

	private initializeEmptyMatches(root: RoundNode): Map<string, Match> {
		const matches: Map<string, Match> = new Map();
		const init = (node: RoundNode) => {
			for (let index = 0; index < node.numTeams / 2; index++) {
				const match = new Match(node.name, index, node);
				matches.set(match.id, match);
				node.matches.push(match);
			}
		};
		this.levelOrderTraversal(root, init);
		return matches;
	}

	printLevels() {
		const printLevel = (level: RoundNode[]) => {
			for (let index = 0; index < level.length; index++) {
				const element = level[index];
				console.log(element.toString());
			}
			console.log();
		};
		this.levelOrderTraversal(this.rootRound, undefined, printLevel);
	}

	// prints out swiss rounds level by level
	// will print each RoundNode once
	levelOrderTraversal(
		root: RoundNode,
		perNodeCallBack?: (node: RoundNode) => void,
		perLevelCallBack?: (level: RoundNode[]) => void
	) {
		let queue: RoundNode[] = [];
		const visited: string[] = [];
		queue.push(root);
		const levels = [];
		while (queue.length > 0) {
			const level: RoundNode[] = [];
			const newQueue: RoundNode[] = [];
			for (let i = 0; i < queue.length; i++) {
				const node = queue[i];

				if (!visited.includes(node.name)) {
					if (perNodeCallBack) {
						perNodeCallBack(node);
					}
					level.push(node);
					visited.push(node.name);
				}
				if (node.winningRound) {
					newQueue.push(node.winningRound);
				}
				if (node.losingRound) {
					newQueue.push(node.losingRound);
				}
			}
			queue = newQueue;
			if (perLevelCallBack) {
				perLevelCallBack(level);
			}
			levels.push(level);
		}
		return levels;
	}

	private shuffleTeams() {
		for (let i = this.teams.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.teams[i], this.teams[j]] = [this.teams[j], this.teams[i]];
		}
	}
}

export function createTeams(numTeams: number): Team[] {
	const teams: Team[] = [];
	for (let index = 1; index <= numTeams; index++) {
		teams.push(new Team(index));
	}
	return teams;
}

export function populateMatches(matches: Match[], teams: Team[][]) {
	if (teams.length !== matches.length) {
		throw new Error(
			`There must twice as many teams as matches. matches.length=${matches.length}, teams.length=${teams.length}`
		);
	}

	for (let index = 0; index < teams.length; index++) {
		const matchup = teams[index];
		const team1 = matchup[0];
		const team2 = matchup[1];
		const record = new MatchRecord(team1, team2);
		team1.matchHistory.push(record);
		team2.matchHistory.push(record);
		matches[index].matchRecord = record;
	}
}

export function createEmptyMatches(numMatches: number, nodeName: string) {
	const matches: Match[] = [];
	for (let index = 0; index < numMatches; index++) {
		matches.push(new Match(nodeName, index));
	}
	return matches;
}

export function isFilledRound(matches: Match[]): boolean {
	for (let index = 0; index < matches.length; index++) {
		const matchRecord = matches[index].matchRecord;
		if (matchRecord) {
			if (!matchRecord.isFilledOut()) {
				return false;
			}
		}
	}
	return true;
}

// 1. Match differential
// 2. Game differential
// 3. Seed
// if RoundNode has 2 parents, then upper must play lower
// basically, a sort by multiple criteria
// TODO: should this be static? should it be private (testing issue)
export function evaluationSort(upperTeamsInput: Team[], lowerTeamsInput?: Team[]): Team[][] {
	const upperTeams = swissSort(upperTeamsInput);
	const matchups: Team[][] = [];
	if (lowerTeamsInput) {
		let lowerTeams = swissSort(lowerTeamsInput);

		if (upperTeams.length > lowerTeams.length) {
			const lastItem = upperTeams.pop();
			if (lastItem) {
				lowerTeams = [lastItem, ...lowerTeams];
			}
		} else if (upperTeams.length < lowerTeams.length) {
			const firstItem = lowerTeams.shift();
			if (firstItem) {
				upperTeams.push(firstItem);
			}
		}

		// implementation when round node has 2 parents
		// this is when we have to account for history
		// potentialy need to sort upper and lower teams
		const upperLowerCross: Team[][] = cartesianProduct(upperTeams, lowerTeams.reverse());
		const nonValidIndex: number[] = [];
		for (let index = 0; index < upperLowerCross.length; index++) {
			const possibleMatchup = upperLowerCross[index];
			if (playedAlready(possibleMatchup[0], possibleMatchup[1])) {
				nonValidIndex.push(index);
			}
		}
		// const teamsCrossClean: Team[][] = upperLowerCross.filter(
		// 	(teamArray): teamArray is Team[] => teamArray !== undefined
		// );

		const teamsCrossClean: Team[][] = [];
		for (let index = 0; index < upperLowerCross.length; index++) {
			if (!nonValidIndex.includes(index)) {
				const matchup = upperLowerCross[index];
				teamsCrossClean.push(matchup);
			}
		}

		const stack: MatchTracker[] = [];
		let invalidIndexes: number[] = [];
		let index = 0;
		const matchLength = (upperTeams.length + lowerTeams.length) / 2;
		while (stack.length < matchLength) {
			if (index >= teamsCrossClean.length) {
				const badMatch = stack.pop();
				if (badMatch) {
					invalidIndexes = badMatch.invalidIndexes;
					invalidIndexes.push(badMatch.index);
					index = 0;
				} else {
					let message = `
					Popped from stack when stack length is 0 
					(matchLength: ${matchLength}, stackLength: ${stack.length}, 
					index: ${index}, teamsCrossCleanLength: ${teamsCrossClean.length})\n
					`;
					for (let index = 0; index < teamsCrossClean.length; index++) {
						const element = teamsCrossClean[index];
						message = message.concat(`(${element[0].seed}, ${element[1].seed})\n`);
					}
					throw new Error(message);
				}
			}

			// if (invalidIndexes.includes(index)) {
			if (invalidIndexes.indexOf(index) != -1) {
				index++;
				continue;
			}

			const invalidIndexesCopy = structuredClone(invalidIndexes);
			const match = teamsCrossClean[index];
			const team1 = match[0];
			const team2 = match[1];
			for (let i = 0; i < teamsCrossClean.length; i++) {
				if (
					teamsCrossClean[i][0].seed === team1.seed ||
					teamsCrossClean[i][0].seed === team2.seed ||
					teamsCrossClean[i][1].seed === team1.seed ||
					teamsCrossClean[i][1].seed === team2.seed
				) {
					invalidIndexes.push(i);
				}
			}

			stack.push({
				upperTeam: team1,
				lowerTeam: team2,
				invalidIndexes: invalidIndexesCopy,
				index: index,
			});
		}
		for (const matchTrackerObject of stack) {
			matchups.push([matchTrackerObject.upperTeam, matchTrackerObject.lowerTeam]);
		}
	} else {
		// implementation when round node has 1 parent
		let i = 0;
		let j = upperTeams.length - 1;
		while (i < j) {
			matchups.push([upperTeams[i], upperTeams[j]]);
			i++;
			j--;
		}
	}
	return matchups;
}

export function swissSort(teams: Team[]): Team[] {
	return [...teams].sort(
		(a, b) =>
			b.getMatchDifferential() - a.getMatchDifferential() || // descending
			b.getGameDifferential() - a.getGameDifferential() || // descending
			a.seed - b.seed // ascending
	);
}

export function cartesianProduct<Type>(a: Type[], b: Type[]) {
	return a.flatMap((x) => b.map((y) => [x, y]));
}

// check if team1 has already played team2
export function playedAlready(team1: Team, team2: Team) {
	const team1MatchHistory = team1.matchHistory;
	for (let index = 0; index < team1MatchHistory.length; index++) {
		const matchRecord = team1MatchHistory[index];
		// TODO probably can refactor to be cleaner
		if (
			matchRecord.upperTeam.seed === team2.seed ||
			matchRecord.lowerTeam.seed === team2.seed
		) {
			return true;
		}
	}
	return false;
}

export function printRound(matches: Match[]) {
	for (const match of matches) {
		console.log(`${match.matchRecord?.upperTeam.seed} vs ${match.matchRecord?.lowerTeam.seed}`);
	}
}
