import { AFLBracket } from "../src/afl_bracket/afl_bracket.ts";
import { assertEquals } from "@std/assert/equals";
import { levelOrderTraversal, postOrderTraversal } from "../src/util/util.ts";
import { SwissBracket } from "../src/swiss_bracket/swiss_bracket.ts";
import { MatchNode } from "../src/models/match_node.ts";
import { RoundNode } from "../src/models/round_node.ts";

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
	assertEquals(matchNode instanceof MatchNode, true);

	const swiss_bracket = new SwissBracket();
	const roundNode = swiss_bracket.getRoundNode("0-0");
	assertEquals(roundNode instanceof RoundNode, true);
})