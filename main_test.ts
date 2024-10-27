import { assertEquals } from "@std/assert";
import { createEmptyMatches, createTeams, populateMatches, SwissBracket } from "./SwissBracket.ts";
import { Match, MatchRecord, Team, type MatchRecordSerialized } from "./models.ts";

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

Deno.test(function structureTest1() {
	const swissBracket = new SwissBracket(16, 3);
	const rootRound = swissBracket.rootRound;
	assertEquals(rootRound.level, 1);

	const round1Upper = rootRound.winningRound;
	const round2Lower = rootRound.losingRound;
	assertEquals(round1Upper?.level, 2);
	assertEquals(round2Lower?.level, 2);

	const round3Upper = round1Upper?.winningRound;
	const round3Middle = round1Upper?.losingRound;
	const round3Lower = round2Lower?.losingRound;
	assertEquals(round3Upper?.level, 3);
	assertEquals(round3Middle?.level, 3);
	assertEquals(round3Lower?.level, 3);

	const round4Upper = round3Upper?.losingRound;
	const round4Lower = round3Lower?.winningRound;
	assertEquals(round4Upper?.level, 4);
	assertEquals(round4Lower?.level, 4);

	const round5 = round4Lower?.winningRound;
	assertEquals(round5?.level, 5);
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
	const matches = evaluationSortTest(16, "1-0", "./testData/round1UpperTestData1.json");

	assertEquals(matches[0].matchRecord?.upperTeam.seed, 8);
});

Deno.test(function round1UpperTest2() {
	const matches = evaluationSortTest(16, "1-0", "./testData/round1UpperTestData2.json");

	assertEquals(matches[0].matchRecord?.upperTeam.seed, 7);
	assertEquals(matches[1].matchRecord?.upperTeam.seed, 8);
	assertEquals(matches[2].matchRecord?.upperTeam.seed, 2);
	assertEquals(matches[3].matchRecord?.upperTeam.seed, 3);
	assertEquals(matches[4].matchRecord?.upperTeam.seed, 1);
	assertEquals(matches[5].matchRecord?.upperTeam.seed, 4);
	assertEquals(matches[6].matchRecord?.upperTeam.seed, 5);
	assertEquals(matches[7].matchRecord?.upperTeam.seed, 6);
});

function evaluationSortTest(numTeams: number, name: string, filePath: string) {
	const teams = createTeams(numTeams);
	const matches = createEmptyMatches(numTeams / 2, name);

	const f: MatchRecordSerialized[] = getJsonSync(filePath);
	populateMatchRecords(teams, f);
	SwissBracket.evaluationSort(teams);
	populateMatches(matches, teams);
	return matches;
}

function getJsonSync(filePath: string) {
	return JSON.parse(Deno.readTextFileSync(filePath));
}

function populateMatchRecords(teams: Team[], data: MatchRecordSerialized[]) {
	let i = 0;
	let j = teams.length - 1;
	while (i < j) {
		const record = new MatchRecord(teams[i], teams[j]);
		record.upperTeamWins = data[i].upperTeamWins;
		record.lowerTeamWins = data[i].lowerTeamWins;
		teams[i].matchHistory.push(record);
		teams[j].matchHistory.push(record);
		i++;
		j--;
	}
}
