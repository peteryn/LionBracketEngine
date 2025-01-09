import { Bracket } from "../models/bracket.ts";
import { Match } from "../models/match.ts";
import { MatchNode } from "../models/match_node.ts";
import { MatchRecord } from "../models/match_record.ts";
import { levelOrderTraversal } from "../util/util.ts";

export class AFLBracket implements Bracket<MatchNode> {
	upperQuarterFinal1: MatchNode;
	upperQuarterFinal2: MatchNode;
	lowerBracketRound1: MatchNode;
	lowerBracketRound2: MatchNode;

	// by definition, there are 8 seeds for this bracket
	constructor() {
		[
			this.upperQuarterFinal1,
			this.upperQuarterFinal2,
			this.lowerBracketRound1,
			this.lowerBracketRound2,
		] = this.createTree();
	}

	getRoundNode(nodeName: string): MatchNode {
		if (this.upperQuarterFinal1.name === nodeName) {
			return this.upperQuarterFinal1;
		}
		if (this.upperQuarterFinal2.name === nodeName) {
			return this.upperQuarterFinal2;
		}

		let matchNode: MatchNode | undefined;
		levelOrderTraversal(this.lowerBracketRound1, (node) => {
			if (node.name === nodeName) {
				matchNode = node;
			}
		});
		levelOrderTraversal(this.lowerBracketRound2, (node) => {
			if (node.name === nodeName) {
				matchNode = node;
			}
		});
		return matchNode as MatchNode;
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

	private createTree(): MatchNode[] {
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
}
