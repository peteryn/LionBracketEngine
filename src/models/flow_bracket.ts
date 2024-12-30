import { RoundNode } from "./round_node.ts";
import { BracketNode } from "./bracket_node.ts";

export interface FlowBracket<NodeType extends BracketNode> {
	updateRounds(root: NodeType): void;
	setMatchRecordWithValueById(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean;
}
