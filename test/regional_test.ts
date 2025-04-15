import { assertEquals } from "@std/assert/equals";
import { RegionalTournament } from "../src/gsl_afl_bracket/regional_tournament.ts";

Deno.test(function upperSeedVictories() {
	const tournament = new RegionalTournament();
	tournament.updateFlow(0, "UpperQuarterFinal1", 1, 0);
	tournament.updateFlow(0, "UpperQuarterFinal2", 1, 0);
	tournament.updateFlow(0, "UpperQuarterFinal3", 1, 0);
	tournament.updateFlow(0, "UpperQuarterFinal4", 1, 0);

	tournament.updateFlow(0, "UpperSemiFinal1", 1, 0);
	tournament.updateFlow(0, "UpperSemiFinal2", 1, 0);

	tournament.updateFlow(0, "LowerQuarterFinal1", 1, 0);
	tournament.updateFlow(0, "LowerQuarterFinal2", 1, 0);

	tournament.updateFlow(0, "LowerSemiFinal1", 1, 0);
	tournament.updateFlow(0, "LowerSemiFinal2", 1, 0);

	tournament.updateFlow(0, "UpperFinal", 1, 0);
	tournament.updateFlow(0, "LowerFinal", 1, 0);

	const GSL_A_results = tournament.GSL_A.getPromoted();
	assertEquals(GSL_A_results[0], 1);
	assertEquals(GSL_A_results[1], 3);
	assertEquals(GSL_A_results[2], 5);
	assertEquals(GSL_A_results[3], 7);

    
});
