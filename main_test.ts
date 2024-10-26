import { assertEquals } from "@std/assert";
import { createEmptyMatches, createTeams, populateMatches, SwissBracket } from "./SwissBracket.ts";
import { Match, MatchRecord } from "./models.ts";

Deno.test(function createTeamsTest() {
	const numTeams = 16;
	const teams = createTeams(numTeams);
	assertEquals(teams.length, numTeams);
});

Deno.test(function initialSeedingTest() {
	const numTeams = 16;
	const teams = createTeams(numTeams);
	const nodeName = "0-0";
	const matches: Match[] = createEmptyMatches(numTeams / 2, nodeName);
	populateMatches(matches, teams);
	assertEquals(matches[0].matchRecord?.upperTeam.seed, 1);
	assertEquals(matches[0].matchRecord?.lowerTeam.seed, 16);

	assertEquals(matches[1].matchRecord?.upperTeam.seed, 2);
	assertEquals(matches[1].matchRecord?.lowerTeam.seed, 15);

	assertEquals(matches[2].matchRecord?.upperTeam.seed, 3);
	assertEquals(matches[2].matchRecord?.lowerTeam.seed, 14);

	assertEquals(matches[3].matchRecord?.upperTeam.seed, 4);
	assertEquals(matches[3].matchRecord?.lowerTeam.seed, 13);

	assertEquals(matches[4].matchRecord?.upperTeam.seed, 5);
	assertEquals(matches[4].matchRecord?.lowerTeam.seed, 12);

	assertEquals(matches[5].matchRecord?.upperTeam.seed, 6);
	assertEquals(matches[5].matchRecord?.lowerTeam.seed, 11);

	assertEquals(matches[6].matchRecord?.upperTeam.seed, 7);
	assertEquals(matches[6].matchRecord?.lowerTeam.seed, 10);

	assertEquals(matches[7].matchRecord?.upperTeam.seed, 8);
	assertEquals(matches[7].matchRecord?.lowerTeam.seed, 9);
});

Deno.test(function getMatchDifferentialTest() {
	const numTeams = 2;
	const teams = createTeams(numTeams);

	const r1m1 = new MatchRecord(teams[0], teams[15]);
	r1m1.upperTeamWins = 3;
	r1m1.lowerTeamWins = 2;
	teams[0].matchHistory.push(r1m1);
	teams[1].matchHistory.push(r1m1);

	assertEquals(teams[0].seed, 1);
	assertEquals(teams[1].seed, 2);

	assertEquals(teams[0].getMatchDifferential(), 1);
	assertEquals(teams[1].getMatchDifferential(), -1);

	assertEquals(teams[0].getGameDifferential(), 1);
	assertEquals(teams[1].getGameDifferential(), -1);
});

Deno.test(function round1UpperTest1() {
	const numTeams = 16;
	const teams = createTeams(numTeams);
	const matches = createEmptyMatches(numTeams / 2, "1-0");

	const r1m1 = new MatchRecord(teams[0], teams[15]);
	r1m1.upperTeamWins = 3;
	r1m1.lowerTeamWins = 2;
	teams[0].matchHistory.push(r1m1);
	teams[15].matchHistory.push(r1m1);

	const r1m2 = new MatchRecord(teams[1], teams[14]);
	r1m2.upperTeamWins = 3;
	r1m2.lowerTeamWins = 2;
	teams[1].matchHistory.push(r1m2);
	teams[14].matchHistory.push(r1m2);

	const r1m3 = new MatchRecord(teams[2], teams[13]);
	r1m3.upperTeamWins = 3;
	r1m3.lowerTeamWins = 2;
	teams[2].matchHistory.push(r1m3);
	teams[13].matchHistory.push(r1m3);

	const r1m4 = new MatchRecord(teams[3], teams[12]);
	r1m4.upperTeamWins = 3;
	r1m4.lowerTeamWins = 2;
	teams[3].matchHistory.push(r1m4);
	teams[12].matchHistory.push(r1m4);

	const r1m5 = new MatchRecord(teams[4], teams[11]);
	r1m5.upperTeamWins = 3;
	r1m5.lowerTeamWins = 2;
	teams[4].matchHistory.push(r1m5);
	teams[11].matchHistory.push(r1m5);

	const r1m6 = new MatchRecord(teams[5], teams[10]);
	r1m6.upperTeamWins = 3;
	r1m6.lowerTeamWins = 2;
	teams[5].matchHistory.push(r1m6);
	teams[10].matchHistory.push(r1m6);

	const r1m7 = new MatchRecord(teams[6], teams[9]);
	r1m7.upperTeamWins = 3;
	r1m7.lowerTeamWins = 2;
	teams[6].matchHistory.push(r1m7);
	teams[9].matchHistory.push(r1m7);

	const r1m8 = new MatchRecord(teams[7], teams[8]);
	r1m8.upperTeamWins = 3;
	r1m8.lowerTeamWins = 0;
	teams[7].matchHistory.push(r1m8);
	teams[8].matchHistory.push(r1m8);

	SwissBracket.evaluationSort(teams);

	populateMatches(matches, teams);

	assertEquals(matches[0].matchRecord?.upperTeam.seed, 8);
});
