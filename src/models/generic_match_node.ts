import { BracketNode } from "./bracket_node.ts";
import { MatchRecord } from "./match_record.ts";

export class GenericMatchNode<NodeNames extends string> implements BracketNode {
	lowerRound: GenericMatchNode<NodeNames> | undefined;
	upperRound: GenericMatchNode<NodeNames> | undefined;
	name: NodeNames;
	matchRecord: MatchRecord | undefined;
	isUpper: boolean;

	constructor(name: NodeNames, isUpper: boolean) {
		this.name = name;
		this.isUpper = isUpper;
	}
}
