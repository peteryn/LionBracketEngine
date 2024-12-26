import { AFLBracket } from "../src/afl_bracket/afl_bracket.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test(function aflStructureTest() {
	const aflBracket = new AFLBracket();
	const dummyNode = aflBracket.getRoundNode("0-0");
	assertEquals(dummyNode.matches.length, 0);

	const upperFinals = aflBracket.getRoundNode("1-0");
	assertEquals(upperFinals.matches.length, 2);

	const lowerRound1 = aflBracket.getRoundNode("0-1");
	assertEquals(lowerRound1.matches.length, 2);

	const lowerQuarterFinals = aflBracket.getRoundNode("1-1");
	assertEquals(lowerQuarterFinals.matches.length, 2);

	const semiFinals = aflBracket.getRoundNode("2-1");
	assertEquals(semiFinals.matches.length, 2);

	const grandFinals = aflBracket.getRoundNode("3-1");
	assertEquals(grandFinals.matches.length, 1);
    console.log(upperFinals.matches);
});
