import { Bracket } from "../models/bracket.ts";
import { RoundNode } from "../models/round_node.ts";

export class GSLBracket extends Bracket {
	override rootRound: RoundNode;

	constructor() {
		super();
		this.rootRound = new RoundNode("", 0, 0, 0, 0);
	}
}
