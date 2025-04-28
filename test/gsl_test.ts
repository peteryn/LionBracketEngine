import { assertEquals } from "@std/assert/equals";
import { GslBracket } from "../src/gsl_bracket/gsl_bracket.ts";
import { checkMatchNodeSeeds } from "./util/testFunctions.ts";
import { GslLiteBracket } from "../src/gsl_bracket/gsl_lite_bracket.ts";

Deno.test(function gslTest1() {
	const gslBracket = new GslBracket();
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal3", 1, 0);
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal4", 1, 0);

	checkMatchNodeSeeds(gslBracket, "UpperSemiFinal1", 1, 4);
	checkMatchNodeSeeds(gslBracket, "UpperSemiFinal2", 2, 3);
	checkMatchNodeSeeds(gslBracket, "LowerQuarterFinal1", 8, 5);
	checkMatchNodeSeeds(gslBracket, "LowerQuarterFinal2", 7, 6);

	gslBracket.setMatchRecordAndFlow("UpperSemiFinal1", 1, 0);
	gslBracket.setMatchRecordAndFlow("UpperSemiFinal2", 1, 0);

	checkMatchNodeSeeds(gslBracket, "UpperFinal", 1, 2);

	gslBracket.setMatchRecordAndFlow("LowerQuarterFinal1", 1, 0);
	gslBracket.setMatchRecordAndFlow("LowerQuarterFinal2", 1, 0);

	checkMatchNodeSeeds(gslBracket, "LowerSemiFinal1", 3, 8);
	checkMatchNodeSeeds(gslBracket, "LowerSemiFinal2", 4, 7);

	gslBracket.setMatchRecordAndFlow("LowerSemiFinal1", 1, 0);
	gslBracket.setMatchRecordAndFlow("LowerSemiFinal2", 1, 0);

	checkMatchNodeSeeds(gslBracket, "LowerFinal", 3, 4);

	gslBracket.setMatchRecordAndFlow("UpperFinal", 1, 0);
	gslBracket.setMatchRecordAndFlow("LowerFinal", 1, 0);

	const promotedSeeds = gslBracket.getPromoted();

	assertEquals(promotedSeeds[0], 1);
	assertEquals(promotedSeeds[1], 2);
	assertEquals(promotedSeeds[2], 3);
	assertEquals(promotedSeeds[3], 4);
});

Deno.test(function gslLiteBracket() {
	const gsl = new GslLiteBracket();
	gsl.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	gsl.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	gsl.setMatchRecordAndFlow("UpperQuarterFinal3", 1, 0);
	gsl.setMatchRecordAndFlow("UpperQuarterFinal4", 1, 0);

	checkMatchNodeSeeds(gsl, "UpperSemiFinal1", 1, 4);
	checkMatchNodeSeeds(gsl, "UpperSemiFinal2", 2, 3);
	checkMatchNodeSeeds(gsl, "LowerQuarterFinal1", 8, 5);
	checkMatchNodeSeeds(gsl, "LowerQuarterFinal2", 7, 6);

	gsl.setMatchRecordAndFlow("UpperSemiFinal1", 1, 0);
	gsl.setMatchRecordAndFlow("UpperSemiFinal2", 1, 0);

	gsl.setMatchRecordAndFlow("LowerQuarterFinal1", 1, 0);
	gsl.setMatchRecordAndFlow("LowerQuarterFinal2", 1, 0);

	checkMatchNodeSeeds(gsl, "LowerSemiFinal1", 3, 8);
	checkMatchNodeSeeds(gsl, "LowerSemiFinal2", 4, 7);

	gsl.setMatchRecordAndFlow("LowerSemiFinal1", 1, 0);
	gsl.setMatchRecordAndFlow("LowerSemiFinal2", 1, 0);

	const promotedSeeds = gsl.getPromoted();
	assertEquals(promotedSeeds[0], 1);
	assertEquals(promotedSeeds[1], 2);
	assertEquals(promotedSeeds[2], 3);
	assertEquals(promotedSeeds[3], 4);
	console.log(promotedSeeds);
});
