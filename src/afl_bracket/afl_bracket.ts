import { Bracket } from "../models/bracket.ts";
import { Match } from "../models/match.ts";
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

export class AFLBracket implements Bracket<GenericMatchNode<AFLNodeTypes>, AFLNodeTypes> {
	upperQuarterFinal1: MatchNode;
	upperQuarterFinal2: MatchNode;
	lowerBracketRound1: MatchNode;
	lowerBracketRound2: MatchNode;

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
			this.upperQuarterFinal1.match.matchRecord = FullRecordFactory(seeds[0], seeds[3]);
			this.upperQuarterFinal2.match.matchRecord = FullRecordFactory(seeds[1], seeds[2]);
			this.lowerBracketRound1.match.matchRecord = FullRecordFactory(seeds[4], seeds[7]);
			this.lowerBracketRound2.match.matchRecord = FullRecordFactory(seeds[5], seeds[6]);
		}
	}

	getBracketNode(nodeName: AFLNodeTypes): GenericMatchNode<AFLNodeTypes> {
		// if (this.upperQuarterFinal1.name === nodeName) {
		// 	return this.upperQuarterFinal1;
		// }
		// if (this.upperQuarterFinal2.name === nodeName) {
		// 	return this.upperQuarterFinal2;
		// }
		//
		// let matchNode: MatchNode | undefined;
		// levelOrderTraversal(this.lowerBracketRound1, (node) => {
		// 	if (node.name === nodeName) {
		// 		matchNode = node;
		// 	}
		// });
		// levelOrderTraversal(this.lowerBracketRound2, (node) => {
		// 	if (node.name === nodeName) {
		// 		matchNode = node;
		// 	}
		// });
		// return matchNode as MatchNode;

		return new GenericMatchNode("UpperQuarterFinal1", false);
	}

	getMatch(matchId: string): Match {
		const [roundName] = matchId.split(".");
		const matchNode = this.getBracketNode(roundName);
		return matchNode.match;
	}

	getMatchRecord(matchId: string): MatchRecord | undefined {
		const matchRecord = this.getMatch(matchId)?.matchRecord;
		if (!matchRecord) {
			return undefined;
		}
		return structuredClone(matchRecord);
	}

	setMatchRecord(matchId: string, matchRecord: MatchRecord): boolean {
		const match = this.getMatch(matchId);
		if (match) {
			match.matchRecord = matchRecord;
			const matchNodeName = match.id.split(".")[0];
			const matchNode = this.getBracketNode(matchNodeName);
			if (matchNode) {
				return true;
			}
		}
		return false;
	}

	setMatchRecordWithValue(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number,
	): boolean {
		const mr = this.getMatchRecord(matchId);
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

		return this.setMatchRecord(matchId, mr);
	}

	static createAFLBracket(): MatchNode[] {
		const grandFinal = new MatchNode("grandFinal", false);

		const semiFinal1 = new MatchNode("semiFinal1", true);
		const semiFinal2 = new MatchNode("semiFinal2", false);

		const upperQuarterFinal1 = new MatchNode("upperQuarterFinal1", true);

		const upperQuarterFinal2 = new MatchNode("upperQuarterFinal2", true);

		const lowerQuarterFinal1 = new MatchNode("lowerQuarterFinal1", false);

		const lowerQuarterFinal2 = new MatchNode("lowerQuarterFinal2", false);

		const lowerBracketRound1 = new MatchNode("lowerBracketRound1", false);

		const lowerBracketRound2 = new MatchNode("lowerBracketRound2", false);

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

	getAllMatchNodes(): MatchNode[] {
		const lbqf1 = this.lowerBracketRound1.upperRound as MatchNode;
		const lbqf2 = this.lowerBracketRound2.upperRound as MatchNode;
		const sf1 = this.upperQuarterFinal2.upperRound as MatchNode;
		const sf2 = this.upperQuarterFinal1.upperRound as MatchNode;
		const gf = sf1.upperRound as MatchNode;

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

	buildBracket(matchNodes: MatchNode[]) {
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
		this.upperQuarterFinal1.match.matchRecord = undefined;
		this.upperQuarterFinal2.match.matchRecord = undefined;
		levelOrderTraversal(this.lowerBracketRound1, (node) => {
			node.match.matchRecord = undefined;
		});
		levelOrderTraversal(this.lowerBracketRound2, (node) => {
			node.match.matchRecord = undefined;
		});
	}

	setMatchRecordAndFlow(matchId: string, upperSeedWins: number, lowerSeedWins: number): boolean {
		const res = this.setMatchRecordWithValue(matchId, upperSeedWins, lowerSeedWins);
		const roundNodeName = matchId.split(".")[0];
		const roundNode = this.getBracketNode(roundNodeName);
		if (res) {
			this.updateFlow(roundNode);
		}
		return res;
	}

	// this will only be called if called on a node with a FullRecord
	updateFlow(root: MatchNode): void {
		this.eliminationBracket.updateFlow(root);
	}
}
