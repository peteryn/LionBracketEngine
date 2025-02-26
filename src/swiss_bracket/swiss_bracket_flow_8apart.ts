import { Seed } from "../models/match_record.ts";
import { createSeeds, eightApartMatchups, populateMatches } from "../util/util.ts";
import { SwissBracketFlow } from "./swiss_backet_flow.ts";

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
}
