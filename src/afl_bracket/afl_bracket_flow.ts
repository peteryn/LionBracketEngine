import { FlowBracket } from "../models/flow_bracket.ts";
import { MatchRecord } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import { AFLBracket } from "./afl_bracket.ts";

export class AFLBracketFlow extends AFLBracket implements FlowBracket {
	constructor() {
		super();
	}

	updateRounds(rootRound: RoundNode): void {}
}
