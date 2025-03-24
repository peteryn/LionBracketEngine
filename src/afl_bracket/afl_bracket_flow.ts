import { FlowBracket } from "../models/flow_bracket.ts";
import { FullRecordFactory, } from "../models/match_record.ts";
import { AFLBracket } from "./afl_bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { levelOrderTraversal } from "../util/util.ts";
import { EliminationBracket } from "../models/EliminationBracket.ts";

export class AFLBracketFlow extends AFLBracket implements FlowBracket<MatchNode> {
	eliminationBracket: EliminationBracket;

	constructor(initialize: boolean = true) {
		super();
		this.eliminationBracket = new EliminationBracket();

		const upperQuarterFinal1 = this.getBracketNode("upperQuarterFinal1");
		const upperQuarterFinal2 = this.getBracketNode("upperQuarterFinal2");
		const lowerBracketRound1 = this.getBracketNode("lowerBracketRound1");
		const lowerBracketRound2 = this.getBracketNode("lowerBracketRound2");
		if (initialize) {
			const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
			upperQuarterFinal1.match.matchRecord = FullRecordFactory(seeds[0], seeds[3]);
			upperQuarterFinal2.match.matchRecord = FullRecordFactory(seeds[1], seeds[2]);
			lowerBracketRound1.match.matchRecord = FullRecordFactory(seeds[4], seeds[7]);
			lowerBracketRound2.match.matchRecord = FullRecordFactory(seeds[5], seeds[6]);
		}
	}

	// this will only be called if called on a node with a FullRecord
	updateFlow(root: MatchNode): void {
		this.eliminationBracket.updateFlow(root);
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
}
