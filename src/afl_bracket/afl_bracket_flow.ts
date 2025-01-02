import { FlowBracket } from "../models/flow_bracket.ts";
import { FullRecordFactory, MatchRecord, Seed } from "../models/match_record.ts";
import { AFLBracket } from "./afl_bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { RoundNode } from "../models/round_node.ts";
import { levelOrderTraversal } from "../util/util.ts";

export class AFLBracketFlow extends AFLBracket implements FlowBracket<MatchNode> {
	constructor() {
		super();
		const upperQuarterFinal1 = this.getRoundNode("upperQuarterFinal1");
		upperQuarterFinal1.match.matchRecord = FullRecordFactory(1, 4);
		const upperQuarterFinal2 = this.getRoundNode("upperQuarterFinal2");
		upperQuarterFinal2.match.matchRecord = FullRecordFactory(2, 3);
		const lowerBracketRound1 = this.getRoundNode("lowerBracketRound1");
		lowerBracketRound1.match.matchRecord = FullRecordFactory(5, 8);
		const lowerBracketRound2 = this.getRoundNode("lowerBracketRound2");
		lowerBracketRound2.match.matchRecord = FullRecordFactory(6, 7);
	}

	updateRounds(root: MatchNode): void {
		if (!root.match.matchRecord || !root.upperRound) {
			return;
		}

		const matchRecord = root.match.matchRecord;
		switch (matchRecord.type) {
			case "UpperRecord":
			case "LowerRecord":
				break;
			case "FullRecord":
				this.clearDependents(root.upperRound, matchRecord.upperSeed, matchRecord.lowerSeed);
				this.clearDependents(root.lowerRound, matchRecord.upperSeed, matchRecord.lowerSeed);

				if (matchRecord.upperSeedWins > matchRecord.lowerSeedWins) {
					const upperMatchRecord = root.upperRound.match.matchRecord;
					if (!upperMatchRecord) {
						root.upperRound.match.matchRecord = {
							type: "UpperRecord",
							upperSeed: matchRecord.upperSeed,
							upperSeedWins: 0,
						};
						break;
					}
					switch (upperMatchRecord.type) {
						case "UpperRecord":
						case "FullRecord":
							break;
						case "LowerRecord":
							root.upperRound.match.matchRecord = {
								type: "FullRecord",
								lowerSeed: upperMatchRecord.lowerSeed,
								lowerSeedWins: upperMatchRecord.lowerSeedWins,
								upperSeed: matchRecord.upperSeed,
								upperSeedWins: 0,
							};
					}
				} else if (matchRecord.upperSeedWins < matchRecord.lowerSeedWins) {
					const upperMatchRecord = root.upperRound.match.matchRecord;
				}
		}
	}

	private processUpperTeamWin() {
		
	}

	private clearDependents(root: MatchNode | undefined, upperSeed: Seed, lowerSeed: Seed) {
		if (!root) {
			return;
		}

		const update = (node: MatchNode) => {
			const mr = node.match.matchRecord;
			if (!mr) {
				return;
			}

			switch (mr.type) {
				case "UpperRecord":
					if (mr.upperSeed === upperSeed) {
						node.match.matchRecord = undefined;
					}
					break;
				case "LowerRecord":
					if (mr.lowerSeed === lowerSeed) {
						node.match.matchRecord = undefined;
					}
					break;
				case "FullRecord":
					if (mr.upperSeed === upperSeed) {
						node.match.matchRecord = {
							type: "LowerRecord",
							lowerSeed: mr.lowerSeed,
							lowerSeedWins: mr.lowerSeedWins,
						};
					}
					if (mr.lowerSeed === lowerSeed) {
						node.match.matchRecord = {
							type: "UpperRecord",
							upperSeed: mr.upperSeed,
							upperSeedWins: mr.upperSeedWins,
						};
					}
			}
		};
		levelOrderTraversal(root, update);
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
