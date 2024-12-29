import { Bracket } from "../models/bracket.ts";
import { Match } from "../models/match.ts";
import { MatchNode } from "../models/match_node.ts";
import { MatchRecord } from "../models/match_record.ts";
import { postOrderTraversal } from "../util/util.ts";

export class AFLBracket implements Bracket<MatchNode> {
	rootRound: MatchNode;

	// by definition, there are 8 seeds for this bracket
	constructor() {
		this.rootRound = this.createTree();
	}

	getRoundNode(nodeName: string): MatchNode {
		let matchNode: MatchNode | undefined;
		postOrderTraversal(this.rootRound, (node: MatchNode) => {
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

	getMatchRecordById(matchId: string): MatchRecord | undefined {
		const matchRecord = this.getMatch(matchId)?.matchRecord;
		if (!matchRecord) {
			return undefined;
		}
		return structuredClone(matchRecord);
	}

	getMatchRecord(roundName: string, matchNumber: number): MatchRecord | undefined {
		return this.getMatchRecordById(`${roundName}.${matchNumber}`);
	}

	setMatchRecord(roundName: string, matchNumber: number, matchRecord: MatchRecord): boolean {
		return this.setMatchRecordById(`${roundName}.${matchNumber}`, matchRecord);
	}

	setMatchRecordById(matchId: string, matchRecord: MatchRecord): boolean {
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

	setMatchRecordWithValueById(
		matchId: string,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean {
		const mr = this.getMatchRecordById(matchId);
		if (!mr) {
			return false;
		}
		mr.upperSeedWins = upperSeedWins;
		mr.lowerSeedWins = lowerSeedWins;
		return this.setMatchRecordById(matchId, mr);
	}
	setMatchRecordWithValue(
		roundName: string,
		matchNumber: number,
		upperSeedWins: number,
		lowerSeedWins: number
	): boolean {
		return this.setMatchRecordWithValueById(
			`${roundName}.${matchNumber}`,
			upperSeedWins,
			lowerSeedWins
		);
	}

	private createTree(): MatchNode {
		const grandFinal = new MatchNode("grandFinal");

		const semiFinal1 = new MatchNode("semiFinal1");
		grandFinal.upperRound = semiFinal1;
		const semiFinal2 = new MatchNode("semiFinal2");
		grandFinal.lowerRound = semiFinal2;

		const upperQuarterFinal1 = new MatchNode("upperQuarterFinal1");
		semiFinal1.upperRound = upperQuarterFinal1;

		const upperQuarterFinal2 = new MatchNode("upperQuarterFinal2");
		semiFinal2.upperRound = upperQuarterFinal2;

		const lowerQuarterFinal1 = new MatchNode("lowerQuarterFinal1");
		semiFinal1.lowerRound = lowerQuarterFinal1;
		lowerQuarterFinal1.upperRound = upperQuarterFinal1;

		const lowerQuarterFinal2 = new MatchNode("lowerQuarterFinal2");
		semiFinal2.lowerRound = lowerQuarterFinal2;
		lowerQuarterFinal2.upperRound = upperQuarterFinal2;

		const lowerBracketRound1 = new MatchNode("lowerBracketRound1");
		lowerQuarterFinal1.lowerRound = lowerBracketRound1;

		const lowerBracketRound2 = new MatchNode("lowerBracketRound2");
		lowerQuarterFinal2.lowerRound = lowerBracketRound2;

		return grandFinal;
	}
}
