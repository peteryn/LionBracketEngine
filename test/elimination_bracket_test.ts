import { assertEquals } from "@std/assert/equals";
import { AflBracket } from "../src/afl_bracket/afl_bracket.ts";
import {
	checkForLowerRecordSeed,
	checkForUpperRecordSeed,
	checkMatchNodeSeeds,
} from "./util/testFunctions.ts";
import { UpperRecord } from "../src/models/match_record.ts";

Deno.test(function futureMatchesShouldBeClearedWhenLowerBracketRound1IsTied() {
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerBracketRound1", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerBracketRound2", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerQuarterFinal1", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerQuarterFinal2", 1, 0);
	aflBracket.setMatchRecordAndFlow("SemiFinal1", 1, 0);
	aflBracket.setMatchRecordAndFlow("SemiFinal2", 1, 0);

	checkMatchNodeSeeds(aflBracket, "GrandFinal", 2, 1);
	aflBracket.setMatchRecordAndFlow("LowerBracketRound1", 1, 1);
	const lqf1 = aflBracket.getBracketNode("LowerQuarterFinal1");
	assertEquals(lqf1.matchRecord?.type, "UpperRecord");
	const lqf1MR = lqf1.matchRecord as UpperRecord;
	assertEquals(lqf1MR.upperSeed, 4);

	checkForUpperRecordSeed(aflBracket, "SemiFinal1", 2);
	checkForLowerRecordSeed(aflBracket, "GrandFinal", 1);
});
