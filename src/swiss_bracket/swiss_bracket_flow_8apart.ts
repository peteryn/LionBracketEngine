import { Seed } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import { createSeeds, eightApartMatchups, populateMatches } from "../util/util.ts";
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
		const curLevel = roundNode.level;
		const level: RoundNode[] = [];
		levelOrderTraversal(this.rootRound, (node) => {
			if (node.level === curLevel) {
				level.push(node);
			}
		})
		
		// entire level needs to be filled out before any future rounds can be calculated

	}
}
