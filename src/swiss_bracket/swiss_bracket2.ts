import { Bracket } from "../models/bracket.ts";
import { Seed } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";
import { initializeEmptyMatches, populateMatches } from "../util/util.ts";

export class SwissBracket2 extends Bracket {
	rootRound: RoundNode;

	constructor(numSeeds: number = 16, winRequirement: number = 3) {
		super();
		this.rootRound = this.createStructure(numSeeds, winRequirement);
		initializeEmptyMatches(this.rootRound);
		// const seeds = this.createSeeds(numSeeds);
		// populate root round with the seeds in the correct matches
		// const matchups = this.seedBasedMatchups(seeds);
		// populateMatches(this.rootRound.matches, matchups);
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

	private processNode(node: RoundNode, winRequirement: number, existingNodes: Map<string, RoundNode>, level: number) {
		// update winning child
		if (node.winRecord + 1 < winRequirement) {
			const winningNodeRecord = `${node.winRecord + 1}-${node.loseRecord}`;
			this.checkAndAddNode(existingNodes, winningNodeRecord, node, 1, 0, level);
			node.winningRound = existingNodes.get(winningNodeRecord);
		}
		// update losing child
		if (node.loseRecord + 1 < winRequirement) {
			const losingNodeRecord = `${node.winRecord}-${node.loseRecord + 1}`;
			this.checkAndAddNode(existingNodes, losingNodeRecord, node, 0, 1, level);
			node.losingRound = existingNodes.get(losingNodeRecord);
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
