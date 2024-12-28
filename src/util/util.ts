import { Node } from "jsr:@b-fuze/deno-dom@~0.1.48";
import { BracketNode } from "../models/bracket_node.ts";
import { Match } from "../models/match.ts";
import { MatchNode } from "../models/match_node.ts";
import { type Seed, MatchRecord } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";

export function cartesianProduct<Type>(a: Type[], b: Type[]) {
	return a.flatMap((x) => b.map((y) => [x, y]));
}

export function isFilledRound(matches: Match[]): boolean {
	for (let index = 0; index < matches.length; index++) {
		const matchRecord = matches[index].matchRecord;
		if (matchRecord) {
			const isFilledOut = matchRecord.upperSeedWins - matchRecord.lowerSeedWins !== 0;
			if (!isFilledOut) {
				return false;
			}
		}
	}
	return true;
}

export function getWinners(matches: Match[]) {
	const result: Seed[] = [];

	for (let index = 0; index < matches.length; index++) {
		const match = matches[index];
		if (match.matchRecord) {
			const mr = match.matchRecord;
			if (mr.upperSeedWins > mr.lowerSeedWins) {
				result.push(mr.upperSeed);
			} else if (mr.lowerSeedWins > mr.upperSeedWins) {
				result.push(mr.lowerSeed);
			}
		}
	}

	return result;
}

export function getLosers(matches: Match[]) {
	const result: Seed[] = [];

	for (let index = 0; index < matches.length; index++) {
		const match = matches[index];
		if (match.matchRecord) {
			const mr = match.matchRecord;
			if (mr.upperSeedWins < mr.lowerSeedWins) {
				result.push(mr.upperSeed);
			} else if (mr.lowerSeedWins < mr.upperSeedWins) {
				result.push(mr.lowerSeed);
			}
		}
	}

	return result;
}

export function populateMatches(matches: Match[], seeds: Seed[][]) {
	if (seeds.length !== matches.length) {
		throw new Error(
			`There must twice as many teams as matches. matches.length=${matches.length}, teams.length=${seeds.length}`
		);
	}

	for (let index = 0; index < seeds.length; index++) {
		const matchup = seeds[index];
		const seed1 = matchup[0];
		const seed2 = matchup[1];
		const record = new MatchRecord(seed1, seed2);
		matches[index].matchRecord = record;
	}
}

export function initializeEmptyMatches(root: RoundNode) {
	const init = (node: RoundNode) => {
		for (let index = 0; index < node.numSeeds / 2; index++) {
			const match = new Match(node.name, index);
			node.matches.push(match);
		}
	};
	levelOrderTraversal(root, init);
}

export function createSeeds(numSeeds: number): Seed[] {
	return Array.from({ length: numSeeds }, (_, index) => index + 1);
}

export function seedBasedMatchups(seeds: Seed[]) {
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

export function levelOrderTraversal<NodeType extends BracketNode>(
	root: NodeType,
	perNodeCallBack?: (node: NodeType) => void,
	perLevelCallBack?: (level: NodeType[]) => void
) {
	let queue: NodeType[] = [];
	const visited: string[] = [];
	queue.push(root);
	const levels = [];
	while (queue.length > 0) {
		const level: NodeType[] = [];
		const newQueue: NodeType[] = [];
		for (let i = 0; i < queue.length; i++) {
			const node = queue[i];

			if (!visited.includes(node.name)) {
				if (perNodeCallBack) {
					perNodeCallBack(node);
				}
				level.push(node);
				visited.push(node.name);
			}
			if (node.upperRound) {
				newQueue.push(node.upperRound as NodeType);
			}
			if (node.lowerRound) {
				newQueue.push(node.lowerRound as NodeType);
			}
		}
		queue = newQueue;
		if (perLevelCallBack) {
			perLevelCallBack(level);
		}
		levels.push(level);
	}
	return levels;
}

export function postOrderTraversal<NodeType extends BracketNode>(
	root: NodeType | undefined,
	perNodeCallBack?: (node: NodeType) => void,
	visited?: Set<string> | undefined
) {
	if (!visited) {
		visited = new Set();
	}
	if (!root) {
		return;
	}

	postOrderTraversal(root.upperRound as NodeType, perNodeCallBack, visited);
	postOrderTraversal(root.lowerRound as NodeType, perNodeCallBack, visited);

	if (visited.has(root.name) || !perNodeCallBack) {
		return;
	}

	perNodeCallBack(root);
	visited.add(root.name);
}
