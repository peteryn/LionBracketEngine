import { Match, RoundNode } from "./models.ts";

export function SwissBracket(numTeams: number = 16, winRequirement: number = 3) {
	const root = new RoundNode("0-0", numTeams, 0, 0);
	let queue: RoundNode[] = [];
	queue.push(root);
	while (queue.length > 0) {
		const existingNodes: Map<string, RoundNode> = new Map();
		const newQueue: RoundNode[] = [];
		for (let i = 0; i < queue.length; i++) {
			const node = queue[i];
			// update winning child
			if (node.winRecord + 1 < winRequirement) {
				const winningNodeRecord = `${node.winRecord + 1}-${node.loseRecord}`;
				checkAndAddNode(existingNodes, winningNodeRecord, node, 1, 0);
				node.winningRound = existingNodes.get(winningNodeRecord);
			}
			// update losing child
			if (node.loseRecord + 1 < winRequirement) {
				const losingNodeRecord = `${node.winRecord}-${node.loseRecord + 1}`;
				checkAndAddNode(existingNodes, losingNodeRecord, node, 0, 1);
				node.losingRound = existingNodes.get(losingNodeRecord);
			}
		}
		existingNodes.forEach((value) => {
			newQueue.push(value);
		});
		queue = newQueue;
	}

	initializeEmptyMatches(root);
	console.log(root);
}

function initializeEmptyMatches(root: RoundNode): Map<string, Match> {
	const matches: Map<string, Match> = new Map();
	const init = (node: RoundNode) => {
		for (let index = 0; index < node.numTeams; index++) {
			const id = getMatchId(node, index);
			const match = new Match(id);
			matches.set(id, match);
			node.matches.push(match);
		}
	};
	levelOrderTraversal(root, init);
	return matches;
}

function getMatchId(node: RoundNode, index: number) {
	return `${node.name}.${index}`;
}

function printLevels(root: RoundNode) {
	const printLevel = (level: RoundNode[]) => {
		for (let index = 0; index < level.length; index++) {
			const element = level[index];
			console.log(element.toString());
		}
		console.log();
	};
	levelOrderTraversal(root, undefined, printLevel);
}

function makeFunctionCall(...args: any[]) {
	function interalFunctionCall(node: RoundNode) {}
	return interalFunctionCall;
}

// prints out swiss rounds level by level
// will print each RoundNode once
function levelOrderTraversal(
	root: RoundNode,
	perNodeCallBack?: (node: RoundNode) => void,
	perLevelCallBack?: (level: RoundNode[]) => void
) {
	let queue: RoundNode[] = [];
	const visited: string[] = [];
	queue.push(root);
	const levels = [];
	while (queue.length > 0) {
		const level: RoundNode[] = [];
		const newQueue: RoundNode[] = [];
		for (let i = 0; i < queue.length; i++) {
			const node = queue[i];

			if (!visited.includes(node.name)) {
				if (perNodeCallBack) {
					perNodeCallBack(node);
				}
				level.push(node);
				visited.push(node.name);
			}
			if (node.winningRound) {
				newQueue.push(node.winningRound);
			}
			if (node.losingRound) {
				newQueue.push(node.losingRound);
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

function checkAndAddNode(
	existingNodes: Map<string, RoundNode>,
	nodeRecord: string,
	parentNode: RoundNode,
	addWinRecord: number,
	addLoseRecord: number
) {
	const wNode = existingNodes.get(nodeRecord);
	if (wNode) {
		wNode.numTeams += parentNode.numTeams / 2;
		return false;
	} else {
		const newNode = new RoundNode(
			nodeRecord,
			parentNode.numTeams / 2,
			parentNode.winRecord + addWinRecord,
			parentNode.loseRecord + addLoseRecord
		);
		existingNodes.set(nodeRecord, newNode);
		return true;
	}
}
