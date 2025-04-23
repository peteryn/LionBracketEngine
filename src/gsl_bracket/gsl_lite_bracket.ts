import { GenericMatchNode } from "../models/generic_match_node.ts";
import { MatchRecord, Seed } from "../models/match_record.ts";
import { getWinner, isFilledMatch } from "../util/util.ts";
import { BASE_GSL_NODES, BaseGslBracket } from "./base_gsl_bracket.ts";

export type GslLiteNodeNames = typeof BASE_GSL_NODES[number];
export type GslLiteMatchNode = GenericMatchNode<GslLiteNodeNames>;

export class GslLiteBracket extends BaseGslBracket<GslLiteNodeNames> {
	protected createBracketStructure(): [GslLiteMatchNode[], GslLiteMatchNode[]] {
		const upperMatches: GslLiteMatchNode[] = [];
		const lowerMatches: GslLiteMatchNode[] = [];

		upperMatches.push(new GenericMatchNode<GslLiteNodeNames>("UpperQuarterFinal1", true));
		upperMatches.push(new GenericMatchNode<GslLiteNodeNames>("UpperQuarterFinal2", false));
		upperMatches.push(new GenericMatchNode<GslLiteNodeNames>("UpperQuarterFinal3", true));
		upperMatches.push(new GenericMatchNode<GslLiteNodeNames>("UpperQuarterFinal4", false));

		const upperSemiFinal1 = new GenericMatchNode<GslLiteNodeNames>("UpperSemiFinal1", true);
		upperMatches[0].upperRound = upperSemiFinal1;
		upperMatches[1].upperRound = upperSemiFinal1;

		const upperSemiFinal2 = new GenericMatchNode<GslLiteNodeNames>("UpperSemiFinal2", false);
		upperMatches[2].upperRound = upperSemiFinal2;
		upperMatches[3].upperRound = upperSemiFinal2;

		// No upper final

		lowerMatches.push(new GenericMatchNode<GslLiteNodeNames>("LowerQuarterFinal1", false));
		lowerMatches.push(new GenericMatchNode<GslLiteNodeNames>("LowerQuarterFinal2", false));

		const lowerSemiFinal1 = new GenericMatchNode<GslLiteNodeNames>("LowerSemiFinal1", true);
		lowerMatches[0].upperRound = lowerSemiFinal1;

		const lowerSemiFinal2 = new GenericMatchNode<GslLiteNodeNames>("LowerSemiFinal2", false);
		lowerMatches[1].upperRound = lowerSemiFinal2;

		// No lower final

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
		const usf1 = uqf1.upperRound as GslLiteMatchNode;
		const usf2 = uqf3.upperRound as GslLiteMatchNode;

		const lqf1 = this.lowerMatches[0];
		const lqf2 = this.lowerMatches[1];
		const lsf1 = lqf1.upperRound as GslLiteMatchNode;
		const lsf2 = lqf2.upperRound as GslLiteMatchNode;

		return [uqf1, uqf2, uqf3, uqf4, usf1, usf2, lqf1, lqf2, lsf1, lsf2];
	}

	buildBracket(matchNodes: GslLiteMatchNode[]): void {
		const [uqf1, uqf2, uqf3, uqf4, usf1, usf2, lqf1, lqf2, lsf1, lsf2] = matchNodes;
		this.upperMatches = [uqf1, uqf2, uqf3, uqf4];
		this.lowerMatches = [lqf1, lqf2];

		uqf1.upperRound = usf1;
		uqf2.upperRound = usf1;

		uqf3.upperRound = usf2;
		uqf4.upperRound = usf2;

		lqf1.upperRound = lsf1;
		lqf2.upperRound = lsf2;

		uqf1.lowerRound = lqf1;
		uqf2.lowerRound = lqf1;

		uqf3.lowerRound = lqf2;
		uqf4.lowerRound = lqf2;

		usf1.lowerRound = lsf2;
		usf2.lowerRound = lsf1;
	}

	getPromoted(): (Seed | undefined)[] {
		const res: (Seed | undefined)[] = [];

		const upperSemiFinal1 = this.getBracketNode("UpperSemiFinal1");
		const upperSemiFinal1Seed = this.getSeedOrUndefined(upperSemiFinal1.matchRecord);

		const upperSemiFinal2 = this.getBracketNode("UpperSemiFinal2");
		const upperSemiFinal2Seed = this.getSeedOrUndefined(upperSemiFinal2.matchRecord);

		res.push(...this.chooseHigherSeedOrUndefined(upperSemiFinal1Seed, upperSemiFinal2Seed));

		const lowerSemiFinal1 = this.getBracketNode("LowerSemiFinal1");
		const lowerSemiFinal1Seed = this.getSeedOrUndefined(lowerSemiFinal1.matchRecord);

		const lowerSemiFinal2 = this.getBracketNode("LowerSemiFinal2");
		const lowerSemiFinal2Seed = this.getSeedOrUndefined(lowerSemiFinal2.matchRecord);

		res.push(...this.chooseHigherSeedOrUndefined(lowerSemiFinal1Seed, lowerSemiFinal2Seed));

		return res;
	}

	protected getSeedOrUndefined(matchRecord: MatchRecord | undefined) {
		let seed: Seed | undefined;
		switch (matchRecord?.type) {
			case "FullRecord": {
				if (isFilledMatch(matchRecord)) {
					seed = getWinner(matchRecord);
				}
				break;
			}
			default: {
				seed = undefined;
			}
		}
		return seed;
	}

	protected chooseHigherSeedOrUndefined(seed1: Seed | undefined, seed2: Seed | undefined) {
		const res: (Seed | undefined)[] = [];
		if (seed1 && seed2) {
			if (seed1 < seed2) {
				res.push(seed1);
				res.push(seed2);
			} else {
				res.push(seed2);
				res.push(seed1);
			}
		} else if (seed1) {
			res.push(seed1);
			res.push(seed2);
		} else {
			res.push(seed2);
			res.push(seed1);
		}
		return res;
	}
}