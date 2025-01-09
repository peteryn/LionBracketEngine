import type { FullRecord, MatchRecord } from "./match_record.ts";

export class Match {
	id: string;
	matchRecord: MatchRecord | undefined;

	constructor(nodeName: string, index: number) {
		this.id = `${nodeName}.${index}`;
	}
}

export type SwissMatch = {
	id: string;
	matchRecord: FullRecord | undefined;
};

export function getMatchId(nodeName: string, index: number) {
	return `${nodeName}.${index}`;
}
