import { Bracket } from "../models/bracket.ts";
import { Match } from "../models/match.ts";
import { MatchNode } from "../models/match_node.ts";
import { FullRecordFactory, MatchRecord, Seed } from "../models/match_record.ts";
import { getLoser, getWinner, isFilledMatch, levelOrderTraversal } from "../util/util.ts";
import { EliminationBracket } from "../models/EliminationBracket.ts";

export class GSLBracket implements Bracket<MatchNode> {
	upperMatches: MatchNode[] = [];
	lowerMatches: MatchNode[] = [];
	eliminationBracket: EliminationBracket;

	constructor(seeds?: Seed[]) {
		[this.upperMatches, this.lowerMatches] = GSLBracket.createGSLBracket();
		this.eliminationBracket = new EliminationBracket();

		if (!seeds) {
			this.upperMatches[0].match.matchRecord = FullRecordFactory(1, 8);
			this.upperMatches[1].match.matchRecord = FullRecordFactory(4, 5);
			this.upperMatches[2].match.matchRecord = FullRecordFactory(2, 7);
			this.upperMatches[3].match.matchRecord = FullRecordFactory(3, 6);
		} else {
			this.upperMatches[0].match.matchRecord = FullRecordFactory(seeds[0], seeds[7]);
			this.upperMatches[1].match.matchRecord = FullRecordFactory(seeds[3], seeds[4]);
			this.upperMatches[2].match.matchRecord = FullRecordFactory(seeds[1], seeds[6]);
			this.upperMatches[3].match.matchRecord = FullRecordFactory(seeds[2], seeds[5]);
		}
	}

	static createGSLBracket() {
		const upperMatches: MatchNode[] = [];
		const lowerMatches: MatchNode[] = [];

		upperMatches.push(new MatchNode("UpperQuarterFinal1", true));
		upperMatches.push(new MatchNode("UpperQuarterFinal2", false));
		upperMatches.push(new MatchNode("UpperQuarterFinal3", true));
		upperMatches.push(new MatchNode("UpperQuarterFinal4", false));

		const upperSemiFinal1 = new MatchNode("UpperSemiFinal1", true);
		upperMatches[0].upperRound = upperSemiFinal1;
		upperMatches[1].upperRound = upperSemiFinal1;

		const upperSemiFinal2 = new MatchNode("UpperSemiFinal2", false);
		upperMatches[2].upperRound = upperSemiFinal2;
		upperMatches[3].upperRound = upperSemiFinal2;

		const upperFinal = new MatchNode("UpperFinal", true);
		upperSemiFinal1.upperRound = upperFinal;
		upperSemiFinal2.upperRound = upperFinal;

		lowerMatches.push(new MatchNode("LowerQuarterFinal1", false));
		lowerMatches.push(new MatchNode("LowerQuarterFinal2", false));

		const lowerSemiFinal1 = new MatchNode("LowerSemiFinal1", true);
		lowerMatches[0].upperRound = lowerSemiFinal1;

		const lowerSemiFinal2 = new MatchNode("LowerSemiFinal2", false);
		lowerMatches[1].upperRound = lowerSemiFinal2;

		const lowerFinal = new MatchNode("LowerFinal", true);
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
		const usf1 = uqf1.upperRound as MatchNode;
		const usf2 = uqf3.upperRound as MatchNode;
		const uf = usf1.upperRound as MatchNode;

		const lqf1 = this.lowerMatches[0];
		const lqf2 = this.lowerMatches[1];
		const lsf1 = lqf1.upperRound as MatchNode;
		const lsf2 = lqf2.upperRound as MatchNode;
		const lf = lsf1.upperRound as MatchNode;

		return [uqf1, uqf2, uqf3, uqf4, usf1, usf2, uf, lqf1, lqf2, lsf1, lsf2, lf];
	}

	getBracketNode(nodeName: string): MatchNode {
		for (const node of this.upperMatches) {
			if (node.name === nodeName) {
				return node;
			}
		}
		for (const node of this.lowerMatches) {
			if (node.name === nodeName) {
				return node;
			}
		}
		let resultNode: MatchNode | undefined;
		levelOrderTraversal(this.upperMatches[0], (node) => {
			if (node.name === nodeName) {
				resultNode = node;
			}
		});
		levelOrderTraversal(this.upperMatches[2], (node) => {
			if (node.name === nodeName) {
				resultNode = node;
			}
		});
		levelOrderTraversal(this.lowerMatches[0], (node) => {
			if (node.name === nodeName) {
				resultNode = node;
			}
		});
		levelOrderTraversal(this.lowerMatches[1], (node) => {
			if (node.name === nodeName) {
				resultNode = node;
			}
		});
		return resultNode as MatchNode;
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

	getPromoted(): (Seed | undefined)[] {
		const res: (Seed | undefined)[] = [];
		const upperFinal = this.getBracketNode("UpperFinal");
		if (isFilledMatch(upperFinal.match)) {
			res.push(getWinner(upperFinal.match));
			res.push(getLoser(upperFinal.match));
		} else {
			res.push(undefined);
			res.push(undefined);
		}
		const lowerFinal = this.getBracketNode("LowerFinal");
		if (isFilledMatch(lowerFinal.match)) {
			res.push(getWinner(lowerFinal.match));
			res.push(getLoser(lowerFinal.match));
		} else {
			res.push(undefined);
			res.push(undefined);
		}
		return res;
	}
}
