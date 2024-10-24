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

	const a: string[] = [];
	const printNode = (node: RoundNode, s: string[]) => {
		s.push(node.name)
		console.log(node.name + s)
	}

	const simple = (node: RoundNode, s: string) => {
		console.log(`s is ${s}`);
	}

	console.log(`a: ${a}`);
	const b = "test";
	levelOrderTraversal(root, simple, b)

	const levels = levelOrderTraversal(root);
	for (let i = 0; i < levels.length; i++) {
		for (let j = 0; j < levels[i].length; j++) {
			console.log(levels[i][j].toString());
		}
		console.log("\n");
	}

	const myFunction =makeFunctionCall("test", "test2")
	levelOrderTraversal(root, myFunction);
}

function makeFunctionCall(...args: any[]) {
	function interalFunctionCall(node: RoundNode) {
		console.log(args[0])
		console.log(args[1])
	}
	return interalFunctionCall
}

// prints out swiss rounds level by level
// will print each RoundNode once
function levelOrderTraversal(root: RoundNode, callBack?: (node: RoundNode) => void,) {
	let queue: RoundNode[] = [];
	const visited: string[] = [];
	queue.push(root);
	const levels = [];
	while (queue.length > 0) {
		const level: RoundNode[] = [];
		const newQueue: RoundNode[] = [];
		for (let i = 0; i < queue.length; i++) {
			const node = queue[i];


			// if (visited.indexOf(node.name) == -1) {
			if (!visited.includes(node.name)) {
				if (callBack) {
					callBack(node);
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
