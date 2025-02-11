import { AFLBracketFlow } from "../afl_bracket/afl_bracket_flow.ts";
import { SwissBracketFlow } from "../swiss_bracket/swiss_backet_flow.ts";

export class Tournament {
    swissBracket: SwissBracketFlow
    aflBracket: AFLBracketFlow

    constructor() {
        this.swissBracket = new SwissBracketFlow(16, 3);
        this.aflBracket = new AFLBracketFlow();
    }

    updateFlow(forSwissBracket: boolean, matchId: string, upperSeedWins: number, lowerSeedWins: number) {
        if (forSwissBracket) {
            this.aflBracket.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
        } else {
            this.aflBracket.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
        }
    }
}