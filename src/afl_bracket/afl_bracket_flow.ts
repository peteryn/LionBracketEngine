import { FlowBracket } from "../models/flow_bracket.ts";
import { FullRecord, FullRecordFactory, MatchRecord, Seed } from "../models/match_record.ts";
import { AFLBracket } from "./afl_bracket.ts";
import { MatchNode } from "../models/match_node.ts";
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

	// this will only be called if called on a node with a FullRecord
	updateRounds(root: MatchNode): void {
		if (!root.match.matchRecord) {
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
				this.handleScores(root, matchRecord);
		}
	}

	private handleScores(root: MatchNode, matchRecord: FullRecord) {
		if (matchRecord.upperSeedWins > matchRecord.lowerSeedWins) {
			this.updateRound(root.upperRound, matchRecord.upperSeed, root.isUpper);
			this.updateRound(root.lowerRound, matchRecord.lowerSeed, true);
		}
		if (matchRecord.upperSeedWins < matchRecord.lowerSeedWins) {
			this.updateRound(root.upperRound, matchRecord.lowerSeed, root.isUpper);
			this.updateRound(root.lowerRound, matchRecord.upperSeed, true);
		} 
	}

	private updateRound(round: MatchNode | undefined, seed: number, isUpper: boolean) {
		if (round) {
			round.match.matchRecord = this.processTeam(round.match.matchRecord, seed, isUpper);
		}
	}

	private processTeam(
		matchRecord: MatchRecord | undefined,
		curSeed: Seed,
		fromUpper: boolean
	): MatchRecord | undefined {
		if (!matchRecord) {
			// there needs to be another condition to determine if you are lowerRound1 or upperQuarterFinal1
			if (fromUpper) {
				return {
					type: "UpperRecord",
					upperSeed: curSeed,
					upperSeedWins: 0,
				};
			} else {
				return {
					type: "LowerRecord",
					lowerSeed: curSeed,
					lowerSeedWins: 0,
				};
			}
		}
		switch (matchRecord.type) {
			case "UpperRecord":
				return {
					type: "FullRecord",
					upperSeed: matchRecord.upperSeed,
					upperSeedWins: matchRecord.upperSeedWins,
					lowerSeed: curSeed,
					lowerSeedWins: 0,
				};
			case "LowerRecord":
				return {
					type: "FullRecord",
					upperSeed: curSeed,
					upperSeedWins: 0,
					lowerSeed: matchRecord.lowerSeed,
					lowerSeedWins: matchRecord.lowerSeedWins,
				};
			case "FullRecord":
				// undefined bc this is an impossible state since we cleared dependents
				// the compiler just doesn't know it yet.
				return undefined;
		}
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
