import { Bracket } from "../models/bracket.ts";
import { RoundNode } from "../models/round_node.ts";
import { initializeEmptyMatches } from "../util/util.ts";

export class AFLBracket extends Bracket {
	override rootRound: RoundNode;

	// by definition, there are 8 seeds for this bracket
	constructor() {
		super();
		this.rootRound = new RoundNode("0-0", 0, 0, 0, 0);

		const upperFinals = new RoundNode("1-0", 4, 0, 0, 1);
		this.rootRound.winningRound = upperFinals;

		const lowerBracketRound1 = new RoundNode("0-1", 4, 0, 0, 1);
		this.rootRound.losingRound = lowerBracketRound1;

		const lowerBracketQuarterFinals = new RoundNode("1-1", 4, 0, 0, 2);
		upperFinals.losingRound = lowerBracketQuarterFinals;
		lowerBracketRound1.winningRound = lowerBracketQuarterFinals;

		const semiFinals = new RoundNode("2-1", 4, 0, 0, 3);
		upperFinals.winningRound = semiFinals;
		lowerBracketQuarterFinals.winningRound = semiFinals;

		const grandFinal = new RoundNode("3-1", 2, 0, 0, 4);
		semiFinals.winningRound = grandFinal;

		initializeEmptyMatches(this.rootRound);
	}
}
