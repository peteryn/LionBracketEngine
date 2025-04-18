import { AFLBracket } from "../afl_bracket/afl_bracket.ts";
import { GSLBracket } from "../gsl_bracket/gsl_bracket.ts";
import { Seed } from "../models/match_record.ts";
import { populateMatchRecord } from "../util/util.ts";

export class RegionalTournament {
	GSL_A: GSLBracket;
	GSL_B: GSLBracket;
	AFL: AFLBracket;

	constructor() {
		this.GSL_A = new GSLBracket([1, 3, 5, 7, 9, 11, 13, 15]);
		this.GSL_B = new GSLBracket([2, 4, 6, 8, 10, 12, 14, 16]);
		this.AFL = new AFLBracket(false);
	}

	updateFlow(bracketId: number, matchId: string, upperSeedWins: number, lowerSeedWins: number) {
		switch (bracketId) {
			case 0:
				this.GSL_A.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
				break;
			case 1:
				this.GSL_B.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
				break;
			case 2:
				this.AFL.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
				break;
		}

		if (bracketId === 0 || bracketId === 1) {
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
			populateMatchRecord(promotedSeeds, this.AFL, 0, 3, "upperQuarterFinal1");
			populateMatchRecord(promotedSeeds, this.AFL, 1, 2, "upperQuarterFinal2");
			populateMatchRecord(promotedSeeds, this.AFL, 4, 7, "lowerBracketRound1");
			populateMatchRecord(promotedSeeds, this.AFL, 5, 6, "lowerBracketRound2");
		}
	}

	GSL_A_updateFunction(matchId: string, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow(0, matchId, upperSeedWins, lowerSeedWins);
	}

	GSL_B_updateFunction(matchId: string, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow(1, matchId, upperSeedWins, lowerSeedWins);
	}

	AFL_updateFunction(matchId: string, upperSeedWins: number, lowerSeedWins: number) {
		this.updateFlow(2, matchId, upperSeedWins, lowerSeedWins);
	}
}
