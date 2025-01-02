import { AFLBracket } from "../src/afl_bracket/afl_bracket.ts";
import { assertEquals } from "@std/assert/equals";
import { SwissBracket } from "../src/swiss_bracket/swiss_bracket.ts";
import { MatchNode } from "../src/models/match_node.ts";
import { RoundNode } from "../src/models/round_node.ts";
import { AFLBracketFlow } from "../src/afl_bracket/afl_bracket_flow.ts";
import { FullRecord, LowerRecord, UpperRecord } from "../src/models/match_record.ts";

Deno.test(function aflStructureTest() {});

Deno.test(function genericsTest() {
	const afl_bracket = new AFLBracket();
	const matchNode = afl_bracket.getRoundNode("grandFinal");
	assertEquals(matchNode instanceof MatchNode, true, "grandFinal is not of type matchNode");

	const swiss_bracket = new SwissBracket();
	const roundNode = swiss_bracket.getRoundNode("0-0");
	assertEquals(roundNode instanceof RoundNode, true, "swissRound is not of type roundNode");
});

Deno.test(function updateTest1() {
	const aflBracket = new AFLBracketFlow();
	aflBracket.setMatchRecordWithValueById("upperQuarterFinal1", 1, 0);
	const uqf1 = aflBracket.getRoundNode("upperQuarterFinal1");
	const uqf1MR = uqf1.match.matchRecord as FullRecord;
	assertEquals(uqf1MR.upperSeedWins, 1);
	assertEquals(uqf1MR.lowerSeedWins, 0);

	const sf1 = aflBracket.getRoundNode("semiFinal1");
	assertEquals(sf1.match.matchRecord, undefined);

	const sf2 = aflBracket.getRoundNode("semiFinal2");
	assertEquals(sf2.match.matchRecord?.type, "UpperRecord");
	const sf2MR = sf2.match.matchRecord as UpperRecord;
	assertEquals(sf2MR.upperSeed, 1);

	const lqf1 = aflBracket.getRoundNode("lowerQuarterFinal1");
	assertEquals(lqf1.match.matchRecord?.type, "UpperRecord");
	const lqf1MR = lqf1.match.matchRecord as UpperRecord;
	assertEquals(lqf1MR.upperSeed, 4);
});

Deno.test(function updateTest2() {
	const aflBracket = new AFLBracketFlow();
	aflBracket.setMatchRecordWithValueById("upperQuarterFinal1", 0, 1);
	const uqf1 = aflBracket.getRoundNode("upperQuarterFinal1");
	const uqf1MR = uqf1.match.matchRecord as FullRecord;
	assertEquals(uqf1MR.upperSeedWins, 0);
	assertEquals(uqf1MR.lowerSeedWins, 1);

	const sf1 = aflBracket.getRoundNode("semiFinal1");
	assertEquals(sf1.match.matchRecord, undefined);

	const sf2 = aflBracket.getRoundNode("semiFinal2");
	assertEquals(sf2.match.matchRecord?.type, "UpperRecord");
	const sf2MR = sf2.match.matchRecord as UpperRecord;
	assertEquals(sf2MR.upperSeed, 4);

	const lqf1 = aflBracket.getRoundNode("lowerQuarterFinal1");
	assertEquals(lqf1.match.matchRecord?.type, "UpperRecord");
	const lqf1MR = lqf1.match.matchRecord as UpperRecord;
	assertEquals(lqf1MR.upperSeed, 1);
});

Deno.test(function updateTest3() {
	const aflBracket = new AFLBracketFlow();
	aflBracket.setMatchRecordWithValueById("upperQuarterFinal2", 1, 0);
	const uqf2 = aflBracket.getRoundNode("upperQuarterFinal2");
	const uqf2MR = uqf2.match.matchRecord as FullRecord;
	assertEquals(uqf2MR.upperSeedWins, 1);
	assertEquals(uqf2MR.lowerSeedWins, 0);

	const sf1 = aflBracket.getRoundNode("semiFinal1");
	assertEquals(sf1.match.matchRecord?.type, "UpperRecord");
	const sf1MR = sf1.match.matchRecord as UpperRecord;
	assertEquals(sf1MR.upperSeed, 2);

	const sf2 = aflBracket.getRoundNode("semiFinal2");
	assertEquals(sf2.match.matchRecord, undefined);

	const lqf2 = aflBracket.getRoundNode("lowerQuarterFinal2");
	assertEquals(lqf2.match.matchRecord?.type, "UpperRecord");
	const lqf2MR = lqf2.match.matchRecord as UpperRecord;
	assertEquals(lqf2MR.upperSeed, 3);
});

Deno.test(function updateTest4() {
	const aflBracket = new AFLBracketFlow();
	aflBracket.setMatchRecordWithValueById("upperQuarterFinal2", 0, 1);
	const uqf2 = aflBracket.getRoundNode("upperQuarterFinal2");
	const uqf2MR = uqf2.match.matchRecord as FullRecord;
	assertEquals(uqf2MR.upperSeedWins, 0);
	assertEquals(uqf2MR.lowerSeedWins, 1);

	const sf1 = aflBracket.getRoundNode("semiFinal1");
	assertEquals(sf1.match.matchRecord?.type, "UpperRecord");
	const sf1MR = sf1.match.matchRecord as UpperRecord;
	assertEquals(sf1MR.upperSeed, 3);

	const sf2 = aflBracket.getRoundNode("semiFinal2");
	assertEquals(sf2.match.matchRecord, undefined);

	const lqf2 = aflBracket.getRoundNode("lowerQuarterFinal2");
	assertEquals(lqf2.match.matchRecord?.type, "UpperRecord");
	const lqf2MR = lqf2.match.matchRecord as UpperRecord;
	assertEquals(lqf2MR.upperSeed, 2);
});

Deno.test(function updateTest5() {
	const aflBracket = new AFLBracketFlow();
	aflBracket.setMatchRecordWithValueById("lowerBracketRound1", 1, 0);
	const lbr1 = aflBracket.getRoundNode("lowerBracketRound1");
	const lbr1MR = lbr1.match.matchRecord as FullRecord;
	assertEquals(lbr1MR.upperSeedWins, 1);
	assertEquals(lbr1MR.lowerSeedWins, 0);

	const lqf1 = aflBracket.getRoundNode("lowerQuarterFinal1");
	assertEquals(lqf1.match.matchRecord?.type, "LowerRecord");
	const lqf1MR = lqf1.match.matchRecord as LowerRecord;
	assertEquals(lqf1MR.lowerSeed, 5);
});

Deno.test(function updateTest6() {
	const aflBracket = new AFLBracketFlow();
	aflBracket.setMatchRecordWithValueById("lowerBracketRound1", 1, 0);

	const lqf1 = aflBracket.getRoundNode("lowerQuarterFinal1");
	assertEquals(lqf1.match.matchRecord?.type, "LowerRecord");
	const lqf1MR = lqf1.match.matchRecord as LowerRecord;
	assertEquals(lqf1MR.lowerSeed, 5);

	// Seed 1 beat Seed 4
	aflBracket.setMatchRecordWithValueById("upperQuarterFinal1", 1, 0);
	assertEquals(lqf1.match.matchRecord?.type, "FullRecord");
	const lqf1MR2 = lqf1.match.matchRecord as FullRecord;
	assertEquals(lqf1MR2.upperSeed, 4);
	assertEquals(lqf1MR2.lowerSeed, 5);

})
