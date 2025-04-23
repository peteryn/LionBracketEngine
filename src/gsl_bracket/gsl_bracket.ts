import { GenericMatchNode } from "../models/generic_match_node.ts";
import { Seed } from "../models/match_record.ts";
import { getLoser, getWinner, isFilledMatch } from "../util/util.ts";
import { BASE_GSL_NODES, BaseGslBracket, FINAL_GSL_NODES } from "./base_gsl_bracket.ts";

export type GSLNodeTypes = typeof BASE_GSL_NODES[number] | typeof FINAL_GSL_NODES[number];

export class GSLBracket extends BaseGslBracket<GSLNodeTypes> {
	protected createBracketStructure(): [GenericMatchNode<GSLNodeTypes>[], GenericMatchNode<GSLNodeTypes>[]] {
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
		usf2.lowerRound = lsf1;
	}

	getPromoted(): (Seed | undefined)[] {
		const res: (Seed | undefined)[] = [];

		const upperFinal = this.getBracketNode("UpperFinal");
		res.push(...this.addPromotedOrUndefined(upperFinal));

		const lowerFinal = this.getBracketNode("LowerFinal");
		res.push(...this.addPromotedOrUndefined(lowerFinal));

		return res;
	}

	protected addPromotedOrUndefined(node: GenericMatchNode<GSLNodeTypes>): (Seed | undefined)[] {
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
