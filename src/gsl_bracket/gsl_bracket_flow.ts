import { FlowBracket } from "../models/flow_bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { GSLBracket } from "./gsl_bracket.ts";
import { FullRecord, FullRecordFactory, MatchRecord, Seed } from "../models/match_record.ts";
import { levelOrderTraversal } from "../util/util.ts";

export class GSLBracketFlow extends GSLBracket implements FlowBracket<MatchNode> {
	constructor() {
		super();
		this.upperMatches[0].match.matchRecord = FullRecordFactory(1, 8);
		this.upperMatches[1].match.matchRecord = FullRecordFactory(3, 6);
		this.upperMatches[2].match.matchRecord = FullRecordFactory(2, 7);
		this.upperMatches[3].match.matchRecord = FullRecordFactory(4, 5);
	}

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

	setMatchRecordAndFlow(matchId: string, upperSeedWins: number, lowerSeedWins: number): boolean {
		const res = this.setMatchRecordWithValue(matchId, upperSeedWins, lowerSeedWins);
		const roundNodeName = matchId.split(".")[0];
		const roundNode = this.getRoundNode(roundNodeName);
		if (res) {
			this.updateFlow(roundNode);
		}
		return res;
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
}
