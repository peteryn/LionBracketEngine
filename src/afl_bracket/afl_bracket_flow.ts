import { FlowBracket } from "../models/flow_bracket.ts";
import { MatchRecord, Seed } from "../models/match_record.ts";
import { AFLBracket } from "./afl_bracket.ts";
import { MatchNode } from "../models/match_node.ts";

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
		const tournamentWinner = this.recurse(this.rootRound);
	}

	override setMatchRecordWithValue(
		roundName: string,
		matchNumber: number,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean {
		const res = super.setMatchRecordWithValue(
			roundName,
			matchNumber,
			upperSeedWins,
			lowerSeedWins
		);
		const roundNode = this.getRoundNode(roundName);
		if (res) {
			this.updateRounds(roundNode);
		}
		return res;
	}

	// TODO:
	// 1. Fix this function
	// 2. Refactor Match and MatchRecord into 1 object and write that seeds can be undefined
	// 3. Refactor bracket interface to get rid of indexed match methods
	recurse(node: MatchNode | undefined, visited?: Set<string> | undefined): Seed | undefined {
		if (!visited) {
			visited = new Set();
		}
		if (!node) {
			return;
		}

		const upperSeed = this.recurse(node.upperRound);
		const lowerSeed = this.recurse(node.lowerRound);
		if (visited.has(node.name)) {
			return;
		}

		visited.add(node.name);
		if (node.match.matchRecord === undefined) {
			console.log("hello")
			if (!upperSeed && lowerSeed) {
				console.log("first if")
				node.match.matchRecord = new MatchRecord(-1, lowerSeed);
			}
			if (upperSeed && !lowerSeed) {
				console.log("second if")
				node.match.matchRecord = new MatchRecord(upperSeed, -1);
			}
			if (upperSeed && lowerSeed) {
				console.log("third if")
				node.match.matchRecord = new MatchRecord(upperSeed, lowerSeed);
			}
			if (!upperSeed && !lowerSeed) {
				console.log("fourth if")
				node.match.matchRecord = new MatchRecord(-1, -1);
			}

			return;
		}

		if (upperSeed) {
			node.match.matchRecord.upperSeed = upperSeed;
		} else {
			node.match.matchRecord.upperSeed = -1;
		}
		if (lowerSeed) {
			node.match.matchRecord.lowerSeed = lowerSeed;
		} else {
			node.match.matchRecord.lowerSeed = -1;
		}

		if (node.match.matchRecord.upperSeedWins > node.match.matchRecord.lowerSeedWins) {
			return upperSeed;
		}
		if (node.match.matchRecord.upperSeedWins < node.match.matchRecord.lowerSeedWins) {
			return upperSeed;
		}
		return;
	}
}
