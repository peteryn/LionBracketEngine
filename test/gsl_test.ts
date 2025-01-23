import { assertEquals } from "@std/assert/equals";
import { GSLBracketFlow } from "../src/gsl_bracket/gsl_bracket_flow.ts";
import { FullRecord, UpperRecord } from "../src/models/match_record.ts";

Deno.test(function gslTest1() {
	const gslBracket = new GSLBracketFlow();
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	gslBracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);

	const upperSemiFinal1 = gslBracket.getRoundNode("UpperSemiFinal1");
	assertEquals(upperSemiFinal1.match.matchRecord?.type, "FullRecord");
	const uSFMR = upperSemiFinal1.match.matchRecord as FullRecord;
	assertEquals(uSFMR.upperSeed, 1);
	assertEquals(uSFMR.lowerSeed, 3);
});
