import { Bracket } from "../models/bracket.ts";
import { GenericMatchNode } from "../models/generic_match_node.ts";
import { MatchRecord } from "../models/match_record.ts";

export const TOP_8_SINGLE_ELIMINATION = [
	"GrandFinal",
	"SemiFinal1",
	"SemiFinal2",
	"QuarterFinal1",
	"QuarterFinal2",
	"QuarterFinal3",
	"QuarterFinal4"
] as const;

export type Top8SingleElimination = typeof TOP_8_SINGLE_ELIMINATION[number];
export type Top8SingleEliminationMatchNode = GenericMatchNode<Top8SingleElimination>;

export class SingleEliminationBracket implements Bracket<Top8SingleElimination> {
	grandFinal: Top8SingleEliminationMatchNode;

	constructor() {
		this.grandFinal = this.createTree();
	}

	getBracketNode(nodeName: Top8SingleElimination): Top8SingleEliminationMatchNode {
		throw new Error("Method not implemented.");
	}
	getMatchRecord(nodeName: Top8SingleElimination): MatchRecord | undefined {
		throw new Error("Method not implemented.");
	}
	setMatchRecord(nodeName: Top8SingleElimination, matchRecord: MatchRecord): void {
		throw new Error("Method not implemented.");
	}
	setMatchRecordWithValue(nodeName: Top8SingleElimination, upperSeedWins: number, lowerSeedWins: number): boolean {
		throw new Error("Method not implemented.");
	}
	updateFlow(root: Top8SingleEliminationMatchNode): void {
		throw new Error("Method not implemented.");
	}
	getAllMatchNodes(): Top8SingleEliminationMatchNode[] {
		throw new Error("Method not implemented.");
	}
	buildBracket(matchNodes: Top8SingleEliminationMatchNode[]): void {
		throw new Error("Method not implemented.");
	}

	private createTree(): Top8SingleEliminationMatchNode {
		const grandFinal = new GenericMatchNode<Top8SingleElimination>("GrandFinal", false);

		const semiFinal1 = new GenericMatchNode<Top8SingleElimination>("SemiFinal1", true);
		const semiFinal2 = new GenericMatchNode<Top8SingleElimination>("SemiFinal2", false);

		const quarterFinal1 = new GenericMatchNode<Top8SingleElimination>("QuarterFinal1", true);
		const quarterFinal2 = new GenericMatchNode<Top8SingleElimination>("QuarterFinal2", false);
		const quarterFinal3 = new GenericMatchNode<Top8SingleElimination>("QuarterFinal3", true);
		const quarterFinal4 = new GenericMatchNode<Top8SingleElimination>("QuarterFinal4", false);

		quarterFinal1.upperRound = semiFinal1;
		semiFinal1.upperRound = grandFinal;

		quarterFinal2.upperRound = semiFinal1;
		
		quarterFinal3.upperRound = semiFinal2;
		semiFinal2.upperRound = grandFinal;

		quarterFinal4.upperRound = semiFinal2;

		return grandFinal;
	}
}