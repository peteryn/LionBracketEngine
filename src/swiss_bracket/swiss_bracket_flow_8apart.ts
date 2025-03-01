import { Seed } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import {
	cartesianProduct,
	createSeeds,
	eightApartMatchups,
	getLosers,
	getWinners,
	populateMatches,
} from "../util/util.ts";
import { SwissBracketFlow } from "./swiss_backet_flow.ts";
import { levelOrderTraversal } from "../util/util.ts";

export class SwissBracketFlow8Apart extends SwissBracketFlow {
	constructor(numSeeds: number = 16, winRequirement: number = 3) {
		super(numSeeds, winRequirement);
		const seeds = createSeeds(numSeeds);
		// populate root round with the seeds in the correct matches
		const matchups = eightApartMatchups(seeds);
		populateMatches(this.rootRound.matches, matchups);
	}

	override tieBreaker(seed: Seed): number {
		return this.getBuchholzScore(seed);
	}

	override updateFlow(roundNode: RoundNode): void {
		const curLevelNum = roundNode.level;
		if (curLevelNum === 5) {
			return;
		}
		const level: RoundNode[] = [];
		const nextLevel: RoundNode[] = [];

		levelOrderTraversal(this.rootRound, (node) => {
			if (node.level === curLevelNum) {
				level.push(node);
			}
			if (node.level === curLevelNum + 1) {
				nextLevel.push(node);
			}
		});

		// entire level needs to be filled out before any future rounds can be calculated
		const roundMatches = level
			.map((node) => {
				return node.matches;
			})
			.flat();

		const unfinishedMatches = roundMatches.filter((match) => {
			if (!match.matchRecord) {
				return true;
			}
			return match.matchRecord.upperSeedWins === match.matchRecord.lowerSeedWins;
		});

		if (unfinishedMatches.length > 0) {
			return;
		}

		// all matches are finished
		if (curLevelNum === 1) {
			const matches = roundMatches;
			matches;
			const winners: Seed[] = getWinners(roundNode.matches);
			const losers: Seed[] = getLosers(roundNode.matches);

			const r2UpperMatchups = this.evaluationSort(winners);
			populateMatches(roundNode.upperRound!.matches, r2UpperMatchups);
			const r2LowerMatchups = this.evaluationSort(losers);
			populateMatches(roundNode.lowerRound!.matches, r2LowerMatchups);
		} else if (curLevelNum === 2) {
			const r2UpperRoundNode = this.getRoundNode("1-0");
			const r2UpperWinners = getWinners(r2UpperRoundNode.matches);
			const r2UpperLosers = getLosers(r2UpperRoundNode.matches);

			const r2LowerRoundNode = this.getRoundNode("0-1");
			const r2LowerWinners = getWinners(r2LowerRoundNode.matches);
			const r2LowerLosers = getLosers(r2LowerRoundNode.matches);

			const round3UpperMatchups = this.evaluationSort(r2UpperWinners);
			populateMatches(r2UpperRoundNode.upperRound!.matches, round3UpperMatchups);
			const round3LowerMatchups = this.evaluationSort(r2LowerLosers);
			populateMatches(r2LowerRoundNode.lowerRound!.matches, round3LowerMatchups);

			const round3MiddleSeeds = r2UpperLosers.concat(r2LowerWinners);
			// TODO: need to write new implementation
			// sort round3MiddleSeeds with swiss sort
			const sortedSeeds = this.swissSort(round3MiddleSeeds);

			// create cross product between itself and the reverse while removing matches of seed vs same seed
			const reverseSortedSeeds = sortedSeeds.toReversed();
			const crossProduct = cartesianProduct(sortedSeeds, reverseSortedSeeds);
			const withoutSameSeedMatchups = crossProduct.filter(([a, b]) => {
				return a !== b;
			});

			// get rid of rematches based on match history
			const cleanMatches = this.removeRematches(withoutSameSeedMatchups);

			// use the backtracking algorithm
			const matchups = this.backTrackingAlgorithm(cleanMatches, round3MiddleSeeds.length / 2);
			populateMatches(r2UpperRoundNode.lowerRound!.matches, matchups);
		} else {
			console.log("not implemented yet");
		}
	}
}
