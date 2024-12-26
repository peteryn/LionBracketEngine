import { FlowBracket } from "../models/flow_bracket.ts";
import { RoundNode } from "../models/round_node.ts";
import { AFLBracket } from "./afl_bracket.ts";

export class AFLBracketFlow extends AFLBracket implements FlowBracket {
    updateRounds(rootRound: RoundNode): void {
        
    }
}