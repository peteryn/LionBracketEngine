import { AFLBracket } from "../src/afl_bracket/afl_bracket.ts";
import { assertEquals } from "@std/assert/equals";
import { levelOrderTraversal, postOrderTraversal } from "../src/util/util.ts";
import { SwissBracket } from "../src/swiss_bracket/swiss_bracket.ts";
import { MatchNode } from "../src/models/match_node.ts";
import { RoundNode } from "../src/models/round_node.ts";
import { AFLBracketFlow } from "../src/afl_bracket/afl_bracket_flow.ts";

Deno.test(function aflStructureTest() {});

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
});
