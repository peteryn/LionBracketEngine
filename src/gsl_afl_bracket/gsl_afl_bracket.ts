import { AFLBracket } from "../afl_bracket/afl_bracket.ts";
import { GSLBracket } from "../gsl_bracket/gsl_bracket.ts";
import { Bracket } from "../models/bracket.ts";
import { Match } from "../models/match.ts";
import { MatchNode } from "../models/match_node.ts";
import { MatchRecord } from "../models/match_record.ts";

export class GSL_AFL_Bracket implements Bracket<MatchNode> {
	gslAUpperMatches: MatchNode[] = [];
	gslALowerMatches: MatchNode[] = [];

	gslBUpperMatches: MatchNode[] = [];
	gslBLowerMatches: MatchNode[] = [];

	upperQuarterFinal1: MatchNode;
	upperQuarterFinal2: MatchNode;
	lowerBracketRound1: MatchNode;
	lowerBracketRound2: MatchNode;

	constructor() {
		[this.gslAUpperMatches, this.gslALowerMatches] = GSLBracket.createGSLBracket();
		[this.gslBUpperMatches, this.gslBLowerMatches] = GSLBracket.createGSLBracket();
		[
			this.upperQuarterFinal1,
			this.upperQuarterFinal2,
			this.lowerBracketRound1,
			this.lowerBracketRound2,
		] = AFLBracket.createAFLBracket();

		const GSLAUpperFinal = this.gslAUpperMatches[0].upperRound!.upperRound!;
		const GSLALLowerFinal = this.gslALowerMatches[0].upperRound!.upperRound!;

		const GSLBUpperFinal = this.gslBUpperMatches[0].upperRound!.upperRound!;
		const GSLBLLowerFinal = this.gslBLowerMatches[0].upperRound!.upperRound!;
	}

	getBracketNode(nodeName: string): MatchNode {
		throw new Error("Method not implemented.");
	}
	getMatch(matchId: string): Match {
		throw new Error("Method not implemented.");
	}
	getMatchRecord(matchId: string): MatchRecord | undefined {
		throw new Error("Method not implemented.");
	}
	setMatchRecord(matchId: string, matchRecord: MatchRecord): boolean {
		throw new Error("Method not implemented.");
	}
	setMatchRecordWithValue(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean {
		throw new Error("Method not implemented.");
	}
}
