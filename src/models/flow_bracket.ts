import { RoundNode } from "./round_node.ts";

export interface FlowBracket {
	updateRounds(rootRound: RoundNode): void;
}