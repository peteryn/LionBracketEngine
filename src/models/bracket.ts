import { AFLBracketFlow } from "../afl_bracket/afl_bracket_flow.ts";
import { SwissBracketFlow } from "../swiss_bracket/swiss_backet_flow.ts";
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

export type Major1SwissBracket = {
	bracketType: "M1SwissBracket"
	bracketObject: SwissBracketFlow
}

export type Major1AFLBracket = {
	bracketType: "M1AFLBracket"
	bracketObject: AFLBracketFlow
}