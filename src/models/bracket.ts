import { MatchRecord } from "./match_record.ts";
import { BracketNode } from "./bracket_node.ts";
import { Match } from "./match.ts";

export interface Bracket<NodeType extends BracketNode> {
	rootRound: NodeType;

	getRoundNode(nodeName: string): NodeType;

	getMatch(matchId: string): Match;

	getMatchRecordById(matchId: string): MatchRecord | undefined;

	getMatchRecord(roundName: string, matchNumber: number): MatchRecord | undefined;

	setMatchRecord(roundName: string, matchNumber: number, matchRecord: MatchRecord): boolean;

	setMatchRecordById(matchId: string, matchRecord: MatchRecord): boolean;

	setMatchRecordWithValueById(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean;

	setMatchRecordWithValue(
		roundName: string,
		matchNumber: number,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean;
}
