import { Bracket } from "../models/bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { MatchRecord } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import { initializeEmptyMatches, postOrderTraversal } from "../util/util.ts";

export class AFLBracket extends Bracket<MatchNode> {
	rootRound: MatchNode;

	// by definition, there are 8 seeds for this bracket
	constructor() {
		super();
		this.rootRound = this.createTree();
	}

	private createTree(): MatchNode {
		const grandFinal = new MatchNode("grandFinal");

		const semiFinal1 = new MatchNode("semiFinal1");
		grandFinal.upperRound = semiFinal1;
		const semiFinal2 = new MatchNode("semiFinal2");
		grandFinal.lowerRound = semiFinal2;

		const upperQuarterFinal1 = new MatchNode("upperQuarterFinal1");
		semiFinal1.upperRound = upperQuarterFinal1;

		const upperQuarterFinal2 = new MatchNode("upperQuarterFinal2");
		semiFinal2.upperRound = upperQuarterFinal2;

		const lowerQuarterFinal1 = new MatchNode("lowerQuarterFinal1");
		semiFinal1.lowerRound = lowerQuarterFinal1;
		lowerQuarterFinal1.upperRound = upperQuarterFinal1;

		const lowerQuarterFinal2 = new MatchNode("lowerQuarterFinal2");
		semiFinal2.lowerRound = lowerQuarterFinal2;
		lowerQuarterFinal2.upperRound = upperQuarterFinal2;

		const lowerBracketRound1 = new MatchNode("lowerBracketRound1");
		lowerQuarterFinal1.lowerRound = lowerBracketRound1;

		const lowerBracketRound2 = new MatchNode("lowerBracketRound2");
		lowerQuarterFinal2.lowerRound = lowerBracketRound2;

		return grandFinal
	}

}
