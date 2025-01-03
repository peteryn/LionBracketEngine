import { RoundNode } from "./round_node.ts";
import { BracketNode } from "./bracket_node.ts";

export interface FlowBracket<NodeType extends BracketNode> {
	updateFlow(root: NodeType): void;
	setMatchRecordAndFlow(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean;
	
}
