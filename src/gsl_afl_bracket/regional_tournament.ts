import { AflBracket, AflNodeNames } from "../afl_bracket/afl_bracket.ts";
import { GslBracket, GslNodeNames } from "../gsl_bracket/gsl_bracket.ts";
import { Seed } from "../models/match_record.ts";
import { initializeAFLBracket } from "../util/util.ts";
import { GslLiteBracket, GslLiteNodeNames } from "../gsl_bracket/gsl_lite_bracket.ts";

export type GslBracketA = {
	bracket: "GSL_A";
	nodeName: GslLiteNodeNames;
};

export type GslBracketB = {
	bracket: "GSL_B";
	nodeName: GslLiteNodeNames;
};

export type AflBracketA = {
	bracket: "AFL";
	nodeName: AflNodeNames;
};

export type BracketType =
	| GslBracketA
	| GslBracketB
	| AflBracketA;

export class RegionalTournament {
	gslA: GslLiteBracket;
	gslB: GslLiteBracket;
	afl: AflBracket;

	constructor() {
		this.gslA = new GslLiteBracket([1, 3, 5, 7, 9, 11, 13, 15]);
		this.gslB = new GslLiteBracket([2, 4, 6, 8, 10, 12, 14, 16]);
		this.afl = new AflBracket(false);
	}

	updateFlow(bracket: BracketType, upperSeedWins: number, lowerSeedWins: number) {
		switch (bracket.bracket) {
			case "GSL_A": {
				this.gslA.setMatchRecordAndFlow(bracket.nodeName, upperSeedWins, lowerSeedWins);
				break;
			}
			case "GSL_B": {
				this.gslB.setMatchRecordAndFlow(bracket.nodeName, upperSeedWins, lowerSeedWins);
				break;
			}
			case "AFL": {
				this.afl.setMatchRecordAndFlow(bracket.nodeName, upperSeedWins, lowerSeedWins);
				break;
			}
		}

		if (bracket.bracket === "GSL_A" || bracket.bracket === "GSL_B") {
			this.afl.clearAllMatchRecords();
			// [1, 3, 5, 7]
			const GSL_A_results = this.gslA.getPromoted();
			// [2, 4, 6, 8]
			const GSL_B_results = this.gslB.getPromoted();
			const promotedSeeds: (Seed | undefined)[] = [];
			for (let index = 0; index < GSL_A_results.length; index++) {
				promotedSeeds.push(GSL_A_results[index]);
				promotedSeeds.push(GSL_B_results[index]);
			}
			// need to transform seeds into 1 list
			initializeAFLBracket(promotedSeeds, this.afl, 0, 3, "UpperQuarterFinal1");
			initializeAFLBracket(promotedSeeds, this.afl, 1, 2, "UpperQuarterFinal2");
			initializeAFLBracket(promotedSeeds, this.afl, 4, 7, "LowerBracketRound1");
			initializeAFLBracket(promotedSeeds, this.afl, 5, 6, "LowerBracketRound2");
		}
	}

	GSL_A_updateFunction(nodeName: GslLiteNodeNames, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow({ bracket: "GSL_A", nodeName: nodeName }, upperSeedWins, lowerSeedWins);
	}

	GSL_B_updateFunction(nodeName: GslLiteNodeNames, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow({ bracket: "GSL_B", nodeName: nodeName }, upperSeedWins, lowerSeedWins);
	}

	AFL_updateFunction(nodeName: AflNodeNames, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow({ bracket: "AFL", nodeName: nodeName }, upperSeedWins, lowerSeedWins);
	}
}
