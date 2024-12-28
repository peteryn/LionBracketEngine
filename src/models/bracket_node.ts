export interface BracketNode {
    name: string;
    upperRound: BracketNode | undefined;
    lowerRound: BracketNode | undefined;
}