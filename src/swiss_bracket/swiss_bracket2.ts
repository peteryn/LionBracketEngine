import { Bracket } from "../models/bracket.ts";
import { Seed, MatchRecord } from "../models/match_record.ts";
import { RoundNode } from "../models/round_node.ts";

export class SwissBracket2 extends Bracket {
    rootRound: RoundNode;

    constructor(
		numSeeds: number = 16,
		winRequirement: number = 3,
		bracketId: string
	) {
        super();
		this.rootRound = new RoundNode("test", 1, 1, 1, 1);
	}

    override updateRounds(rootRound: RoundNode): void {
        
    }

    override getMatchHistory(seed: Seed): MatchRecord[] {
        return []; 
    }

    override getPromotedSeeds(): Seed[] {
        return [];
    }

    override getEliminatedSeeds(): Seed[] {
        return []
    }
}