import { AFLBracketFlow } from "../afl_bracket/afl_bracket_flow.ts";
import { SwissBracketFlow } from "../swiss_bracket/swiss_backet_flow.ts";

export class Tournament {
	swissBracket: SwissBracketFlow;
	aflBracket: AFLBracketFlow;

	constructor() {
		this.swissBracket = new SwissBracketFlow(16, 3);
		this.aflBracket = new AFLBracketFlow(false);
	}

	updateFlow(
		forSwissBracket: boolean,
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
	) {
		if (forSwissBracket) {
			this.swissBracket.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
			// clearing depedents:
			// swiss results are as follows
			// t1: 1, 2
			// t2: 3, 4, 5
			// t3: 6, 7, 8
			// so if a round affects a certain "layer", then those positions in the afl bracket need to be reset
			// for example, if a change affects swiss round 4, seeds 3-8 should be wiped and seeds 1, 2 do not
			// need to be cleared because changes in swiss round 4 and 5 do not affect what happened in swiss round 3
            const roundNodeName = SwissBracketFlow.getRoundNodeName(matchId);
            const roundNode = this.swissBracket.getRoundNode(roundNodeName);

            const uqf1 = this.aflBracket.getRoundNode("upperQuarterFinal1");
            const uqf2 = this.aflBracket.getRoundNode("upperQuarterFinal2");
            const lbr1 = this.aflBracket.getRoundNode("lowerBracketRound1")
            const lbr2 = this.aflBracket.getRoundNode("lowerBracketRound2")

            switch (roundNode.level) {
                case 1:
                case 2:
                case 3:
                    // clear the entire graph
                    // we need all dependents of these nodes to be cleared too
                    // clear upper seed from uqf1, uqf2
                    // and all dependents
                    break;
                case 4:
                    // clear the lower seed from uqf1, uqf2
                    // clear entire records from lbr1, lbr2
                    // and all dependents
                    break;
                case 5:
                    // clear lower seed from lbr1
                    // clear entire record from lbr2
                    // and all depedents
                    break;
                default:

            }

			// process results
			// get the winners from swiss bracket
			// winners should be swiss sorted
			// populate afl bracket
		} else {
			this.aflBracket.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
		}
	}
}
