import { AFLBracket } from "../src/afl_bracket/afl_bracket.ts";
import { assertEquals } from "@std/assert/equals";
import { levelOrderTraversal, postOrderTraversal } from "../src/util/util.ts";
import { SwissBracket } from "../src/swiss_bracket/swiss_bracket.ts";
import { MatchNode } from "../src/models/match_node.ts";
import { RoundNode } from "../src/models/round_node.ts";
import { AFLBracketFlow } from "../src/afl_bracket/afl_bracket_flow.ts";

Deno.test(function aflStructureTest() {
	const aflBracket = new AFLBracket();
	postOrderTraversal(aflBracket.rootRound, (node) => {
		console.log(node.name);
		console.log();
	});

	const swissBracket = new SwissBracket();
	postOrderTraversal(swissBracket.rootRound, (node) => {
		console.log(`RoundNode specifically has level variable (${node.level})`);
	});
});

Deno.test(function genericsTest() {
	const afl_bracket = new AFLBracket();
	const matchNode = afl_bracket.getRoundNode("grandFinal");
	assertEquals(matchNode instanceof MatchNode, true, "grandFinal is not of type matchNode");

	const swiss_bracket = new SwissBracket();
	const roundNode = swiss_bracket.getRoundNode("0-0");
	assertEquals(roundNode instanceof RoundNode, true, "swissRound is not of type roundNode");
});

Deno.test(function firstUpdate() {
	const aflBracket = new AFLBracketFlow();
	const upperQuarterFinal1 = aflBracket.getRoundNode("upperQuarterFinal1");
	assertEquals(upperQuarterFinal1.name, "upperQuarterFinal1");
	const res = aflBracket.setMatchRecordWithValueById("upperQuarterFinal1", 3, 0);
	assertEquals(res, true, "node was not set correctly");
	const semiFinal1 = aflBracket.getRoundNode("semiFinal1");
	assertEquals(semiFinal1.name, "semiFinal1", "semi final node doesn't exist");
	assertEquals(semiFinal1.match.matchRecord!.upperSeed, 1);
	assertEquals(semiFinal1.match.matchRecord!.lowerSeed, -1);
});
