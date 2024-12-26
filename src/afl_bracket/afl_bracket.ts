import { Bracket } from "../models/bracket.ts";
import { RoundNode } from "../models/round_node.ts";

export class AFLBracket extends Bracket {
	override rootRound: RoundNode;

	constructor() {
        super();
		this.rootRound = new RoundNode("", 0, 0, 0, 0);
	}
}
