import { assertEquals } from "@std/assert/equals";
import { GSLBracketFlow } from "../src/gsl_bracket/gsl_bracket_flow.ts";
import { FullRecord } from "../src/models/match_record.ts";

Deno.test(function gslTest1() {
	const gslBracket = new GSLBracketFlow();
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal3", 1, 0);
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal4", 1, 0);

	const upperSemiFinal1 = gslBracket.getBracketNode("UpperSemiFinal1");
	assertEquals(upperSemiFinal1.match.matchRecord?.type, "FullRecord");
	const uSF1MR = upperSemiFinal1.match.matchRecord as FullRecord;
	assertEquals(uSF1MR.upperSeed, 1);
	assertEquals(uSF1MR.lowerSeed, 4);

	const upperSemiFinal2 = gslBracket.getBracketNode("UpperSemiFinal2");
	assertEquals(upperSemiFinal2.match.matchRecord?.type, "FullRecord");
	const uSF2MR = upperSemiFinal2.match.matchRecord as FullRecord;
	assertEquals(uSF2MR.upperSeed, 2);
	assertEquals(uSF2MR.lowerSeed, 3);

	const LowerQuarterFinal1 = gslBracket.getBracketNode("LowerQuarterFinal1");
	assertEquals(LowerQuarterFinal1.match.matchRecord?.type, "FullRecord");
	const lQF1MR = LowerQuarterFinal1.match.matchRecord as FullRecord;
	assertEquals(lQF1MR.upperSeed, 8);
	assertEquals(lQF1MR.lowerSeed, 5);

	const LowerQuarterFinal2 = gslBracket.getBracketNode("LowerQuarterFinal2");
	assertEquals(LowerQuarterFinal2.match.matchRecord?.type, "FullRecord");
	const lQF2MR = LowerQuarterFinal2.match.matchRecord as FullRecord;
	assertEquals(lQF2MR.upperSeed, 7);
	assertEquals(lQF2MR.lowerSeed, 6);
});
