import { BracketNode } from "./bracket_node.ts";
import { MatchRecord } from "./match_record.ts";
import { GenericMatchNode } from "./generic_match_node.ts";

export interface Bracket<
	NodeName extends string,
	NodeType extends BracketNode = GenericMatchNode<NodeName>,
> {
	getBracketNode(nodeName: NodeName): NodeType;

	getMatchRecord(nodeName: NodeName): MatchRecord | undefined;

	setMatchRecord(nodeName: NodeName, matchRecord: MatchRecord): void;

	setMatchRecordWithValue(
		nodeName: NodeName,
		upperSeedWins: number,
		lowerSeedWins: number,
	): boolean;

	updateFlow(root: NodeType): void;

	getAllMatchNodes(): NodeType[];

	buildBracket(matchNodes: NodeType[]): void;
}
