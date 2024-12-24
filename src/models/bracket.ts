import { RoundNode } from "./round_node.ts";
import { MatchRecord } from "./match_record.ts";
import { levelOrderTraversal } from "../util/util.ts";

export abstract class Bracket {
	abstract rootRound: RoundNode;

	getRoundNode(roundNodeName: string): RoundNode {
		let roundNode: RoundNode | undefined = undefined;

		levelOrderTraversal(this.rootRound, (node: RoundNode) => {
			if (node.name === roundNodeName) {
				roundNode = node;
			}
		});
		if (roundNode === undefined) {
			throw new Error("invalid round node id");
		}
		return roundNode as RoundNode;
	}

	getMatch(matchId: string) {
		const [roundName, matchIndexString] = matchId.split(".");
		const matchIndex = parseInt(matchIndexString);
		const roundNode = this.getRoundNode(roundName);
		const matches = roundNode.matches;
		return matches[matchIndex];
	}

	getMatchRecordById(matchId: string): MatchRecord | undefined {
		const matchRecord = this.getMatch(matchId)?.matchRecord;
		if (!matchRecord) {
			return undefined;
		}
		return structuredClone(matchRecord);
	}

	getMatchRecord(roundName: string, matchNumber: number) {
		return this.getMatchRecordById(`${roundName}.${matchNumber}`);
	}

	setMatchRecord(roundName: string, matchNumber: number, matchRecord: MatchRecord): boolean {
		console.log("in abstract class");
		return this.setMatchRecordById(`${roundName}.${matchNumber}`, matchRecord);
	}

	setMatchRecordById(matchId: string, matchRecord: MatchRecord): boolean {
		const match = this.getMatch(matchId);
		if (match) {
			match.matchRecord = matchRecord;
			const roundNodeName = match.id.split(".")[0];
			const roundNode = this.getRoundNode(roundNodeName);
			if (roundNode) {
				// then traverse starting at that node do the traversal
				// with a callback that updates the next round
				// this.updateRounds(roundNode);
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
}
