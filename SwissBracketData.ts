import { Match, RoundNode, Team } from "./models.ts";
import { levelOrderTraversal, populateMatches } from "./SwissBracket.ts";

export class SwissBracketData {
	rootRound: RoundNode;
	teams: Team[];

	constructor(numTeams: number = 16, winRequirement: number = 3) {
		this.rootRound = this.createStructure(numTeams, winRequirement);
		this.initializeEmptyMatches(this.rootRound);
		this.teams = this.createTeams(numTeams);
		// populate root round with the teams in the correct matches
		const matchups = this.seedBasedMatchups(this.teams);
		populateMatches(this.rootRound.matches, matchups);
	}

	private createStructure(numTeams: number = 16, winRequirement: number = 3) {
		let level = 1;
		const root = new RoundNode("0-0", numTeams, 0, 0, level);
		level++;
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
			existingNodes.forEach((value) => {
				newQueue.push(value);
			});
			queue = newQueue;
			level++;
		}
		return root;
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
			wNode.numTeams += parentNode.numTeams / 2;
			wNode.has2Parents = true;
			return false;
		} else {
			const newNode = new RoundNode(
				nodeRecord,
				parentNode.numTeams / 2,
				parentNode.winRecord + addWinRecord,
				parentNode.loseRecord + addLoseRecord,
				level
			);
			existingNodes.set(nodeRecord, newNode);
			return true;
		}
	}

	private initializeEmptyMatches(root: RoundNode) {
		const init = (node: RoundNode) => {
			for (let index = 0; index < node.numTeams / 2; index++) {
				const match = new Match(node.name, index);
				node.matches.push(match);
			}
		};
		levelOrderTraversal(root, init);
	}

	private createTeams(numTeams: number): Team[] {
		const teams: Team[] = [];
		for (let index = 1; index <= numTeams; index++) {
			teams.push(new Team(index));
		}
		return teams;
	}

	private seedBasedMatchups(teams: Team[]) {
		const matchups: Team[][] = [];

		// implementation when round node has 1 parent
		let i = 0;
		let j = teams.length - 1;
		while (i < j) {
			matchups.push([teams[i], teams[j]]);
			i++;
			j--;
		}

		return matchups;
	}
}
