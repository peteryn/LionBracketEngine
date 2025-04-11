import { AFLBracketFlow } from "../afl_bracket/afl_bracket_flow.ts";
import { GSLBracketFlow } from "../gsl_bracket/gsl_bracket_flow.ts";

export class RegionalTournament {
	GSL_A: GSLBracketFlow;
	GSL_B: GSLBracketFlow;
	AFL: AFLBracketFlow;

	constructor() {
		this.GSL_A = new GSLBracketFlow();
		this.GSL_B = new GSLBracketFlow();
		this.AFL = new AFLBracketFlow();
	}

	updateFlow(matchId: string, upperSeedWins: number, lowerSeedWins: number, bracketId: number) {
        switch (bracketId) {
            case 0:
                this.GSL_A.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
                break
            case 1:
                this.GSL_B.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
                break
            case 2:
                this.AFL.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
                break
        }

        if (bracketId === 0 || bracketId === 1) {
            this.AFL.clearAllMatchRecords();
        }
    }
}
