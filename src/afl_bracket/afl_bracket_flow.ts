import { FlowBracket } from "../models/flow_bracket.ts";
import { MatchRecord, Seed } from "../models/match_record.ts";
import { AFLBracket } from "./afl_bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { RoundNode } from "../models/round_node.ts";
import { levelOrderTraversal } from "../util/util.ts";

export class AFLBracketFlow extends AFLBracket implements FlowBracket<MatchNode> {
	constructor() {
		super();
		const upperQuarterFinal1 = this.getRoundNode("upperQuarterFinal1");
		upperQuarterFinal1.match.matchRecord = new MatchRecord(1, 4);
		const upperQuarterFinal2 = this.getRoundNode("upperQuarterFinal2");
		upperQuarterFinal2.match.matchRecord = new MatchRecord(2, 3);
		const lowerBracketRound1 = this.getRoundNode("lowerBracketRound1");
		lowerBracketRound1.match.matchRecord = new MatchRecord(5, 8);
		const lowerBracketRound2 = this.getRoundNode("lowerBracketRound2");
		lowerBracketRound2.match.matchRecord = new MatchRecord(6, 7);
	}

	updateRounds(root: MatchNode): void {
		if (!root.match.matchRecord) {
			return;
		}

		const matchRecord = root.match.matchRecord;
		this.clearDependents(root.upperRound, matchRecord.upperSeed, matchRecord.lowerSeed)
		this.clearDependents(root.lowerRound, matchRecord.upperSeed, matchRecord.lowerSeed)
		if (matchRecord.upperSeedWins < matchRecord.lowerSeedWins) {
			root.upperRound!.match.matchRecord!.lowerSeed = matchRecord.lowerSeed;
		}
	}

	private clearDependents(root: MatchNode | undefined, upperSeed: Seed, lowerSeed: Seed) {
		if (root) {
			levelOrderTraversal(root, (node) => {
				if (!node.match.matchRecord) {
					return;
				}

				const mr = node.match.matchRecord;
				if (mr.upperSeed === upperSeed) {
					mr.upperSeed = -1;
					mr.upperSeedWins = 0;
				}
				if (mr.lowerSeed === upperSeed) {
					mr.lowerSeed = -1;
					mr.lowerSeedWins = 0;
				}
				if (mr.upperSeed === lowerSeed) {
					mr.upperSeed = -1;
					mr.upperSeedWins = 0;
				}
				if (mr.lowerSeed === lowerSeed) {
					mr.lowerSeed = -1;
					mr.lowerSeedWins = 0;
				}
			})
		}
	}

	// perhaps we should change this name so that it can be included in the flow interface
	// and then we can get rid of updateRounds
	// updateRounds is implementation specific and that's why there is a unused root variable
	// in the function above
	// or refactor it so that there are multiple roots in a tree that eventually land at the
	// same child (maybe a future factor that doesn't use recursion to traverse tree)
	override setMatchRecordWithValueById(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean {
		const res = super.setMatchRecordWithValueById(matchId, upperSeedWins, lowerSeedWins);
		const roundNodeName = matchId.split(".")[0];
		const roundNode = this.getRoundNode(roundNodeName);
		if (res) {
			this.updateRounds(roundNode);
		}
		return res;
	}
}
