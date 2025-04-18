import { BracketNode } from "./bracket_node.ts";
import { Match } from "./match.ts";
import { MatchRecord } from "./match_record.ts";

export interface Bracket<NodeType extends BracketNode, NodeName extends string> {
	getBracketNode(nodeName: NodeName): NodeType;

	// getMatch(matchId: string): Match;

	getMatchRecord(nodeName: NodeName): MatchRecord | undefined;

	setMatchRecord(nodeName: NodeName, matchRecord: MatchRecord): void;

	setMatchRecordWithValue(nodeName: NodeName, upperSeedWins: number, lowerSeedWins: number): boolean;
}
