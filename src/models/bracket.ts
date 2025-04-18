import { BracketNode } from "./bracket_node.ts";
import { Match } from "./match.ts";
import { MatchRecord } from "./match_record.ts";

export interface Bracket<NodeType extends BracketNode, NodeNames extends string> {
	getBracketNode(nodeName: NodeNames): NodeType;

	// getMatch(matchId: string): Match;

	getMatchRecord(nodeName: NodeNames): MatchRecord | undefined;

	setMatchRecord(nodeName: NodeNames, matchRecord: MatchRecord): void;

	setMatchRecordWithValue(nodeName: NodeNames, upperSeedWins: number, lowerSeedWins: number): boolean;
}
