import { assertEquals } from "@std/assert/equals";
import { SwissBracket } from "../src/swiss_bracket/swiss_bracket.ts";
import { RoundNode } from "../src/models/round_node.ts";
import { AflBracket, AflNodeNames } from "../src/afl_bracket/afl_bracket.ts";
import { FullRecord, LowerRecord, UpperRecord } from "../src/models/match_record.ts";
import { checkMatchNodeSeeds, checkMatchNodeSeedWins } from "./util/testFunctions.ts";
import { GenericMatchNode } from "../src/models/generic_match_node.ts";

Deno.test(function genericsTest() {
	const afl_bracket = new AflBracket();
	const matchNode = afl_bracket.getBracketNode("GrandFinal");
	assertEquals(
		matchNode instanceof GenericMatchNode,
		true,
		"grandFinal is not of type matchNode",
	);

	const swiss_bracket = new SwissBracket();
	const roundNode = swiss_bracket.getBracketNode("0-0");
	assertEquals(roundNode instanceof RoundNode, true, "swissRound is not of type roundNode");
});

Deno.test(function updateTest1() {
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	const uqf1 = aflBracket.getBracketNode("UpperQuarterFinal1");
	const uqf1MR = uqf1.matchRecord as FullRecord;
	assertEquals(uqf1MR.upperSeedWins, 1);
	assertEquals(uqf1MR.lowerSeedWins, 0);

	const sf1 = aflBracket.getBracketNode("SemiFinal1");
	assertEquals(sf1.matchRecord, undefined);

	const sf2 = aflBracket.getBracketNode("SemiFinal2");
	assertEquals(sf2.matchRecord?.type, "UpperRecord");
	const sf2MR = sf2.matchRecord as UpperRecord;
	assertEquals(sf2MR.upperSeed, 1);

	const lqf1 = aflBracket.getBracketNode("LowerQuarterFinal1");
	assertEquals(lqf1.matchRecord?.type, "UpperRecord");
	const lqf1MR = lqf1.matchRecord as UpperRecord;
	assertEquals(lqf1MR.upperSeed, 4);
});

Deno.test(function updateTest2() {
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 0, 1);
	const uqf1 = aflBracket.getBracketNode("UpperQuarterFinal1");
	const uqf1MR = uqf1.matchRecord as FullRecord;
	assertEquals(uqf1MR.upperSeedWins, 0);
	assertEquals(uqf1MR.lowerSeedWins, 1);

	const sf1 = aflBracket.getBracketNode("SemiFinal1");
	assertEquals(sf1.matchRecord, undefined);

	const sf2 = aflBracket.getBracketNode("SemiFinal2");
	assertEquals(sf2.matchRecord?.type, "UpperRecord");
	const sf2MR = sf2.matchRecord as UpperRecord;
	assertEquals(sf2MR.upperSeed, 4);

	const lqf1 = aflBracket.getBracketNode("LowerQuarterFinal1");
	assertEquals(lqf1.matchRecord?.type, "UpperRecord");
	const lqf1MR = lqf1.matchRecord as UpperRecord;
	assertEquals(lqf1MR.upperSeed, 1);
});

Deno.test(function updateTest3() {
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	const uqf2 = aflBracket.getBracketNode("UpperQuarterFinal2");
	const uqf2MR = uqf2.matchRecord as FullRecord;
	assertEquals(uqf2MR.upperSeedWins, 1);
	assertEquals(uqf2MR.lowerSeedWins, 0);

	const sf1 = aflBracket.getBracketNode("SemiFinal1");
	assertEquals(sf1.matchRecord?.type, "UpperRecord");
	const sf1MR = sf1.matchRecord as UpperRecord;
	assertEquals(sf1MR.upperSeed, 2);

	const sf2 = aflBracket.getBracketNode("SemiFinal2");
	assertEquals(sf2.matchRecord, undefined);

	const lqf2 = aflBracket.getBracketNode("LowerQuarterFinal2");
	assertEquals(lqf2.matchRecord?.type, "UpperRecord");
	const lqf2MR = lqf2.matchRecord as UpperRecord;
	assertEquals(lqf2MR.upperSeed, 3);
});

Deno.test(function updateTest4() {
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal2", 0, 1);
	const uqf2 = aflBracket.getBracketNode("UpperQuarterFinal2");
	const uqf2MR = uqf2.matchRecord as FullRecord;
	assertEquals(uqf2MR.upperSeedWins, 0);
	assertEquals(uqf2MR.lowerSeedWins, 1);

	const sf1 = aflBracket.getBracketNode("SemiFinal1");
	assertEquals(sf1.matchRecord?.type, "UpperRecord");
	const sf1MR = sf1.matchRecord as UpperRecord;
	assertEquals(sf1MR.upperSeed, 3);

	const sf2 = aflBracket.getBracketNode("SemiFinal2");
	assertEquals(sf2.matchRecord, undefined);

	const lqf2 = aflBracket.getBracketNode("LowerQuarterFinal2");
	assertEquals(lqf2.matchRecord?.type, "UpperRecord");
	const lqf2MR = lqf2.matchRecord as UpperRecord;
	assertEquals(lqf2MR.upperSeed, 2);
});

Deno.test(function updateTest5() {
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("LowerBracketRound1", 1, 0);
	const lbr1 = aflBracket.getBracketNode("LowerBracketRound1");
	const lbr1MR = lbr1.matchRecord as FullRecord;
	assertEquals(lbr1MR.upperSeedWins, 1);
	assertEquals(lbr1MR.lowerSeedWins, 0);

	const lqf1 = aflBracket.getBracketNode("LowerQuarterFinal1");
	assertEquals(lqf1.matchRecord?.type, "LowerRecord");
	const lqf1MR = lqf1.matchRecord as LowerRecord;
	assertEquals(lqf1MR.lowerSeed, 5);
});

Deno.test(function updateTest6() {
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("LowerBracketRound1", 1, 0);

	const lqf1 = aflBracket.getBracketNode("LowerQuarterFinal1");
	assertEquals(lqf1.matchRecord?.type, "LowerRecord");
	const lqf1MR = lqf1.matchRecord as LowerRecord;
	assertEquals(lqf1MR.lowerSeed, 5);

	// Seed 1 beat Seed 4
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	assertEquals(lqf1.matchRecord?.type, "FullRecord");
	const lqf1MR2 = lqf1.matchRecord as FullRecord;
	assertEquals(lqf1MR2.upperSeed, 4);
	assertEquals(lqf1MR2.lowerSeed, 5);
});

Deno.test(function updateTest7() {
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerBracketRound1", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerBracketRound2", 1, 0);

	checkMatchNodeSeeds<AflNodeNames>(aflBracket, "LowerQuarterFinal1", 4, 5);
	checkMatchNodeSeeds<AflNodeNames>(aflBracket, "LowerQuarterFinal2", 3, 6);

	aflBracket.setMatchRecordAndFlow("LowerQuarterFinal1", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerQuarterFinal2", 1, 0);

	checkMatchNodeSeeds<AflNodeNames>(aflBracket, "SemiFinal1", 2, 4);
	checkMatchNodeSeeds<AflNodeNames>(aflBracket, "SemiFinal2", 1, 3);

	aflBracket.setMatchRecordAndFlow("SemiFinal1", 1, 0);
	aflBracket.setMatchRecordAndFlow("SemiFinal2", 1, 0);

	checkMatchNodeSeeds<AflNodeNames>(aflBracket, "GrandFinal", 2, 1);
});

Deno.test(function updateTest8() {
	// same as updateTest7 but reverse order for setting semiFinal results
	const aflBracket = new AflBracket();
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	aflBracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerBracketRound1", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerBracketRound2", 1, 0);

	aflBracket.setMatchRecordAndFlow("LowerQuarterFinal1", 1, 0);
	aflBracket.setMatchRecordAndFlow("LowerQuarterFinal2", 1, 0);

	aflBracket.setMatchRecordAndFlow("SemiFinal2", 1, 0);
	aflBracket.setMatchRecordAndFlow("SemiFinal1", 1, 0);

	checkMatchNodeSeeds<AflNodeNames>(aflBracket, "GrandFinal", 2, 1);
});

Deno.test(function lowerQuarterFinalShouldBeClearedAfterUpperQuarterFinalIsReset() {
	const afl_bracket = new AflBracket();
	afl_bracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	const lqf1 = afl_bracket.getBracketNode("LowerQuarterFinal1");
	assertEquals(lqf1.matchRecord?.type, "UpperRecord");
	const lqf1MR = lqf1.matchRecord as UpperRecord;
	assertEquals(lqf1MR.upperSeed, 4);

	const sf2 = afl_bracket.getBracketNode("SemiFinal2");
	assertEquals(sf2.matchRecord?.type, "UpperRecord");
	const sf2MR = sf2.matchRecord as UpperRecord;
	assertEquals(sf2MR.upperSeed, 1);

	afl_bracket.setMatchRecordAndFlow("UpperQuarterFinal1", 0, 0);
	assertEquals(sf2.matchRecord, undefined);
	assertEquals(lqf1.matchRecord, undefined, "lowerQuarterFinal1 was not cleared correctly");
});

Deno.test(
	function lowerQuarterFinalShouldBeClearedCorrectlyFor2TeamsWhenUpperQuarterFinalIsReset() {
		const afl_bracket = new AflBracket();
		afl_bracket.setMatchRecordAndFlow("UpperQuarterFinal1", 3, 0);
		afl_bracket.setMatchRecordAndFlow("LowerBracketRound1", 3, 0);

		const lqf1 = afl_bracket.getBracketNode("LowerQuarterFinal1");
		assertEquals(lqf1.matchRecord?.type, "FullRecord");
		const lqf1MR = lqf1.matchRecord as FullRecord;
		assertEquals(lqf1MR.upperSeed, 4);
		assertEquals(lqf1MR.lowerSeed, 5);

		afl_bracket.setMatchRecordAndFlow("UpperQuarterFinal1", 0, 0);
		assertEquals(lqf1.matchRecord?.type, "LowerRecord");
		const lqf1MR2 = lqf1.matchRecord as LowerRecord;
		assertEquals(lqf1MR2.lowerSeed, 5);
	},
);

Deno.test(
	function lowerQuarterFinalShouldBeClearedCorrectlyFor2TeamsWhenLowerBracketRound1IsReset() {
		const aflBracket = new AflBracket();
		aflBracket.setMatchRecordAndFlow("UpperQuarterFinal1", 3, 0);
		aflBracket.setMatchRecordAndFlow("LowerBracketRound1", 3, 0);

		const lqf1 = aflBracket.getBracketNode("LowerQuarterFinal1");
		aflBracket.setMatchRecordAndFlow("LowerBracketRound1", 0, 0);
		assertEquals(lqf1.matchRecord?.type, "UpperRecord");
		const lqf1MR2 = lqf1.matchRecord as UpperRecord;
		assertEquals(lqf1MR2.upperSeed, 4);
	},
);

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

	const sf1 = aflBracket.getBracketNode("SemiFinal1");
	assertEquals(sf1.matchRecord, undefined);
});

Deno.test(function getAllMatchNodesTest() {
	const afl_bracket = new AflBracket();
	const [uqf1, uqf2, lbr1, lbr2, lbqf1, lbqf2, sf1, sf2, gf] = afl_bracket.getAllMatchNodes();
	assertEquals(uqf1.name, "UpperQuarterFinal1");
	assertEquals(uqf2.name, "UpperQuarterFinal2");
	assertEquals(lbr1.name, "LowerBracketRound1");
	assertEquals(lbr2.name, "LowerBracketRound2");
	assertEquals(lbqf1.name, "LowerQuarterFinal1");
	assertEquals(lbqf2.name, "LowerQuarterFinal2");
	assertEquals(sf1.name, "SemiFinal1");
	assertEquals(sf2.name, "SemiFinal2");
	assertEquals(gf.name, "GrandFinal");
});

Deno.test(function buildBracketTest() {
	const afl_bracket = new AflBracket();
	afl_bracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	afl_bracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	afl_bracket.setMatchRecordAndFlow("LowerBracketRound1", 1, 0);
	afl_bracket.setMatchRecordAndFlow("LowerBracketRound2", 1, 0);
	const matchNodes = afl_bracket.getAllMatchNodes();

	const afl_bracket2 = new AflBracket();
	afl_bracket2.buildBracket(matchNodes);
	checkMatchNodeSeedWins<AflNodeNames>(afl_bracket2, "UpperQuarterFinal1", 1, 0);
	checkMatchNodeSeedWins<AflNodeNames>(afl_bracket2, "UpperQuarterFinal2", 1, 0);
	checkMatchNodeSeedWins<AflNodeNames>(afl_bracket2, "LowerBracketRound1", 1, 0);
	checkMatchNodeSeedWins<AflNodeNames>(afl_bracket2, "LowerBracketRound2", 1, 0);
});

Deno.test(function clearAllMatchRecordsTest() {
	const afl_bracket = new AflBracket();
	afl_bracket.setMatchRecordAndFlow("UpperQuarterFinal1", 1, 0);
	afl_bracket.setMatchRecordAndFlow("UpperQuarterFinal2", 1, 0);
	afl_bracket.setMatchRecordAndFlow("LowerBracketRound1", 1, 0);
	afl_bracket.setMatchRecordAndFlow("LowerBracketRound2", 1, 0);

	afl_bracket.setMatchRecordAndFlow("LowerQuarterFinal1", 1, 0);
	afl_bracket.setMatchRecordAndFlow("LowerQuarterFinal2", 1, 0);

	afl_bracket.setMatchRecordAndFlow("SemiFinal2", 1, 0);
	afl_bracket.setMatchRecordAndFlow("SemiFinal1", 1, 0);
	afl_bracket.setMatchRecordAndFlow("GrandFinal", 1, 0);

	afl_bracket.clearAllMatchRecords();
	const [uqf1, uqf2, lbr1, lbr2, lbqf1, lbqf2, sf1, sf2, gf] = afl_bracket.getAllMatchNodes();
	assertEquals(uqf1.matchRecord, undefined);
	assertEquals(uqf2.matchRecord, undefined);
	assertEquals(lbr1.matchRecord, undefined);
	assertEquals(lbr2.matchRecord, undefined);
	assertEquals(lbqf1.matchRecord, undefined);
	assertEquals(lbqf2.matchRecord, undefined);
	assertEquals(sf1.matchRecord, undefined);
	assertEquals(sf2.matchRecord, undefined);
	assertEquals(gf.matchRecord, undefined);
});
