import { FlowBracket } from "../models/flow_bracket.ts";
import { FullRecord, FullRecordFactory, MatchRecord, Seed } from "../models/match_record.ts";
import { AFLBracket } from "./afl_bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { levelOrderTraversal } from "../util/util.ts";
import { Match } from "../models/match.ts";

export class AFLBracketFlow extends AFLBracket implements FlowBracket<MatchNode> {
	bracketType: string;

	constructor(initialize: boolean = true) {
		super();
		const upperQuarterFinal1 = this.getRoundNode("upperQuarterFinal1");
		const upperQuarterFinal2 = this.getRoundNode("upperQuarterFinal2");
		const lowerBracketRound1 = this.getRoundNode("lowerBracketRound1");
		const lowerBracketRound2 = this.getRoundNode("lowerBracketRound2");
		if (initialize) {
			const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
			upperQuarterFinal1.match.matchRecord = FullRecordFactory(seeds[0], seeds[3]);
			upperQuarterFinal2.match.matchRecord = FullRecordFactory(seeds[1], seeds[2]);
			lowerBracketRound1.match.matchRecord = FullRecordFactory(seeds[4], seeds[7]);
			lowerBracketRound2.match.matchRecord = FullRecordFactory(seeds[5], seeds[6]);
		}
		this.bracketType = "AFLBracketFlow";
	}

	// this will only be called if called on a node with a FullRecord
	updateFlow(root: MatchNode): void {
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
							// potentially want to reset this to 0 if we deem their previous
							// guess invalid when the match up changes
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
	setMatchRecordAndFlow(matchId: string, upperSeedWins: number, lowerSeedWins: number): boolean {
		const res = this.setMatchRecordWithValue(matchId, upperSeedWins, lowerSeedWins);
		const roundNodeName = matchId.split(".")[0];
		const roundNode = this.getRoundNode(roundNodeName);
		if (res) {
			this.updateFlow(roundNode);
		}
		return res;
	}

	getAllMatchNodes(): MatchNode[] {
		const lbqf1 = this.lowerBracketRound1.upperRound as MatchNode;
		const lbqf2 = this.lowerBracketRound2.upperRound as MatchNode;
		const sf1 = this.upperQuarterFinal2.upperRound as MatchNode;
		const sf2 = this.upperQuarterFinal1.upperRound as MatchNode;
		const gf = sf1.upperRound as MatchNode;

		return [
			this.upperQuarterFinal1,
			this.upperQuarterFinal2,
			this.lowerBracketRound1,
			this.lowerBracketRound2,
			lbqf1,
			lbqf2,
			sf1,
			sf2,
			gf,
		];
	}

	clearAllMatchRecords() {
		this.upperQuarterFinal1.match.matchRecord = undefined;
		this.upperQuarterFinal2.match.matchRecord = undefined;
		levelOrderTraversal(this.lowerBracketRound1, (node) => {
			node.match.matchRecord = undefined;
		});
		levelOrderTraversal(this.lowerBracketRound2, (node) => {
			node.match.matchRecord = undefined;
		});
	}
}
