import { SwissBracket } from "./swiss_bracket/swiss_bracket.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
	const swissBracket = new SwissBracket(16, 3, "GAME_DIFF", "sb");

	swissBracket.printLevels();
}
