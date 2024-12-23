import { RoundNode } from "./round_node.ts";
import { MatchRecord, Seed } from "./match_record.ts";
import { levelOrderTraversal } from "../swiss_bracket/swiss_bracket.ts";

export abstract class Bracket {
	abstract rootRound: RoundNode;

	abstract updateRounds(rootRound: RoundNode): void;

	abstract getMatchHistory(seed: Seed): MatchRecord[]

	abstract getPromotedSeeds(): Seed[];

	abstract getEliminatedSeeds(): Seed[];

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

	setMatchRecordById(matchId: string, matchRecord: MatchRecord): boolean {
		const match = this.getMatch(matchId);
		if (match) {
			match.matchRecord = matchRecord;
			const roundNodeName = match.id.split(".")[0];
			const roundNode = this.getRoundNode(roundNodeName);
			if (roundNode) {
				// then traverse starting at that node do the traversal
				// with a callback that updates the next round
				this.updateRounds(roundNode);
			}
			return true;
		}
		return false;
	}

	getMatchRecord(roundName: string, matchNumber: number) {
		return this.getMatchRecordById(`${roundName}.${matchNumber}`);
	}

	setMatchRecord(roundName: string, matchNumber: number, matchRecord: MatchRecord) {
		return this.setMatchRecordById(`${roundName}.${matchNumber}`, matchRecord);
	}

	setMatchRecordWithValueById(matchId: string, upperSeedWins: number, lowerSeedWins: number) {
		const mr = this.getMatchRecordById(matchId);
		if (!mr) {
			return undefined;
		}
		mr.upperSeedWins = upperSeedWins;
		mr.lowerSeedWins = lowerSeedWins;
		this.setMatchRecordById(matchId, mr);
	}

	setMatchRecordWithValue(
		roundName: string,
		matchNumber: number,
		upperSeedWins: number,
		lowerSeedWins: number
	) {
		this.setMatchRecordWithValueById(
			`${roundName}.${matchNumber}`,
			upperSeedWins,
			lowerSeedWins
		);
	}
}
