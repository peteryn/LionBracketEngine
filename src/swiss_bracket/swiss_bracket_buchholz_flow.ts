import { Seed } from "../models/match_record.ts";
import { SwissBracketFlow } from "./swiss_backet_flow.ts";

export class SwissBracketBuchholzFlow extends SwissBracketFlow {
	override tieBreaker(seed: Seed): number {
		return this.getBuchholzScore(seed);
	}
}
