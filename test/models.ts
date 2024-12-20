import type { MatchRecord } from "@/models/match_record.ts";

export interface MatchRecordSerialized {
	upperSeedWins: number;
	lowerSeedWins: number;
}

export interface TeamNameMap {
	seed: number;
	name: string;
}

export interface TournamentData {
	teamNames: TeamNameMap[];
	"0-0": MatchRecord[];
	"1-0": MatchRecord[];
	"0-1": MatchRecord[];
	"2-0": MatchRecord[];
	"1-1": MatchRecord[];
	"0-2": MatchRecord[];
	"2-1": MatchRecord[];
	"1-2": MatchRecord[];
	"2-2": MatchRecord[];
}
