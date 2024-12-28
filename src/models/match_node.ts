import { BracketNode } from "./bracket_node.ts";
import { Match } from "./match.ts";

export class MatchNode implements BracketNode {
    name: string;
    match: Match;
    upperRound: MatchNode | undefined;
    lowerRound: MatchNode | undefined;
    
    constructor(name: string) {
        this.name = name;
        this.match = new Match(this.name, 0);
    }
}