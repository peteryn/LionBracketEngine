import { FlowBracket } from "../models/flow_bracket.ts";
import { MatchRecord, Seed } from "../models/match_record.ts";
import { AFLBracket } from "./afl_bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { RoundNode } from "../models/round_node.ts";

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
		this.recurse(this.rootRound);
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
		if (res) {
			this.recurse(this.rootRound);
		}
		return res;
	}

	// TODO:
	// 1. Fix this function
	//		fixed, but it is a little ugly that -1 is used to represent a partial match record which
	//		leads to point 2
	// 2. Refactor Match and MatchRecord into 1 object and write that seeds can be undefined
	// 3. Refactor bracket interface to get rid of indexed match methods
	//		fixed
	recurse(node: MatchNode | undefined, visited?: Set<string> | undefined): Seed | undefined {
		if (!visited) {
			visited = new Set();
		}
		if (!node) {
			return;
		}

		let upperSeed = this.recurse(node.upperRound);
		let lowerSeed = this.recurse(node.lowerRound);
		if (node.match.matchRecord) {
			upperSeed = node.match.matchRecord.upperSeed;
			lowerSeed = node.match.matchRecord.lowerSeed;
		}

		if (visited.has(node.name)) {
			return;
		}

		visited.add(node.name);
		if (node.match.matchRecord === undefined) {
			node.match.matchRecord = new MatchRecord(
				upperSeed ?? -1,
				lowerSeed ?? -1
			);

			return;
		}

		node.match.matchRecord.upperSeed = upperSeed ?? -1;
		node.match.matchRecord.lowerSeed = lowerSeed ?? -1;

		if (node.match.matchRecord.upperSeedWins > node.match.matchRecord.lowerSeedWins) {
			return upperSeed;
		}
		if (node.match.matchRecord.upperSeedWins < node.match.matchRecord.lowerSeedWins) {
			return upperSeed;
		}
		return;
	}
}
