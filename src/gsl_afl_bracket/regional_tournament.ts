import { AFLBracket, AFLNodeTypes } from "../afl_bracket/afl_bracket.ts";
import { GSLBracket, GSLNodeTypes } from "../gsl_bracket/gsl_bracket.ts";
import { Seed } from "../models/match_record.ts";
import { initializeAFLBracket } from "../util/util.ts";

export type GSA_A_Bracket = {
	bracket: "GSL_A";
	nodeName: GSLNodeTypes;
};

export type GSA_B_Bracket = {
	bracket: "GSL_B";
	nodeName: GSLNodeTypes;
};

export type AFL_Bracket = {
	bracket: "AFL";
	nodeName: AFLNodeTypes;
};

export type BracketType =
	| GSA_A_Bracket
	| GSA_B_Bracket
	| AFL_Bracket;

export class RegionalTournament {
	GSL_A: GSLBracket;
	GSL_B: GSLBracket;
	AFL: AFLBracket;

	constructor() {
		this.GSL_A = new GSLBracket([1, 3, 5, 7, 9, 11, 13, 15]);
		this.GSL_B = new GSLBracket([2, 4, 6, 8, 10, 12, 14, 16]);
		this.AFL = new AFLBracket(false);
	}

	updateFlow(bracket: BracketType, upperSeedWins: number, lowerSeedWins: number) {
		switch (bracket.bracket) {
			case "GSL_A": {
				this.GSL_A.setMatchRecordAndFlow(bracket.nodeName, upperSeedWins, lowerSeedWins);
				break;
			}
			case "GSL_B": {
				this.GSL_B.setMatchRecordAndFlow(bracket.nodeName, upperSeedWins, lowerSeedWins);
				break;
			}
			case "AFL": {
				this.AFL.setMatchRecordAndFlow(bracket.nodeName, upperSeedWins, lowerSeedWins);
				break;
			}
		}

		if (bracket.bracket === "GSL_A" || bracket.bracket === "GSL_B") {
			this.AFL.clearAllMatchRecords();
			// [1, 3, 5, 7]
			const GSL_A_results = this.GSL_A.getPromoted();
			// [2, 4, 6, 8]
			const GSL_B_results = this.GSL_B.getPromoted();
			const promotedSeeds: (Seed | undefined)[] = [];
			for (let index = 0; index < GSL_A_results.length; index++) {
				promotedSeeds.push(GSL_A_results[index]);
				promotedSeeds.push(GSL_B_results[index]);
			}
			// need to transform seeds into 1 list
			initializeAFLBracket(promotedSeeds, this.AFL, 0, 3, "UpperQuarterFinal1");
			initializeAFLBracket(promotedSeeds, this.AFL, 1, 2, "UpperQuarterFinal2");
			initializeAFLBracket(promotedSeeds, this.AFL, 4, 7, "LowerBracketRound1");
			initializeAFLBracket(promotedSeeds, this.AFL, 5, 6, "LowerBracketRound2");
		}
	}

	GSL_A_updateFunction(nodeName: GSLNodeTypes, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow({ bracket: "GSL_A", nodeName: nodeName }, upperSeedWins, lowerSeedWins);
	}

	GSL_B_updateFunction(nodeName: GSLNodeTypes, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow({ bracket: "GSL_B", nodeName: nodeName }, upperSeedWins, lowerSeedWins);
	}

	AFL_updateFunction(nodeName: AFLNodeTypes, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow({ bracket: "AFL", nodeName: nodeName }, upperSeedWins, lowerSeedWins);
	}
}
