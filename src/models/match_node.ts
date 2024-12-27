import { Match } from "./match.ts";

export class MatchNode {
    name: string;
    match: Match;
    upperRound: MatchNode | undefined;
    lowerRound: MatchNode | undefined;
    
    constructor(name: string) {
        this.name = name;
        this.match = new Match(this.name, 0);
    }
}