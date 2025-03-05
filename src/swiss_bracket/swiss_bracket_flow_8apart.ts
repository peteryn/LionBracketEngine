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
import { retry } from "jsr:@std/async@0.223.0/retry";

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
			this.clearDependents(roundNode.upperRound);
			this.clearDependents(roundNode.lowerRound);
			const matches = roundMatches;
			matches;
			const winners: Seed[] = getWinners(roundNode.matches);
			const losers: Seed[] = getLosers(roundNode.matches);

			const r2UpperMatchups = this.evaluationSort(winners);
			populateMatches(roundNode.upperRound!.matches, r2UpperMatchups);
			const r2LowerMatchups = this.evaluationSort(losers);
			populateMatches(roundNode.lowerRound!.matches, r2LowerMatchups);
		} else if (curLevelNum === 2) {
			this.clearDependents(this.getRoundNode("2-0"));
			this.clearDependents(this.getRoundNode("1-1"));
			this.clearDependents(this.getRoundNode("0-2"));
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
			const matchups = this.calcuate(round3MiddleSeeds);
			populateMatches(r2UpperRoundNode.lowerRound!.matches, matchups);
		} else if (curLevelNum === 3) {
			this.clearDependents(this.getRoundNode("2-1"));
			this.clearDependents(this.getRoundNode("1-2"));
			const r3Upper = this.getRoundNode("2-0");
			const r3Middle = this.getRoundNode("1-1");
			const r3Lower = this.getRoundNode("0-2");

			const r4UpperSeeds = getLosers(r3Upper.matches).concat(getWinners(r3Middle.matches));
			const r4UpperMatchups = this.calcuate(r4UpperSeeds);
			populateMatches(r3Upper.lowerRound!.matches, r4UpperMatchups);

			const r4LowerSeeds = getLosers(r3Middle.matches).concat(getWinners(r3Lower.matches));
			const r4LowerMatchups = this.calcuate(r4LowerSeeds);
			populateMatches(r3Middle.lowerRound!.matches, r4LowerMatchups);
		} else if (curLevelNum === 4) {
			this.clearDependents(this.getRoundNode("2-2"));
			const r4Upper = this.getRoundNode("2-1");
			const r4Lower = this.getRoundNode("1-2");
			const r5Seeds = getLosers(r4Upper.matches).concat(getWinners(r4Lower.matches));
			const r5Matchups = this.calcuate(r5Seeds);
			populateMatches(r4Upper.lowerRound!.matches, r5Matchups);
		} else {
			console.log("not implemented yet");
		}
	}

	protected calcuate(seeds: Seed[]) {
		const sortedSeeds = this.swissSort(seeds);

		// create cross product between itself and the reverse while removing matches of seed vs same seed
		const reverseSortedSeeds = sortedSeeds.toReversed();
		const crossProduct = cartesianProduct(sortedSeeds, reverseSortedSeeds);
		const withoutSameSeedMatchups = crossProduct.filter(([a, b]) => {
			return a !== b;
		});

		// get rid of rematches based on match history
		const cleanMatches = this.removeRematches(withoutSameSeedMatchups);

		// use the backtracking algorithm
		const matchups = this.backTrackingAlgorithm(cleanMatches, seeds.length / 2);
		return matchups;
	}
}
