import { BracketNode } from "./bracket_node.ts";
import { Match } from "./match.ts";
import { MatchRecord } from "./match_record.ts";

export interface Bracket<NodeType extends BracketNode> {
	getRoundNode(nodeName: string): NodeType;

	getMatch(matchId: string): Match;

	getMatchRecord(matchId: string): MatchRecord | undefined;

	setMatchRecord(matchId: string, matchRecord: MatchRecord): boolean;

	setMatchRecordWithValue(matchId: string, upperSeedWins: number, lowerSeedWins: number): boolean;
}
