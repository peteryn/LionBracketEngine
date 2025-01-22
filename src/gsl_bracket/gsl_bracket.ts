import { Bracket } from "../models/bracket.ts";
import { Match } from "../models/match.ts";
import { MatchNode } from "../models/match_node.ts";
import { MatchRecord } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import { levelOrderTraversal } from "../util/util.ts";

export class GSLBracket implements Bracket<MatchNode> {
	upperMatches: MatchNode[] = [];
	lowerMatches: MatchNode[] = [];

	constructor() {
		this.upperMatches.push(new MatchNode("UpperQuarterFinal1", true));
		this.upperMatches.push(new MatchNode("UpperQuarterFinal2", false));
		this.upperMatches.push(new MatchNode("UpperQuarterFinal3", true));
		this.upperMatches.push(new MatchNode("UpperQuarterFinal4", false));

		const upperSemiFinal1 = new MatchNode("UpperSemiFinal1", true);
		this.upperMatches[0].upperRound = upperSemiFinal1;
		this.upperMatches[1].upperRound = upperSemiFinal1;

		const upperSemiFinal2 = new MatchNode("UpperSemiFinal2", false);
		this.upperMatches[2].upperRound = upperSemiFinal2;
		this.upperMatches[3].upperRound = upperSemiFinal2;

		const upperFinal = new MatchNode("UpperFinal", true);
		upperSemiFinal1.upperRound = upperFinal;
		upperSemiFinal2.upperRound = upperFinal;

		this.lowerMatches.push(new MatchNode("LowerQuarterFinal5", false));
		this.lowerMatches.push(new MatchNode("LowerQuarterFinal6", false));

		const lowerSemiFinal1 = new MatchNode("LowerSemiFinal1", true);
		this.lowerMatches[0].upperRound = lowerSemiFinal1;

		const lowerSemiFinal2 = new MatchNode("LowerSemiFinal2", false);
		this.lowerMatches[1].upperRound = lowerSemiFinal2;

		const lowerFinal = new MatchNode("LowerFinal", true);
		lowerSemiFinal1.upperRound = lowerFinal;
		lowerSemiFinal2.upperRound = lowerFinal;

		this.upperMatches[0].lowerRound = this.lowerMatches[0];
		this.upperMatches[1].lowerRound = this.lowerMatches[0];

		this.upperMatches[2].lowerRound = this.lowerMatches[1];
		this.upperMatches[3].lowerRound = this.lowerMatches[1];

		upperSemiFinal1.lowerRound = lowerSemiFinal2;
		upperSemiFinal2.lowerRound = lowerSemiFinal1;
	}

	getRoundNode(nodeName: string): MatchNode {
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
		const matchNode = this.getRoundNode(roundName);
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
			const matchNode = this.getRoundNode(matchNodeName);
			if (matchNode) {
				return true;
			}
		}
		return false;
	}

	setMatchRecordWithValue(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
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
}
