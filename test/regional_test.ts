import { assertEquals } from "@std/assert/equals";
import { RegionalTournament } from "../src/gsl_afl_bracket/regional_tournament.ts";
import { checkMatchNodeSeeds } from "./util/testFunctions.ts";

Deno.test(function upperSeedVictories() {
	const tournament = new RegionalTournament();

	tournament.GSL_A_updateFunction("UpperQuarterFinal1", 1, 0);
	tournament.GSL_A_updateFunction("UpperQuarterFinal2", 1, 0);
	tournament.GSL_A_updateFunction("UpperQuarterFinal3", 1, 0);
	tournament.GSL_A_updateFunction("UpperQuarterFinal4", 1, 0);

	tournament.GSL_A_updateFunction("UpperSemiFinal1", 1, 0);
	tournament.GSL_A_updateFunction("UpperSemiFinal2", 1, 0);

	tournament.GSL_A_updateFunction("LowerQuarterFinal1", 1, 0);
	tournament.GSL_A_updateFunction("LowerQuarterFinal2", 1, 0);

	tournament.GSL_A_updateFunction("LowerSemiFinal1", 1, 0);
	tournament.GSL_A_updateFunction("LowerSemiFinal2", 1, 0);

	tournament.GSL_A_updateFunction("UpperFinal", 1, 0);
	tournament.GSL_A_updateFunction("LowerFinal", 1, 0);

	const GSL_A_results = tournament.GSL_A.getPromoted();
	assertEquals(GSL_A_results[0], 1);
	assertEquals(GSL_A_results[1], 3);
	assertEquals(GSL_A_results[2], 5);
	assertEquals(GSL_A_results[3], 7);

	tournament.GSL_B_updateFunction("UpperQuarterFinal1", 1, 0);
	tournament.GSL_B_updateFunction("UpperQuarterFinal2", 1, 0);
	tournament.GSL_B_updateFunction("UpperQuarterFinal3", 1, 0);
	tournament.GSL_B_updateFunction("UpperQuarterFinal4", 1, 0);

	tournament.GSL_B_updateFunction("UpperSemiFinal1", 1, 0);
	tournament.GSL_B_updateFunction("UpperSemiFinal2", 1, 0);

	tournament.GSL_B_updateFunction("LowerQuarterFinal1", 1, 0);
	tournament.GSL_B_updateFunction("LowerQuarterFinal2", 1, 0);

	tournament.GSL_B_updateFunction("LowerSemiFinal1", 1, 0);
	tournament.GSL_B_updateFunction("LowerSemiFinal2", 1, 0);

	tournament.GSL_B_updateFunction("UpperFinal", 1, 0);
	tournament.GSL_B_updateFunction("LowerFinal", 1, 0);

	const GSL_B_results = tournament.GSL_B.getPromoted();
	assertEquals(GSL_B_results[0], 2);
	assertEquals(GSL_B_results[1], 4);
	assertEquals(GSL_B_results[2], 6);
	assertEquals(GSL_B_results[3], 8);

	checkMatchNodeSeeds(tournament.AFL, "UpperQuarterFinal1", 1, 4);
	checkMatchNodeSeeds(tournament.AFL, "UpperQuarterFinal2", 2, 3);

	checkMatchNodeSeeds(tournament.AFL, "LowerBracketRound1", 5, 8);
	checkMatchNodeSeeds(tournament.AFL, "LowerBracketRound2", 6, 7);
});
