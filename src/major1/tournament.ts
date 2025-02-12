import { AFLBracketFlow } from "../afl_bracket/afl_bracket_flow.ts";
import { SwissBracketFlow } from "../swiss_bracket/swiss_backet_flow.ts";

export class Tournament {
	swissBracket: SwissBracketFlow;
	aflBracket: AFLBracketFlow;

	constructor() {
		this.swissBracket = new SwissBracketFlow(16, 3);
		this.aflBracket = new AFLBracketFlow();
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
            const levelsToWipe = {
                1: ['t1', 't2', 't3'],
                2: ['t1', 't2', 't3'],
                3: ['t1', 't2', 't3'],
                4: ['t2', 't3'],
                5: ['t3']
            };

			const nodesToWipe = levelsToWipe[roundNode.level as keyof typeof levelsToWipe] || [];
            nodesToWipe.forEach(node => {

            });

			// process results
			// get the winners from swiss bracket
			// winners should be swiss sorted
			// populate afl bracket
		} else {
			this.aflBracket.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
		}
	}
}
