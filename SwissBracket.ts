import { Match, MatchRecord, RoundNode, Team, type MatchTracker } from "./models.ts";
import { SwissBracketData } from "./SwissBracketData.ts";
import { cartesianProduct } from "./util/util.ts";

export class SwissBracket {
	data: SwissBracketData;

	constructor(numTeams: number = 16, winRequirement: number = 3) {
		this.data = new SwissBracketData(numTeams, winRequirement);
	}

	getMatchRecord(roundName: string, matchNumber: number) {
		return this.getMatchRecordById(`${roundName}.${matchNumber}`);
	}

	setMatchRecord(roundName: string, matchNumber: number, matchRecord: MatchRecord) {
		return this.setMatchRecordById(`${roundName}.${matchNumber}`, matchRecord);
	}

	getMatch(matchId: string): Match | undefined {
		return this.data.matches.get(matchId);
	}

	getMatchRecordById(matchId: string): MatchRecord | undefined {
		const matchRecord = this.getMatch(matchId)?.matchRecord;
		if (!matchRecord) {
			return undefined;
		}
		return MatchRecord.createClone(matchRecord);
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

	getMatchHistory(seed: number) {
		let curr: RoundNode | undefined = this.data.rootRound;
		const matchHistory: MatchRecord[] = [];
		while (curr) {
			const matches = curr.matches;
			// may need to check if round is filled out or not
			let winner = 0;
			for (let index = 0; index < matches.length; index++) {
				const match = matches[index];
				const matchRecord = match.matchRecord;
				if (!matchRecord) {
					winner = 0;
					break;
				}
				if (matchRecord.upperTeam.seed === seed) {
					if (matchRecord.upperTeamWins > matchRecord.lowerTeamWins) {
						winner = 1;
					} else if (matchRecord.upperTeamWins < matchRecord.lowerTeamWins) {
						winner = -1;
					} else {
						winner = 0;
					}
					matchHistory.push(matchRecord);
				}
				if (matchRecord.lowerTeam.seed === seed) {
					if (matchRecord.lowerTeamWins > matchRecord.upperTeamWins) {
						winner = 1;
					} else if (matchRecord.lowerTeamWins < matchRecord.upperTeamWins) {
						winner = -1;
					} else {
						winner = 0;
					}
					matchHistory.push(matchRecord);
				}
			}
			switch (winner) {
				case -1:
					curr = curr.losingRound;
					break;
				case 1:
					curr = curr.winningRound;
					break;
				case 0:
					curr = undefined;
					break;
			}
		}
		return matchHistory;
	}

	// implementation 1: delete future round data because it is not valid anymore
	// this should only be called on the roundNode that has a match that has been updated
	// a different implementation will be called on all dependent nodes
	updateRounds(roundNode: RoundNode) {
		// check to see if round is filled out (no ties in upperTeamWins and lowerTeamWins)
		const isFilleldOut = this.isFilledRound(roundNode.matches);
		// if it is not filled out, then we can stop
		if (!isFilleldOut) {
			return;
		}

		// update the match record status in the dependent RoundNodes
		// this includes updating what teams are in those future matches
		this.updateDependents(roundNode.winningRound);
		this.updateDependents(roundNode.losingRound);

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
					const matchups = this.evaluationSort(
						winningRound.fromUpperParent,
						winningRound.fromLowerParent
					);
					populateMatches(winningRound.matches, matchups);
				} else {
					// do nothing, cant calculate round yet
				}
			} else {
				// process winning round by calling evaluation sort for 1 team
				const matchups = this.evaluationSort(winners);
				populateMatches(winningRound.matches, matchups);
			}
		} else {
			// set the winners who go on to the next stage
			roundNode.promotionTeams = this.swissSort(winners);
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
					const matchups = this.evaluationSort(
						losingRound.fromUpperParent,
						losingRound.fromLowerParent
					);
					populateMatches(losingRound.matches, matchups);
				}
			} else {
				// process losers with sort
				const matchups = this.evaluationSort(losers);
				populateMatches(losingRound.matches, matchups);
			}
		} else {
			// set the losers who are eliminated
			roundNode.eliminatedTeams = this.swissSort(losers);
		}

		/*
			need to edit roundNode to support a place to put teams before sorting

			after a round has been edited, should user input for future rounds be kept or deleted?
			if they are deleted, then evaluate the current round, update the direct children, and be done
			if they are kept, then need to rerun this function on future rounds that depend on this round

			IDEA: if after regenerating the matchup is the same and at the same position, keep the previous result
		*/
	}

	private updateDependents(round: RoundNode | undefined) {
		if (round) {
			levelOrderTraversal(round, (node) => {
				const matches = node.matches;
				for (let index = 0; index < matches.length; index++) {
					const match = matches[index];
					match.matchRecord = undefined;
				}
				// reset the teams that were promoted because future rounds are being calculated
				if (node.promotionTeams.length > 0) {
					node.promotionTeams = [];
				}
				if (node.eliminatedTeams.length > 0) {
					node.eliminatedTeams = [];
				}
			});
		}
	}

	// 1. Match differential
	// 2. Game differential
	// 3. Seed
	// if RoundNode has 2 parents, then upper must play lower
	// basically, a sort by multiple criteria
	evaluationSort(upperTeamsInput: Team[], lowerTeamsInput?: Team[]): Team[][] {
		const upperTeams = this.swissSort(upperTeamsInput);
		const matchups: Team[][] = [];
		if (lowerTeamsInput) {
			let lowerTeams = this.swissSort(lowerTeamsInput);

			// for 2-1 and 1-2 rounds, we need to "promote" or "demote" a team so that the two arrays have an equal number of teams
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

			// calculate every possible pairing of upper and lower teams
			const upperLowerCross: Team[][] = cartesianProduct(upperTeams, lowerTeams.reverse());
			// find the indexes of invalid pairings due to match history
			const nonValidIndex: number[] = [];
			for (let index = 0; index < upperLowerCross.length; index++) {
				const possibleMatchup = upperLowerCross[index];
				if (this.playedAlready(possibleMatchup[0], possibleMatchup[1])) {
					nonValidIndex.push(index);
				}
			}

			// using the list of invalid indexes, create a new list that does not have those index values
			const teamsCrossClean: Team[][] = [];
			for (let index = 0; index < upperLowerCross.length; index++) {
				if (!nonValidIndex.includes(index)) {
					const matchup = upperLowerCross[index];
					teamsCrossClean.push(matchup);
				}
			}

			// backtracking algorithm
			const stack: MatchTracker[] = [];
			let invalidIndexes: number[] = [];
			let index = 0;
			const matchLength = (upperTeams.length + lowerTeams.length) / 2;
			while (stack.length < matchLength) {
				// if this condition holds, then we have not generate enough matches for the round
				// this means that we selected a matchup that causes some other invalidity
				// we need to get rid of that matchup and restore the state of invalidIndexes
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

				if (invalidIndexes.includes(index)) {
					index++;
					continue;
				}

				// key line, we need to preserve the state of invalidIndexes for each potential matchup
				// so that we can backtrack
				const invalidIndexesCopy = structuredClone(invalidIndexes);

				// if we select this matchup, then those 2 teams can no longer play
				// so we remove potential pairings with those teams by adding the index of that matchup
				// to invalidIndexes
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

	swissSort(teams: Team[]): Team[] {
		return [...teams].sort((a, b) => {
			const aHistory = this.getMatchHistory(a.seed);
			const bHistory = this.getMatchHistory(b.seed);
			return (
				b.getMatchDifferential(bHistory) - a.getMatchDifferential(aHistory) || // descending
				b.getGameDifferential(bHistory) - a.getGameDifferential(aHistory) || // descending
				a.seed - b.seed
			); // ascending
		});
	}

	printLevels() {
		const printLevel = (level: RoundNode[]) => {
			for (let index = 0; index < level.length; index++) {
				const element = level[index];
				console.log(element.toString());
			}
			console.log();
		};
		levelOrderTraversal(this.data.rootRound, undefined, printLevel);
	}

	// prints out swiss rounds level by level
	// will print each RoundNode once
	getPromotedTeams() {
		let promotedTeams: Team[] = [];
		levelOrderTraversal(this.data.rootRound, (node) => {
			if (node.promotionTeams.length > 0) {
				promotedTeams = promotedTeams.concat(node.promotionTeams);
			}
		});
		return promotedTeams;
	}

	getEliminatedTeams() {
		let eliminatedTeams: Team[] = [];
		levelOrderTraversal(this.data.rootRound, (node) => {
			if (node.eliminatedTeams.length > 0) {
				eliminatedTeams = eliminatedTeams.concat(node.eliminatedTeams);
			}
		});
		return this.swissSort(eliminatedTeams);
	}

	// check if team1 has already played team2
	playedAlready(team1: Team, team2: Team) {
		const team1MatchHistory = this.getMatchHistory(team1.seed);
		for (let index = 0; index < team1MatchHistory.length; index++) {
			const matchRecord = team1MatchHistory[index];
			if (
				matchRecord.upperTeam.seed === team2.seed ||
				matchRecord.lowerTeam.seed === team2.seed
			) {
				return true;
			}
		}
		return false;
	}

	private isFilledRound(matches: Match[]): boolean {
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
}

export function levelOrderTraversal(
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
		matches[index].matchRecord = record;
	}
}
