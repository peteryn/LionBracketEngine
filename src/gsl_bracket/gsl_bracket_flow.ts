import { FlowBracket } from "../models/flow_bracket.ts";
import { MatchNode } from "../models/match_node.ts";
import { FullRecordFactory, Seed } from "../models/match_record.ts";
import { EliminationBracket } from "../models/EliminationBracket.ts";
import { getWinner, isFilledMatch } from "../util/util.ts";
import { GSLBracket } from "./gsl_bracket.ts";

export class GSLBracketFlow extends GSLBracket implements FlowBracket<MatchNode> {
	eliminationBracket: EliminationBracket;

	constructor() {
		super();
		this.eliminationBracket = new EliminationBracket();
		this.upperMatches[0].match.matchRecord = FullRecordFactory(1, 8);
		this.upperMatches[1].match.matchRecord = FullRecordFactory(4, 5);
		this.upperMatches[2].match.matchRecord = FullRecordFactory(2, 7);
		this.upperMatches[3].match.matchRecord = FullRecordFactory(3, 6);
	}

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

	getWinners(): Seed[] {
		const res: Seed[] = [];
		const upperFinal = this.getBracketNode("UpperFinal");
		if (isFilledMatch(upperFinal.match)) {
			res.push(getWinner(upperFinal.match));
		}
		const lowerFinal = this.getBracketNode("LowerFinal");
		if (isFilledMatch(lowerFinal.match)) {
			res.push(getWinner(lowerFinal.match));
		}
		return res;
	}
}
