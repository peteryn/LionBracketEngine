import { Bracket } from "../models/bracket.ts";
import { FullRecordFactory, MatchRecord, Seed } from "../models/match_record.ts";
import { getLoser, getWinner, isFilledMatch, levelOrderTraversal } from "../util/util.ts";
import { EliminationBracket } from "../models/EliminationBracket.ts";
import { GenericMatchNode } from "../models/generic_match_node.ts";

const GSL_nodes = [
	"UpperQuarterFinal1",
	"UpperQuarterFinal2",
	"UpperQuarterFinal3",
	"UpperQuarterFinal4",
	"UpperSemiFinal1",
	"UpperSemiFinal2",
	"UpperFinal",
	"LowerQuarterFinal1",
	"LowerQuarterFinal2",
	"LowerSemiFinal1",
	"LowerSemiFinal2",
	"LowerFinal",
] as const;

export type GSLNodeTypes = typeof GSL_nodes[number];

export class GSLBracket implements Bracket<GSLNodeTypes> {
	upperMatches: GenericMatchNode<GSLNodeTypes>[] = [];
	lowerMatches: GenericMatchNode<GSLNodeTypes>[] = [];
	eliminationBracket: EliminationBracket<GSLNodeTypes>;

	constructor(seeds?: Seed[]) {
		[this.upperMatches, this.lowerMatches] = GSLBracket.createGSLBracket();
		this.eliminationBracket = new EliminationBracket();

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

	static createGSLBracket() {
		const upperMatches: GenericMatchNode<GSLNodeTypes>[] = [];
		const lowerMatches: GenericMatchNode<GSLNodeTypes>[] = [];

		upperMatches.push(new GenericMatchNode<GSLNodeTypes>("UpperQuarterFinal1", true));
		upperMatches.push(new GenericMatchNode<GSLNodeTypes>("UpperQuarterFinal2", false));
		upperMatches.push(new GenericMatchNode<GSLNodeTypes>("UpperQuarterFinal3", true));
		upperMatches.push(new GenericMatchNode<GSLNodeTypes>("UpperQuarterFinal4", false));

		const upperSemiFinal1 = new GenericMatchNode<GSLNodeTypes>("UpperSemiFinal1", true);
		upperMatches[0].upperRound = upperSemiFinal1;
		upperMatches[1].upperRound = upperSemiFinal1;

		const upperSemiFinal2 = new GenericMatchNode<GSLNodeTypes>("UpperSemiFinal2", false);
		upperMatches[2].upperRound = upperSemiFinal2;
		upperMatches[3].upperRound = upperSemiFinal2;

		const upperFinal = new GenericMatchNode<GSLNodeTypes>("UpperFinal", true);
		upperSemiFinal1.upperRound = upperFinal;
		upperSemiFinal2.upperRound = upperFinal;

		lowerMatches.push(new GenericMatchNode<GSLNodeTypes>("LowerQuarterFinal1", false));
		lowerMatches.push(new GenericMatchNode<GSLNodeTypes>("LowerQuarterFinal2", false));

		const lowerSemiFinal1 = new GenericMatchNode<GSLNodeTypes>("LowerSemiFinal1", true);
		lowerMatches[0].upperRound = lowerSemiFinal1;

		const lowerSemiFinal2 = new GenericMatchNode<GSLNodeTypes>("LowerSemiFinal2", false);
		lowerMatches[1].upperRound = lowerSemiFinal2;

		const lowerFinal = new GenericMatchNode<GSLNodeTypes>("LowerFinal", true);
		lowerSemiFinal1.upperRound = lowerFinal;
		lowerSemiFinal2.upperRound = lowerFinal;

		upperMatches[0].lowerRound = lowerMatches[0];
		upperMatches[1].lowerRound = lowerMatches[0];

		upperMatches[2].lowerRound = lowerMatches[1];
		upperMatches[3].lowerRound = lowerMatches[1];

		upperSemiFinal1.lowerRound = lowerSemiFinal2;
		upperSemiFinal2.lowerRound = lowerSemiFinal1;

		return [upperMatches, lowerMatches];
	}

	getAllMatchNodes() {
		const uqf1 = this.upperMatches[0];
		const uqf2 = this.upperMatches[1];
		const uqf3 = this.upperMatches[2];
		const uqf4 = this.upperMatches[3];
		const usf1 = uqf1.upperRound as GenericMatchNode<GSLNodeTypes>;
		const usf2 = uqf3.upperRound as GenericMatchNode<GSLNodeTypes>;
		const uf = usf1.upperRound as GenericMatchNode<GSLNodeTypes>;

		const lqf1 = this.lowerMatches[0];
		const lqf2 = this.lowerMatches[1];
		const lsf1 = lqf1.upperRound as GenericMatchNode<GSLNodeTypes>;
		const lsf2 = lqf2.upperRound as GenericMatchNode<GSLNodeTypes>;
		const lf = lsf1.upperRound as GenericMatchNode<GSLNodeTypes>;

		return [uqf1, uqf2, uqf3, uqf4, usf1, usf2, uf, lqf1, lqf2, lsf1, lsf2, lf];
	}

	buildBracket(matchNodes: GenericMatchNode<GSLNodeTypes>[]): void {
		const [uqf1, uqf2, uqf3, uqf4, usf1, usf2, uf, lqf1, lqf2, lsf1, lsf2, lf] = matchNodes;
		this.upperMatches = [uqf1, uqf2, uqf3, uqf4];
		this.lowerMatches = [lqf1, lqf2];

		uqf1.upperRound = usf1;
		uqf2.upperRound = usf1;

		uqf3.upperRound = usf2;
		uqf4.upperRound = usf2;

		usf1.upperRound = uf;
		usf2.upperRound = uf;

		lqf1.upperRound = lsf1;
		lqf2.upperRound = lsf2;

		lsf1.upperRound = lf;
		lsf2.upperRound = lf;

		uqf1.lowerRound = lqf1;
		uqf2.lowerRound = lqf1;

		uqf3.lowerRound = lqf2;
		uqf4.lowerRound = lqf2;

		usf1.lowerRound = lsf2;
		uqf2.lowerRound = lqf1;
	}

	getBracketNode(nodeName: GSLNodeTypes): GenericMatchNode<GSLNodeTypes> {
		const allNodes = this.getAllMatchNodes();
		let resultNode: GenericMatchNode<GSLNodeTypes> | undefined;
		for (const node of allNodes) {
			if (node.name === nodeName) {
				resultNode = node;
				break;
			}
		}
		return resultNode as GenericMatchNode<GSLNodeTypes>;
	}

	getMatchRecord(nodeName: GSLNodeTypes): MatchRecord | undefined {
		const matchRecord = this.getBracketNode(nodeName).matchRecord;
		return structuredClone(matchRecord);
	}

	setMatchRecord(nodeName: GSLNodeTypes, matchRecord: MatchRecord) {
		this.getBracketNode(nodeName).matchRecord = structuredClone(matchRecord);
	}

	setMatchRecordWithValue(
		nodeName: GSLNodeTypes,
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

	updateFlow(root: GenericMatchNode<GSLNodeTypes>): void {
		this.eliminationBracket.updateFlow(root);
	}

	setMatchRecordAndFlow(
		nodeName: GSLNodeTypes,
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

	getPromoted(): (Seed | undefined)[] {
		const res: (Seed | undefined)[] = [];

		const upperFinal = this.getBracketNode("UpperFinal");
		res.push(...this.addPromotedOrUndefined(upperFinal));

		const lowerFinal = this.getBracketNode("LowerFinal");
		res.push(...this.addPromotedOrUndefined(lowerFinal));

		return res;
	}

	private addPromotedOrUndefined(node: GenericMatchNode<GSLNodeTypes>): (Seed | undefined)[] {
		const res = [];
		switch (node.matchRecord?.type) {
			case "FullRecord": {
				if (isFilledMatch(node.matchRecord)) {
					res.push(getWinner(node.matchRecord));
					res.push(getLoser(node.matchRecord));
				}
				break;
			}
			default: {
				res.push(undefined);
				res.push(undefined);
			}
		}
		return res;
	}
}
