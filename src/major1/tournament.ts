import { AFLBracketFlow } from "../afl_bracket/afl_bracket_flow.ts";
import { SwissBracketFlow } from "../swiss_bracket/swiss_backet_flow.ts";
import { FullRecordFactory, UpperRecordFactory } from "../models/match_record.ts";

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
			const lbr1 = this.aflBracket.getRoundNode("lowerBracketRound1");
			const lbr2 = this.aflBracket.getRoundNode("lowerBracketRound2");

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
            // 1 4
            // 2 3
            // 5 8
            // 6 7
            const promotedSeeds = this.swissBracket.getPromotedSeeds();
            if (promotedSeeds[0] && promotedSeeds[3]) {
                this.aflBracket.setMatchRecord(
                    "upperQuarterFinal1",
                    FullRecordFactory(promotedSeeds[0], promotedSeeds[3])
                );
            } else if (promotedSeeds[0]) {
                this.aflBracket.setMatchRecord(
                    "upperQuarterFinal1",
                    UpperRecordFactory(promotedSeeds[0])
                );
            }

            if (promotedSeeds[1] && promotedSeeds[2]) {
                this.aflBracket.setMatchRecord(
                    "upperQuarterFinal2",
                    FullRecordFactory(promotedSeeds[1], promotedSeeds[2])
                );
            } else if (promotedSeeds[1]) {
                this.aflBracket.setMatchRecord(
                    "upperQuarterFinal2",
                    UpperRecordFactory(promotedSeeds[1])
                );
            }

            if (promotedSeeds[4] && promotedSeeds[7]) {
                this.aflBracket.setMatchRecord(
                    "lowerBracketRound1",
                    FullRecordFactory(promotedSeeds[4], promotedSeeds[7])
                );
            } else if (promotedSeeds[4]) {
                this.aflBracket.setMatchRecord(
                    "lowerBracketRound1",
                    UpperRecordFactory(promotedSeeds[4])
                );
            }

            if (promotedSeeds[5] && promotedSeeds[6]) {
                this.aflBracket.setMatchRecord(
                    "lowerBracketRound2",
                    FullRecordFactory(promotedSeeds[5], promotedSeeds[6])
                );
            } else if (promotedSeeds[5]) {
                this.aflBracket.setMatchRecord(
                    "lowerBracketRound2",
                    UpperRecordFactory(promotedSeeds[5])
                );
            }
		} else {
			this.aflBracket.setMatchRecordAndFlow(matchId, upperSeedWins, lowerSeedWins);
		}
	}
}
