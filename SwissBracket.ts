import { RoundNode } from "./models.ts";

export function SwissBracket(numTeams: number = 16, winRequirement: number = 3) {
	const root = new RoundNode("r1", numTeams, 0, 0);
	let queue: RoundNode[] = [];
	queue.push(root);
	while (queue.length > 0) {
		const existingNodes: Map<string, RoundNode> = new Map();
		let maxWins = 0;
		const newQueue: RoundNode[] = [];
		for (let i = 0; i < queue.length; i++) {
			const node = queue[i];
			if (node) {
				const winningNodeRecord = `${node.winRecord + 1}-${node.loseRecord}`;
				const losingNodeRecord = `${node.winRecord}-${node.loseRecord + 1}`;

				checkAndAddNode(existingNodes, winningNodeRecord, node, 1, 0);
				checkAndAddNode(existingNodes, losingNodeRecord, node, 0, 1);

				node.winningRound = existingNodes.get(winningNodeRecord);
				node.losingRound = existingNodes.get(losingNodeRecord);

				if (node.winningRound) {
					newQueue.push(node.winningRound);
				}
				if (node.losingRound) {
					newQueue.push(node.losingRound);
				}
				maxWins = Math.max(maxWins, node.winRecord + 1);
			}
		}
		queue = newQueue;
		if (maxWins === winRequirement - 1) {
			break;
		}
	}

	levelOrderTraversal(root);
	console.log(root);
}

// prints out swiss rounds level by level
// currently prints "middle" rounds (rounds nodes that have 2 parents) twice
function levelOrderTraversal(root: RoundNode) {
	const queue: RoundNode[] = [];
	queue.push(root);
	while (queue.length > 0) {
		for (let i = 0; i < queue.length; i++) {
			const node = queue.shift();
			if (node) {
				console.log(node.toString());
				if (node.winningRound) {
					queue.push(node.winningRound);
				}
				if (node.losingRound) {
					queue.push(node.losingRound);
				}
			}
		}
	}
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
			"temp",
			parentNode.numTeams / 2,
			parentNode.winRecord + addWinRecord,
			parentNode.loseRecord + addLoseRecord
		);
		existingNodes.set(nodeRecord, newNode);
		return true;
	}
}
