import { FlowBracket } from "../models/flow_bracket.ts";
import { MatchRecord } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import { AFLBracket } from "./afl_bracket.ts";

export class AFLBracketFlow extends AFLBracket implements FlowBracket {
	constructor() {
		super();
		const upperFinals = this.getRoundNode("1-0");
		upperFinals.matches[0].matchRecord = new MatchRecord(1, 4);
		upperFinals.matches[1].matchRecord = new MatchRecord(2, 3);

		const lowerRound1 = this.getRoundNode("0-1");
		lowerRound1.matches[0].matchRecord = new MatchRecord(5, 8);
		lowerRound1.matches[1].matchRecord = new MatchRecord(6, 7);
	}

	updateRounds(rootRound: RoundNode): void {}
}
