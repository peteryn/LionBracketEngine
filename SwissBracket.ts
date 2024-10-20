import { RoundNode } from "./models.ts";

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

	levelOrderTraversal(root);
}

// prints out swiss rounds level by level
// will print each RoundNode once
function levelOrderTraversal(root: RoundNode) {
	const queue: RoundNode[] = [];
	const visited: string[] = [];
	queue.push(root);
	while (queue.length > 0) {
		for (let i = 0; i < queue.length; i++) {
			const node = queue.shift();
			if (node) {
				if (visited.indexOf(node.name) == -1) {
					console.log(node.toString());
					visited.push(node.name);
				}
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
			nodeRecord,
			parentNode.numTeams / 2,
			parentNode.winRecord + addWinRecord,
			parentNode.loseRecord + addLoseRecord
		);
		existingNodes.set(nodeRecord, newNode);
		return true;
	}
}
