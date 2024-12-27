import { AFLBracket } from "../src/afl_bracket/afl_bracket.ts";
import { assertEquals } from "@std/assert/equals";
import { postOrderTraversal } from "../src/util/util.ts";

Deno.test(function aflStructureTest() {
	const aflBracket = new AFLBracket();
	postOrderTraversal(aflBracket.rootRound, (node) => {
		console.log(node.name);
		console.log();
	});
});
