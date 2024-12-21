import type { MatchRecord } from "./match_record.ts";

export class Match {
	id: string;
	matchRecord: MatchRecord | undefined;

	constructor(nodeName: string, index: number) {
		this.id = `${nodeName}.${index}`;
	}
}