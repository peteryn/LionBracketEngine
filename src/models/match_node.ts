import { BracketNode } from "./bracket_node.ts";
import { Match } from "./match.ts";

export class MatchNode implements BracketNode {
    name: string;
    match: Match;
    upperRound: MatchNode | undefined;
    lowerRound: MatchNode | undefined;
    isUpper: boolean;
    
    constructor(name: string, isUpper: boolean) {
        this.name = name;
        this.match = new Match(this.name, 0);
        this.isUpper = isUpper;
    }
}