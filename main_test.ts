import { assertEquals } from "@std/assert";
import {
	createEmptyMatches,
	createTeams,
	populateMatches,
	SwissBracket,
	evaluationSort,
} from "./SwissBracket.ts";
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
	assertEquals(rootRound.has2Parents, false);
	assertEquals(rootRound.matches[0].matchRecord?.upperTeam.seed, 1);
	assertEquals(rootRound.matches[0].matchRecord?.lowerTeam.seed, 16);
	assertEquals(rootRound.matches[1].matchRecord?.upperTeam.seed, 2);
	assertEquals(rootRound.matches[1].matchRecord?.lowerTeam.seed, 15);

	const round2Upper = rootRound.winningRound;
	const round2Lower = rootRound.losingRound;
	assertEquals(round2Upper?.level, 2);
	assertEquals(round2Lower?.level, 2);
	assertEquals(round2Upper?.has2Parents, false);
	assertEquals(round2Lower?.has2Parents, false);
	assertEquals(round2Upper?.matches.length, 4);
	assertEquals(round2Lower?.matches.length, 4);

	const round3Upper = round2Upper?.winningRound;
	const round3Middle = round2Upper?.losingRound;
	const round3Lower = round2Lower?.losingRound;
	assertEquals(round3Upper?.level, 3);
	assertEquals(round3Middle?.level, 3);
	assertEquals(round3Lower?.level, 3);
	assertEquals(round3Upper?.has2Parents, false);
	assertEquals(round3Middle?.has2Parents, true);
	assertEquals(round3Lower?.has2Parents, false);
	assertEquals(round3Upper?.matches.length, 2);
	assertEquals(round3Middle?.matches.length, 4);
	assertEquals(round3Lower?.matches.length, 2);

	const round4Upper = round3Upper?.losingRound;
	const round4Lower = round3Lower?.winningRound;
	assertEquals(round4Upper?.level, 4);
	assertEquals(round4Lower?.level, 4);
	assertEquals(round4Upper?.has2Parents, true);
	assertEquals(round4Lower?.has2Parents, true);
	assertEquals(round4Upper?.matches.length, 3);
	assertEquals(round4Lower?.matches.length, 3);

	const round5 = round4Lower?.winningRound;
	assertEquals(round5?.level, 5);
	assertEquals(round5?.has2Parents, true);
	assertEquals(round5?.matches.length, 3);
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
	const matches = evaluationSortTest(16, "1-0", "./data/round1UpperTestData1.json");

	assertEquals(matches[0].matchRecord?.upperTeam.seed, 1);
});

Deno.test(function round1UpperTest2() {
	const matches = evaluationSortTest(16, "1-0", "./data/round1UpperTestData2.json");

	assertEquals(matches[0].matchRecord?.upperTeam.seed, 7);
	assertEquals(matches[1].matchRecord?.upperTeam.seed, 8);
	assertEquals(matches[2].matchRecord?.upperTeam.seed, 2);
	assertEquals(matches[3].matchRecord?.upperTeam.seed, 3);
	assertEquals(matches[4].matchRecord?.upperTeam.seed, 1);
	assertEquals(matches[5].matchRecord?.upperTeam.seed, 4);
	assertEquals(matches[6].matchRecord?.upperTeam.seed, 5);
	assertEquals(matches[7].matchRecord?.upperTeam.seed, 6);
});

Deno.test(function computeRound1() {
	const swissBracket = new SwissBracket(16, 2);
	const f: MatchRecordSerialized[] = getJsonSync("./data/round1UpperTestData1.json");
	for (let index = 0; index < f.length; index++) {
		const matchRecordS = f[index];
		const mr = swissBracket.getMatchRecord("0-0", index + 1);
		if (mr) {
			mr.lowerTeamWins = matchRecordS.lowerTeamWins;
			mr.upperTeamWins = matchRecordS.upperTeamWins;
			swissBracket.setMatchRecord("0-0", index + 1, mr);
		} else {
			throw new Error("Match record doesn't exist when it should");
		}
	}
	const round1 = swissBracket.rootRound;
	const round2Upper = round1.winningRound;
	const round2Lower = round1.losingRound;
	assertEquals(round2Upper?.matches[0].matchRecord?.upperTeam.seed, 1);
	assertEquals(round2Upper?.matches[0].matchRecord?.lowerTeam.seed, 8);

	assertEquals(round2Upper?.matches[1].matchRecord?.upperTeam.seed, 2);
	assertEquals(round2Upper?.matches[1].matchRecord?.lowerTeam.seed, 7);

	assertEquals(round2Upper?.matches[2].matchRecord?.upperTeam.seed, 3);
	assertEquals(round2Upper?.matches[2].matchRecord?.lowerTeam.seed, 6);

	assertEquals(round2Upper?.matches[3].matchRecord?.upperTeam.seed, 4);
	assertEquals(round2Upper?.matches[3].matchRecord?.lowerTeam.seed, 5);

	assertEquals(round2Lower?.matches[0].matchRecord?.upperTeam.seed, 9);
	assertEquals(round2Lower?.matches[0].matchRecord?.lowerTeam.seed, 16);

	assertEquals(round2Lower?.matches[1].matchRecord?.upperTeam.seed, 10);
	assertEquals(round2Lower?.matches[1].matchRecord?.lowerTeam.seed, 15);

	assertEquals(round2Lower?.matches[2].matchRecord?.upperTeam.seed, 11);
	assertEquals(round2Lower?.matches[2].matchRecord?.lowerTeam.seed, 14);

	assertEquals(round2Lower?.matches[3].matchRecord?.upperTeam.seed, 12);
	assertEquals(round2Lower?.matches[3].matchRecord?.lowerTeam.seed, 13);
});

function evaluationSortTest(numTeams: number, name: string, filePath: string) {
	const teams = createTeams(numTeams);
	const matches = createEmptyMatches(numTeams / 2, name);

	const f: MatchRecordSerialized[] = getJsonSync(filePath);
	populateMatchRecords(teams, f);
	evaluationSort(teams);
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
