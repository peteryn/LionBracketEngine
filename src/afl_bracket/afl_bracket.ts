import { Bracket } from "../models/bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { FullRecordFactory, MatchRecord } from "../models/match_record.ts";
import { levelOrderTraversal } from "../util/util.ts";
import { EliminationBracket } from "../models/EliminationBracket.ts";
import { GenericMatchNode } from "../models/generic_match_node.ts";

const AFL_nodes = [
	"GrandFinal",
	"SemiFinal1",
	"SemiFinal2",
	"UpperQuarterFinal1",
	"UpperQuarterFinal2",
	"LowerQuarterFinal1",
	"LowerQuarterFinal2",
	"LowerBracketRound1",
	"LowerBracketRound2",
] as const;

type AFLNodeTypes = typeof AFL_nodes[number];

// export class AFLBracket implements Bracket<GenericMatchNode<AFLNodeTypes>, AFLNodeTypes>, FlowBracket<GenericMatchNode<AFLNodeTypes>> {
export class AFLBracket implements Bracket<GenericMatchNode<AFLNodeTypes>, AFLNodeTypes> {
	upperQuarterFinal1: GenericMatchNode<AFLNodeTypes>;
	upperQuarterFinal2: GenericMatchNode<AFLNodeTypes>;
	lowerBracketRound1: GenericMatchNode<AFLNodeTypes>;
	lowerBracketRound2: GenericMatchNode<AFLNodeTypes>;

	eliminationBracket: EliminationBracket;

	// by definition, there are 8 seeds for this bracket
	constructor(initialize: boolean = true) {
		[
			this.upperQuarterFinal1,
			this.upperQuarterFinal2,
			this.lowerBracketRound1,
			this.lowerBracketRound2,
		] = AFLBracket.createAFLBracket();

		this.eliminationBracket = new EliminationBracket();

		if (initialize) {
			const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
			this.upperQuarterFinal1.matchRecord = FullRecordFactory(seeds[0], seeds[3]);
			this.upperQuarterFinal2.matchRecord = FullRecordFactory(seeds[1], seeds[2]);
			this.lowerBracketRound1.matchRecord = FullRecordFactory(seeds[4], seeds[7]);
			this.lowerBracketRound2.matchRecord = FullRecordFactory(seeds[5], seeds[6]);
		}
	}

	getBracketNode(nodeName: AFLNodeTypes): GenericMatchNode<AFLNodeTypes> {
		switch (nodeName) {
			case "UpperQuarterFinal1":
				return this.upperQuarterFinal1;
			case "UpperQuarterFinal2":
				return this.upperQuarterFinal2;
			case "LowerBracketRound1":
				return this.lowerBracketRound1;
			case "LowerBracketRound2":
				return this.lowerBracketRound2;
			case "LowerQuarterFinal1":
			case "LowerQuarterFinal2":
			case "SemiFinal1":
			case "SemiFinal2":
			case "GrandFinal": {
				let bracketNode: GenericMatchNode<AFLNodeTypes> | undefined;
				levelOrderTraversal<GenericMatchNode<AFLNodeTypes>>(this.lowerBracketRound1, (node) => {
					if (node.name === nodeName) {
						bracketNode = node;
					}
				});
				levelOrderTraversal(this.lowerBracketRound2, (node) => {
					if (node.name === nodeName) {
						bracketNode = node;
					}
				});
				return bracketNode as GenericMatchNode<AFLNodeTypes>;
			}
		}
	}

	getMatchRecord(nodeName: AFLNodeTypes): MatchRecord | undefined {
		return this.getBracketNode(nodeName).matchRecord;
	}

	setMatchRecord(nodeName: AFLNodeTypes, matchRecord: MatchRecord) {
		this.getBracketNode(nodeName).matchRecord = matchRecord;
	}

	setMatchRecordWithValue(
		nodeName: AFLNodeTypes,
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

	static createAFLBracket(): GenericMatchNode<AFLNodeTypes>[] {
		const grandFinal = new GenericMatchNode<AFLNodeTypes>("GrandFinal", false);

		const semiFinal1 = new GenericMatchNode<AFLNodeTypes>("SemiFinal1", true);
		const semiFinal2 = new GenericMatchNode<AFLNodeTypes>("SemiFinal2", false);

		const upperQuarterFinal1 = new GenericMatchNode<AFLNodeTypes>("UpperQuarterFinal1", true);

		const upperQuarterFinal2 = new GenericMatchNode<AFLNodeTypes>("UpperQuarterFinal2", true);

		const lowerQuarterFinal1 = new  GenericMatchNode<AFLNodeTypes>("LowerQuarterFinal1", false);

		const lowerQuarterFinal2 = new GenericMatchNode<AFLNodeTypes>("LowerQuarterFinal2", false);

		const lowerBracketRound1 = new GenericMatchNode<AFLNodeTypes>("LowerBracketRound1", false);

		const lowerBracketRound2 = new GenericMatchNode<AFLNodeTypes>("LowerBracketRound2", false);

		lowerBracketRound1.upperRound = lowerQuarterFinal1;
		lowerQuarterFinal1.upperRound = semiFinal1;
		semiFinal1.upperRound = grandFinal;

		lowerBracketRound2.upperRound = lowerQuarterFinal2;
		lowerQuarterFinal2.upperRound = semiFinal2;
		semiFinal2.upperRound = grandFinal;

		upperQuarterFinal1.upperRound = semiFinal2;
		upperQuarterFinal2.upperRound = semiFinal1;

		upperQuarterFinal1.lowerRound = lowerQuarterFinal1;
		upperQuarterFinal2.lowerRound = lowerQuarterFinal2;

		return [upperQuarterFinal1, upperQuarterFinal2, lowerBracketRound1, lowerBracketRound2];
	}

	getAllMatchNodes(): GenericMatchNode<AFLNodeTypes>[] {
		const lbqf1 = this.lowerBracketRound1.upperRound as GenericMatchNode<AFLNodeTypes>;
		const lbqf2 = this.lowerBracketRound2.upperRound as GenericMatchNode<AFLNodeTypes>;
		const sf1 = this.upperQuarterFinal2.upperRound as GenericMatchNode<AFLNodeTypes>;
		const sf2 = this.upperQuarterFinal1.upperRound as GenericMatchNode<AFLNodeTypes>;
		const gf = sf1.upperRound as GenericMatchNode<AFLNodeTypes>;

		return [
			this.upperQuarterFinal1,
			this.upperQuarterFinal2,
			this.lowerBracketRound1,
			this.lowerBracketRound2,
			lbqf1,
			lbqf2,
			sf1,
			sf2,
			gf,
		];
	}

	buildBracket(matchNodes: GenericMatchNode<AFLNodeTypes>[]) {
		const [uqf1, uqf2, lbr1, lbr2, lbqf1, lbqf2, sf1, sf2, gf] = matchNodes;
		lbr1.upperRound = lbqf1;
		lbqf1.upperRound = sf1;
		sf1.upperRound = gf;

		lbr2.upperRound = lbqf2;
		lbqf2.upperRound = sf2;
		sf2.upperRound = gf;

		uqf1.upperRound = sf2;
		uqf2.upperRound = sf1;

		uqf1.lowerRound = lbqf1;
		uqf2.lowerRound = lbqf2;

		this.upperQuarterFinal1 = uqf1;
		this.upperQuarterFinal2 = uqf2;
		this.lowerBracketRound1 = lbr1;
		this.lowerBracketRound2 = lbr2;
	}

	clearAllMatchRecords() {
		this.upperQuarterFinal1.matchRecord = undefined;
		this.upperQuarterFinal2.matchRecord = undefined;
		levelOrderTraversal(this.lowerBracketRound1, (node) => {
			node.matchRecord = undefined;
		});
		levelOrderTraversal(this.lowerBracketRound2, (node) => {
			node.matchRecord = undefined;
		});
	}

	setMatchRecordAndFlow(
		nodeName: AFLNodeTypes,
		upperSeedWins: number,
		lowerSeedWins: number,
	): boolean {
		const res = this.setMatchRecordWithValue(nodeName, upperSeedWins, lowerSeedWins);
		// const roundNodeName = matchId.split(".")[0];
		// const roundNode = this.getBracketNode(roundNodeName);
		const node = this.getBracketNode(nodeName);
		if (res) {
			this.updateFlow(node);
		}
		return res;
	}

	// this will only be called if called on a node with a FullRecord
	updateFlow(root: MatchNode): void {
		this.eliminationBracket.updateFlow(root);
	}
}
