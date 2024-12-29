import { Bracket } from "../models/bracket.ts";
import { BracketNode } from "../models/bracket_node.ts";
import { Seed, MatchRecord } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import { initializeEmptyMatches, levelOrderTraversal, populateMatches } from "../util/util.ts";

export class SwissBracket implements Bracket<RoundNode> {
	rootRound: RoundNode;

	constructor(numSeeds: number = 16, winRequirement: number = 3) {
		this.rootRound = this.createStructure(numSeeds, winRequirement);
		initializeEmptyMatches(this.rootRound);
	}

	getRoundNode(nodeName: string): RoundNode {
		let roundNode: RoundNode | undefined = undefined;
		levelOrderTraversal(this.rootRound, (node: RoundNode) => {
			if (node.name === nodeName) {
				roundNode = node;
			}
		});
		if (roundNode === undefined) {
			throw new Error("invalid round node id");
		}
		return roundNode;
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
		// console.log("in abstract class");
		return this.setMatchRecordById(`${roundName}.${matchNumber}`, matchRecord);
	}

	setMatchRecordById(matchId: string, matchRecord: MatchRecord): boolean {
		const match = this.getMatch(matchId);
		if (match) {
			match.matchRecord = matchRecord;
			const roundNodeName = match.id.split(".")[0];
			const roundNode = this.getRoundNode(roundNodeName);
			if (roundNode) {
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

	private createStructure(numSeeds: number = 16, winRequirement: number = 3) {
		let level = 1;
		const root = new RoundNode("0-0", numSeeds, 0, 0, level);
		level++;
		let queue: RoundNode[] = [];
		queue.push(root);
		while (queue.length > 0) {
			const existingNodes: Map<string, RoundNode> = new Map();
			const newQueue: RoundNode[] = [];
			for (let i = 0; i < queue.length; i++) {
				const node = queue[i];
				this.processNode(node, winRequirement, existingNodes, level);
			}
			existingNodes.forEach((value) => {
				newQueue.push(value);
			});
			queue = newQueue;
			level++;
		}
		return root;
	}

	private processNode(
		node: RoundNode,
		winRequirement: number,
		existingNodes: Map<string, RoundNode>,
		level: number
	) {
		// update winning child
		if (node.winRecord + 1 < winRequirement) {
			const winningNodeRecord = `${node.winRecord + 1}-${node.loseRecord}`;
			this.checkAndAddNode(existingNodes, winningNodeRecord, node, 1, 0, level);
			node.upperRound = existingNodes.get(winningNodeRecord);
		}
		// update losing child
		if (node.loseRecord + 1 < winRequirement) {
			const losingNodeRecord = `${node.winRecord}-${node.loseRecord + 1}`;
			this.checkAndAddNode(existingNodes, losingNodeRecord, node, 0, 1, level);
			node.lowerRound = existingNodes.get(losingNodeRecord);
		}
	}

	private checkAndAddNode(
		existingNodes: Map<string, RoundNode>,
		nodeRecord: string,
		parentNode: RoundNode,
		addWinRecord: number,
		addLoseRecord: number,
		level: number
	) {
		const wNode = existingNodes.get(nodeRecord);
		if (wNode) {
			wNode.numSeeds += parentNode.numSeeds / 2;
			wNode.has2Parents = true;
			return false;
		} else {
			const newNode = new RoundNode(
				nodeRecord,
				parentNode.numSeeds / 2,
				parentNode.winRecord + addWinRecord,
				parentNode.loseRecord + addLoseRecord,
				level
			);
			existingNodes.set(nodeRecord, newNode);
			return true;
		}
	}

	private createSeeds(numSeeds: number): Seed[] {
		const seeds: Seed[] = [];
		for (let index = 1; index <= numSeeds; index++) {
			seeds.push(index);
		}
		return seeds;
	}

	private seedBasedMatchups(seeds: Seed[]) {
		const matchups: Seed[][] = [];

		// implementation when round node has 1 parent
		let i = 0;
		let j = seeds.length - 1;
		while (i < j) {
			matchups.push([seeds[i], seeds[j]]);
			i++;
			j--;
		}

		return matchups;
	}
}
