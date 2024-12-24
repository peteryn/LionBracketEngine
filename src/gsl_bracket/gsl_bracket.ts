import { initializeEmptyMatches, SwissBracketData } from "../swiss_bracket/swiss_bracket_data.ts";
import { RoundNode } from "../models/round_node.ts";

export class GSL_Bracket {
	constructor() {
		const inter = new SwissBracketData(8, 2, "gsl");
		const upperFinals = new RoundNode("2-0", 2, 2, 2, 3);
		initializeEmptyMatches(upperFinals);
		const lowerFinals = new RoundNode("2-1", 2, 2, 1, 4);
		initializeEmptyMatches(lowerFinals);

		const round2Upper = inter.rootRound.winningRound!;
		const round3Middle = inter.rootRound.losingRound!.winningRound!;

		round2Upper.winningRound = upperFinals;
		round3Middle.winningRound = lowerFinals;
	}
}
