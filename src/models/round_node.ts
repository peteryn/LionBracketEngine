import { BracketNode } from "./bracket_node.ts";
import type { Match } from "./match.ts";
import type { Seed } from "./match_record.ts";

export class RoundNode implements BracketNode {
	name: string;
	numSeeds: number;
	winRecord: number;
	loseRecord: number;
	upperRound: RoundNode | undefined;
	lowerRound: RoundNode | undefined;
	matches: Match[];
	level: number;
	has2Parents: boolean;
	// TODO: these can probably be removed in a refactor
	promotionSeeds: Seed[];
	eliminationSeeds: Seed[];

	constructor(
		name: string,
		numSeeds: number,
		winRecord: number,
		loseRecord: number,
		level: number
	) {
		this.name = name;
		this.numSeeds = numSeeds;
		this.winRecord = winRecord;
		this.loseRecord = loseRecord;
		this.matches = [];
		this.level = level;
		this.has2Parents = false;
		this.promotionSeeds = [];
		this.eliminationSeeds = [];
	}
}
