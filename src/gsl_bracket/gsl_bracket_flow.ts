import { FlowBracket } from "../models/flow_bracket.ts";
import { RoundNode } from "../models/round_node.ts";
import { GSLBracket } from "./gsl_bracket.ts";

export class GSLBracketFlow extends GSLBracket implements FlowBracket {
    updateRounds(rootRound: RoundNode): void {
        
    }
}