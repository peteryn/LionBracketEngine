import { Bracket } from "../models/bracket.ts";
import { GenericMatchNode } from "../models/generic_match_node.ts";

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

}