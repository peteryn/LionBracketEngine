import { FlowBracket } from "../models/flow_bracket.ts";
import { FullRecord, MatchRecord, Seed } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import {
	cartesianProduct,
	createSeeds,
	getLosers,
	getWinners,
	isFilledRound,
	levelOrderTraversal,
	populateMatches,
	seedBasedMatchups,
} from "../util/util.ts";
import { SwissBracket } from "./swiss_bracket.ts";

type MatchTracker = {
	upperSeed: Seed;
	lowerSeed: Seed;
	invalidIndexes: number[];
	index: number;
};

export class SwissBracketFlow extends SwissBracket implements FlowBracket<RoundNode> {
	constructor(numSeeds: number = 16, winRequirement: number = 3) {
		super(numSeeds, winRequirement);
		const seeds = createSeeds(numSeeds);
		// populate root round with the seeds in the correct matches
		const matchups = seedBasedMatchups(seeds);
		populateMatches(this.rootRound.matches, matchups);
	}

	// override each setter so that as soon as a set is made,
	// the new swiss flow is computed and future rounds are updated correctly
	// OPTION: could refactor new method names that do the same thing and add them to
	// FlowBracket interface. this would have the side effect that the original super.setter()
	// methods would still be accessible from the outward interface.
	override setMatchRecord(
		roundName: string,
		matchNumber: number,
		matchRecord: FullRecord
	): boolean {
		const res = super.setMatchRecord(roundName, matchNumber, matchRecord);
		const roundNode = this.getRoundNode(roundName);
		// console.log("in overridden")
		if (res) {
			this.updateRounds(roundNode);
		}
		return res;
	}

	override setMatchRecordById(matchId: string, matchRecord: FullRecord): boolean {
		const res = super.setMatchRecordById(matchId, matchRecord);
		const roundNodeName = matchId.split(".")[0];
		const roundNode = this.getRoundNode(roundNodeName);
		if (res) {
			this.updateRounds(roundNode);
		}
		return res;
	}

	override setMatchRecordWithValue(
		roundName: string,
		matchNumber: number,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean {
		const res = super.setMatchRecordWithValue(
			roundName,
			matchNumber,
			upperSeedWins,
			lowerSeedWins
		);
		const roundNode = this.getRoundNode(roundName);
		if (res) {
			this.updateRounds(roundNode);
		}
		return res;
	}

	override setMatchRecordWithValueById(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean {
		const res = super.setMatchRecordWithValueById(matchId, upperSeedWins, lowerSeedWins);
		const roundNodeName = matchId.split(".")[0];
		const roundNode = this.getRoundNode(roundNodeName);
		if (res) {
			this.updateRounds(roundNode);
		}
		return res;
	}

	// implementation 1: delete future round data because it is not valid anymore
	// this should only be called on the roundNode that has a match that has been updated
	// a different implementation will be called on all dependent nodes
	updateRounds(roundNode: RoundNode): void {
		// we need to remove match records in future rounds because changing the current round
		// may invalidate future rounds
		// we will then repopulate future rounds if necessary
		this.clearDependents(roundNode.upperRound);
		this.clearDependents(roundNode.lowerRound);

		// check to see if round is filled out (no ties in upperSeedWins and lowerSeedWins)
		const isFilleldOut = isFilledRound(roundNode.matches);
		// if it is not filled out, then we can stop
		if (!isFilleldOut) {
			return;
		}

		// split seeds into winners and losers
		const winners: Seed[] = getWinners(roundNode.matches);
		const losers: Seed[] = getLosers(roundNode.matches);

		// need to pass winners/losers to the next node because some nodes have a 2 dependencies (2 parents)
		// after passing them, need to process them at those nodes
		// for this implementation, we only need to process roundNode.upperRound and roundNode.lowerRound
		const upperRound = roundNode.upperRound;
		if (upperRound) {
			this.processRound(upperRound, winners);
		} else {
			// set the winners who go on to the next stage
			roundNode.promotionSeeds = this.swissSort(winners);
		}

		const lowerRound = roundNode.lowerRound;
		if (lowerRound) {
			this.processRound(lowerRound, losers);
		} else {
			// set the losers who are eliminated
			roundNode.eliminationSeeds = this.swissSort(losers);
		}
	}

	private swissSort(seeds: Seed[]): Seed[] {
		return seeds.sort((a, b) => {
			return (
				this.getMatchDifferential(b) - this.getMatchDifferential(a) || // descending
				this.tieBreaker(b) - this.tieBreaker(a) || // descending
				a - b
			); // ascending
		});
	}

	protected tieBreaker(seed: Seed): number {
		return this.getGameDifferential(seed);
	}

	// 1. Match differential
	// 2. Game differential
	// 3. Seed
	// if RoundNode has 2 parents, then upper must play lower
	// basically, a sort by multiple criteria
	private evaluationSort(upperSeedsInput: Seed[], lowerSeedsInput?: Seed[]): Seed[][] {
		const upperSeeds = this.swissSort(upperSeedsInput);
		const matchups: Seed[][] = [];
		if (lowerSeedsInput) {
			let lowerSeeds = this.swissSort(lowerSeedsInput);

			// for 2-1 and 1-2 rounds, we need to "promote" or "demote" a seed so that the two arrays have an equal number of seeds
			if (upperSeeds.length > lowerSeeds.length) {
				const lastItem = upperSeeds.pop();
				if (lastItem) {
					lowerSeeds = [lastItem, ...lowerSeeds];
				}
			} else if (upperSeeds.length < lowerSeeds.length) {
				const firstItem = lowerSeeds.shift();
				if (firstItem) {
					upperSeeds.push(firstItem);
				}
			}

			// implementation when round node has 2 parents
			// this is when we have to account for history
			// potentialy need to sort upper and lower seeds

			// calculate every possible pairing of upper and lower seeds
			const upperLowerCross: Seed[][] = cartesianProduct(upperSeeds, lowerSeeds.reverse());
			// find the indexes of invalid pairings due to match history
			const nonValidIndex: number[] = [];
			for (let index = 0; index < upperLowerCross.length; index++) {
				const possibleMatchup = upperLowerCross[index];
				if (this.playedAlready(possibleMatchup[0], possibleMatchup[1])) {
					nonValidIndex.push(index);
				}
			}

			// using the list of invalid indexes, create a new list that does not have those index values
			const seedsCrossClean: Seed[][] = [];
			for (let index = 0; index < upperLowerCross.length; index++) {
				if (!nonValidIndex.includes(index)) {
					const matchup = upperLowerCross[index];
					seedsCrossClean.push(matchup);
				}
			}

			// backtracking algorithm
			const stack: MatchTracker[] = [];
			let invalidIndexes: number[] = [];
			let index = 0;
			const matchLength = (upperSeeds.length + lowerSeeds.length) / 2;
			while (stack.length < matchLength) {
				// if this condition holds, then we have not generate enough matches for the round
				// this means that we selected a matchup that causes some other invalidity
				// we need to get rid of that matchup and restore the state of invalidIndexes
				if (index >= seedsCrossClean.length) {
					const badMatch = stack.pop();
					if (badMatch) {
						invalidIndexes = badMatch.invalidIndexes;
						invalidIndexes.push(badMatch.index);
						index = 0;
					} else {
						let message = `
							Error: Due to rematches rule, there may no more possible matchups...
							Popped from stack when stack length is 0 
							(matchLength: ${matchLength}, stackLength: ${stack.length}, 
							index: ${index}, seedsCrossClean: ${seedsCrossClean.length})\n
							`;
						for (let index = 0; index < seedsCrossClean.length; index++) {
							const element = seedsCrossClean[index];
							message = message.concat(`(${element[0]}, ${element[1]})\n`);
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

				// if we select this matchup, then those 2 seeds can no longer play
				// so we remove potential pairings with those seeds by adding the index of that matchup
				// to invalidIndexes
				const match = seedsCrossClean[index];
				const seed1 = match[0];
				const seed2 = match[1];
				for (let i = 0; i < seedsCrossClean.length; i++) {
					if (
						seedsCrossClean[i][0] === seed1 ||
						seedsCrossClean[i][0] === seed2 ||
						seedsCrossClean[i][1] === seed1 ||
						seedsCrossClean[i][1] === seed2
					) {
						invalidIndexes.push(i);
					}
				}

				stack.push({
					upperSeed: seed1,
					lowerSeed: seed2,
					invalidIndexes: invalidIndexesCopy,
					index: index,
				});
			}

			for (const matchTrackerObject of stack) {
				matchups.push([matchTrackerObject.upperSeed, matchTrackerObject.lowerSeed]);
			}
		} else {
			// implementation when round node has 1 parent
			let i = 0;
			let j = upperSeeds.length - 1;
			while (i < j) {
				matchups.push([upperSeeds[i], upperSeeds[j]]);
				i++;
				j--;
			}
		}
		return matchups;
	}

	// TODO: this should be apart of abstract bracket
	getMatchHistory(seed: Seed) {
		let curr: RoundNode | undefined = this.rootRound;
		const matchHistory: FullRecord[] = [];
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
				if (matchRecord.upperSeed === seed) {
					if (matchRecord.upperSeedWins > matchRecord.lowerSeedWins) {
						winner = 1;
					} else if (matchRecord.upperSeedWins < matchRecord.lowerSeedWins) {
						winner = -1;
					} else {
						winner = 0;
					}
					matchHistory.push(matchRecord);
				}
				if (matchRecord.lowerSeed === seed) {
					if (matchRecord.lowerSeedWins > matchRecord.upperSeedWins) {
						winner = 1;
					} else if (matchRecord.lowerSeedWins < matchRecord.upperSeedWins) {
						winner = -1;
					} else {
						winner = 0;
					}
					matchHistory.push(matchRecord);
				}
			}
			switch (winner) {
				case -1:
					curr = curr.lowerRound;
					break;
				case 1:
					curr = curr.upperRound;
					break;
				case 0:
					curr = undefined;
					break;
			}
		}
		return matchHistory;
	}

	// TODO: this should be part of abstract bracket
	getMatchDifferential(seed: Seed) {
		const matchHistory = this.getMatchHistory(seed);
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

	// to calculate Buchholz score, you need the match differential of every seed
	// you faced in your match history
	getBuchholzScore(seed: Seed) {
		let score = 0;
		const matchHistory = this.getMatchHistory(seed);

		// 	for each seed faced
		//		get that seed's match differential
		//		and add it to score
		for (let index = 0; index < matchHistory.length; index++) {
			const match = matchHistory[index];
			const isUpperSeed = match.upperSeed === seed;
			const opponent = isUpperSeed ? match.lowerSeed : match.upperSeed;
			score += this.getMatchDifferential(opponent);
		}

		return score;
	}

	getGameDifferential(seed: Seed) {
		const matchHistory = this.getMatchHistory(seed);
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

	private playedAlready(seed1: Seed, seed2: Seed) {
		const seed1MatchHistory = this.getMatchHistory(seed1);
		for (let index = 0; index < seed1MatchHistory.length; index++) {
			const matchRecord = seed1MatchHistory[index];
			if (matchRecord.upperSeed === seed2 || matchRecord.lowerSeed === seed2) {
				return true;
			}
		}
		return false;
	}

	private processRound(round: RoundNode, seeds: Seed[]) {
		if (round.has2Parents) {
			const [roundWins, roundLosses] = round.name.split("-");
			const upperParentNode = this.getRoundNode(`${roundWins}-${parseInt(roundLosses) - 1}`);
			const lowerParentNode = this.getRoundNode(`${parseInt(roundWins) - 1}-${roundLosses}`);
			const upperLosers = getLosers(upperParentNode.matches);
			const lowerWinners = getWinners(lowerParentNode.matches);
			if (
				upperLosers.length === upperParentNode.numSeeds / 2 &&
				lowerWinners.length === lowerParentNode.numSeeds / 2
			) {
				const matchups = this.evaluationSort(upperLosers, lowerWinners);
				populateMatches(round.matches, matchups);
			} else {
				// do nothing, cant calculate round yet
			}
		} else {
			const matchups = this.evaluationSort(seeds);
			populateMatches(round.matches, matchups);
		}
	}

	private clearDependents(round: RoundNode | undefined) {
		if (round) {
			levelOrderTraversal(round, (node) => {
				const matches = node.matches;
				for (let index = 0; index < matches.length; index++) {
					const match = matches[index];
					match.matchRecord = undefined;
				}
				// reset the seeds that were promoted because future rounds are being calculated
				if (node.promotionSeeds.length > 0) {
					node.promotionSeeds = [];
				}
				if (node.eliminationSeeds.length > 0) {
					node.eliminationSeeds = [];
				}
			});
		}
	}
}
