import { Bracket } from "../models/bracket.ts";
import { GenericMatchNode } from "../models/generic_match_node.ts";
import { EliminationBracket } from "../models/elimination_bracket.ts";
import { FullRecordFactory, MatchRecord, Seed } from "../models/match_record.ts";

export const BASE_GSL_NODES = [
	"UpperQuarterFinal1",
	"UpperQuarterFinal2",
	"UpperQuarterFinal3",
	"UpperQuarterFinal4",
	"UpperSemiFinal1",
	"UpperSemiFinal2",
	"LowerQuarterFinal1",
	"LowerQuarterFinal2",
	"LowerSemiFinal1",
	"LowerSemiFinal2",
] as const;
export const FINAL_GSL_NODES = [
	"UpperFinal",
	"LowerFinal",
] as const;

export abstract class BaseGslBracket<NodeName extends string> implements Bracket<NodeName> {
	upperMatches: GenericMatchNode<NodeName>[] = [];
	lowerMatches: GenericMatchNode<NodeName>[] = [];
	eliminationBracket: EliminationBracket<NodeName>;

	constructor(seeds?: Seed[]) {
		[this.upperMatches, this.lowerMatches] = this.createBracketStructure();
		this.eliminationBracket = new EliminationBracket();

		this.initializeSeeds(seeds);
	}

	protected initializeSeeds(seeds?: Seed[]): void {
		if (!seeds) {
			this.upperMatches[0].matchRecord = FullRecordFactory(1, 8);
			this.upperMatches[1].matchRecord = FullRecordFactory(4, 5);
			this.upperMatches[2].matchRecord = FullRecordFactory(2, 7);
			this.upperMatches[3].matchRecord = FullRecordFactory(3, 6);
		} else {
			this.upperMatches[0].matchRecord = FullRecordFactory(seeds[0], seeds[7]);
			this.upperMatches[1].matchRecord = FullRecordFactory(seeds[3], seeds[4]);
			this.upperMatches[2].matchRecord = FullRecordFactory(seeds[1], seeds[6]);
			this.upperMatches[3].matchRecord = FullRecordFactory(seeds[2], seeds[5]);
		}
	}

	protected abstract createBracketStructure(): [GenericMatchNode<NodeName>[], GenericMatchNode<NodeName>[]];

	getBracketNode(nodeName: NodeName): GenericMatchNode<NodeName> {
		const allNodes = this.getAllMatchNodes();
		let resultNode: GenericMatchNode<NodeName> | undefined;
		for (const node of allNodes) {
			if (node.name === nodeName) {
				resultNode = node;
				break;
			}
		}
		return resultNode as GenericMatchNode<NodeName>;
	}

	getMatchRecord(nodeName: NodeName): MatchRecord | undefined {
		const matchRecord = this.getBracketNode(nodeName).matchRecord;
		return structuredClone(matchRecord);
	}

	setMatchRecord(nodeName: NodeName, matchRecord: MatchRecord) {
		this.getBracketNode(nodeName).matchRecord = structuredClone(matchRecord);
	}

	setMatchRecordWithValue(
		nodeName: NodeName,
		upperSeedWins: number,
		lowerSeedWins: number,
	): boolean {
		const mr = this.getMatchRecord(nodeName);
		if (!mr) {
			return false;
		}

		switch (mr.type) {
			case "UpperRecord":
			case "LowerRecord":
				return false;
			case "FullRecord":
				mr.upperSeedWins = upperSeedWins;
				mr.lowerSeedWins = lowerSeedWins;
		}

		this.setMatchRecord(nodeName, mr);
		return true;
	}

	updateFlow(root: GenericMatchNode<NodeName>): void {
		this.eliminationBracket.updateFlow(root);
	}

	setMatchRecordAndFlow(
		nodeName: NodeName,
		upperSeedWins: number,
		lowerSeedWins: number,
	): boolean {
		const res = this.setMatchRecordWithValue(nodeName, upperSeedWins, lowerSeedWins);
		const roundNode = this.getBracketNode(nodeName);
		if (res) {
			this.updateFlow(roundNode);
		}
		return res;
	}

	abstract getAllMatchNodes(): GenericMatchNode<NodeName>[];

	abstract buildBracket(matchNodes: GenericMatchNode<NodeName>[]): void;

	abstract getPromoted(): (Seed | undefined)[];
}