import { assertEquals } from "@std/assert";
import { createTeams } from "./SwissBracket.ts";

Deno.test(function createTeamsTest() {
	const numTeams = 16;
	const teams = createTeams(numTeams);
	assertEquals(teams.length, numTeams);
});
