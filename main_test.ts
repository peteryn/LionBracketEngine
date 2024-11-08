import { assertEquals } from "@std/assert";
import {
	createEmptyMatches,
	createTeams,
	populateMatches,
	printRound,
	SwissBracket,
} from "./SwissBracket.ts";
import { Match, MatchRecord, TournamentData, type MatchRecordSerialized } from "./models.ts";
import { getJsonSync } from "./util/file.ts";
import {
	checkVersusData,
	evaluationSortTest,
	populateMatchRecordFromData,
	testTournament,
} from "./util/testFunctions.ts";
import { evaluationSort } from "./SwissBracket.ts";
import { RoundNode } from "./models.ts";

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
	const matchups = evaluationSort(teams);
	populateMatches(matches, matchups);
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

Deno.test(function getMatchDifferentialTest2() {
	const numTeams = 2;
	const teams = createTeams(numTeams);

	const r1m1 = new MatchRecord(teams[0], teams[15]);
	r1m1.upperTeamWins = 3;
	r1m1.lowerTeamWins = 0;
	teams[0].matchHistory.push(r1m1);
	teams[1].matchHistory.push(r1m1);

	assertEquals(teams[0].seed, 1);
	assertEquals(teams[1].seed, 2);

	assertEquals(teams[0].getMatchDifferential(), 1);
	assertEquals(teams[1].getMatchDifferential(), -1);

	assertEquals(teams[0].getGameDifferential(), 3);
	assertEquals(teams[1].getGameDifferential(), -3);
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

Deno.test(function structureTest1() {
	const swissBracket = new SwissBracket(16, 3);
	const rootRound = swissBracket.rootRound;
	assertEquals(rootRound.level, 1);
	assertEquals(rootRound.has2Parents, false);
	assertEquals(rootRound.matches[0].matchRecord?.upperTeam.seed, 1);
	assertEquals(rootRound.matches[0].matchRecord?.lowerTeam.seed, 16);
	assertEquals(rootRound.matches[1].matchRecord?.upperTeam.seed, 2);
	assertEquals(rootRound.matches[1].matchRecord?.lowerTeam.seed, 15);
	assertEquals(swissBracket.roundNodes.get("0-0")?.name, swissBracket.rootRound.name);

	const round2Upper = rootRound.winningRound;
	const round2Lower = rootRound.losingRound;
	assertEquals(swissBracket.roundNodes.get("1-0")?.name, round2Upper?.name);
	assertEquals(swissBracket.roundNodes.get("0-1")?.name, round2Lower?.name);
	assertEquals(round2Upper?.level, 2);
	assertEquals(round2Lower?.level, 2);
	assertEquals(round2Upper?.has2Parents, false);
	assertEquals(round2Lower?.has2Parents, false);
	assertEquals(round2Upper?.matches.length, 4);
	assertEquals(round2Lower?.matches.length, 4);

	const round3Upper = round2Upper?.winningRound;
	const round3Middle = round2Upper?.losingRound;
	const round3Lower = round2Lower?.losingRound;
	assertEquals(swissBracket.roundNodes.get("2-0")?.name, round3Upper?.name);
	assertEquals(swissBracket.roundNodes.get("1-1")?.name, round3Middle?.name);
	assertEquals(swissBracket.roundNodes.get("0-2")?.name, round3Lower?.name);
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
	assertEquals(swissBracket.roundNodes.get("2-1")?.name, round4Upper?.name);
	assertEquals(swissBracket.roundNodes.get("1-2")?.name, round4Lower?.name);
	assertEquals(round4Upper?.level, 4);
	assertEquals(round4Lower?.level, 4);
	assertEquals(round4Upper?.has2Parents, true);
	assertEquals(round4Lower?.has2Parents, true);
	assertEquals(round4Upper?.matches.length, 3);
	assertEquals(round4Lower?.matches.length, 3);

	const round5 = round4Lower?.winningRound;
	assertEquals(swissBracket.roundNodes.get("2-2")?.name, round5?.name);
	assertEquals(round5?.level, 5);
	assertEquals(round5?.has2Parents, true);
	assertEquals(round5?.matches.length, 3);
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

Deno.test(function naRegional4Test1() {
	testTournament("./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_4.json");
});

Deno.test(function naRegional4Test2() {
	const tournamentPath = "./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_4.json";
	const tournament: TournamentData = getJsonSync(tournamentPath);
	const swissBracket = new SwissBracket(16, 3);
	populateMatchRecordFromData(swissBracket, tournament, "0-0");

	checkVersusData(swissBracket, tournament, "1-0");
	checkVersusData(swissBracket, tournament, "0-1");

	populateMatchRecordFromData(swissBracket, tournament, "1-0");
	populateMatchRecordFromData(swissBracket, tournament, "0-1");

	checkVersusData(swissBracket, tournament, "2-0");
	checkVersusData(swissBracket, tournament, "1-1");
	checkVersusData(swissBracket, tournament, "0-2");

	populateMatchRecordFromData(swissBracket, tournament, "2-0");
	populateMatchRecordFromData(swissBracket, tournament, "1-1");
	populateMatchRecordFromData(swissBracket, tournament, "0-2");

	checkVersusData(swissBracket, tournament, "2-1");
	checkVersusData(swissBracket, tournament, "1-2");

	populateMatchRecordFromData(swissBracket, tournament, "2-1");
	populateMatchRecordFromData(swissBracket, tournament, "1-2");

	checkVersusData(swissBracket, tournament, "2-2");

	populateMatchRecordFromData(swissBracket, tournament, "2-2");

	const mr = swissBracket.getMatchRecord("0-0", 1);
	mr!.lowerTeamWins = 1;
	swissBracket.setMatchRecord("0-0", 1, mr!);

	for (const match of swissBracket.rootRound.matches) {
		const upperTeam = match.matchRecord?.upperTeam;
		const lowerTeam = match.matchRecord?.lowerTeam;

		assertEquals(upperTeam?.matchHistory.length, 2);
		assertEquals(lowerTeam?.matchHistory.length, 2);
	}

	const round3Upper = swissBracket.roundNodes.get("2-0") as RoundNode;
	assertEquals(round3Upper.matches[0].matchRecord, undefined);
	assertEquals(round3Upper.matches[1].matchRecord, undefined);

	const round3Middle = swissBracket.roundNodes.get("1-1") as RoundNode;
	assertEquals(round3Middle.matches[0].matchRecord, undefined);
	assertEquals(round3Middle.matches[1].matchRecord, undefined);
	assertEquals(round3Middle.matches[2].matchRecord, undefined);
	assertEquals(round3Middle.matches[3].matchRecord, undefined);

	const round3Lower = swissBracket.roundNodes.get("0-2") as RoundNode;
	assertEquals(round3Lower.matches[0].matchRecord, undefined);
	assertEquals(round3Lower.matches[1].matchRecord, undefined);

	const round4Upper = swissBracket.roundNodes.get("2-1") as RoundNode;
	assertEquals(round4Upper.matches[0].matchRecord, undefined);
	assertEquals(round4Upper.matches[1].matchRecord, undefined);
	assertEquals(round4Upper.matches[2].matchRecord, undefined);

	populateMatchRecordFromData(swissBracket, tournament, "0-0");

	checkVersusData(swissBracket, tournament, "1-0");
	checkVersusData(swissBracket, tournament, "0-1");

	populateMatchRecordFromData(swissBracket, tournament, "1-0");
	populateMatchRecordFromData(swissBracket, tournament, "0-1");

	checkVersusData(swissBracket, tournament, "2-0");

	// swissBracket.rootRound.winningRound!.matches.forEach((m) => {
	// 	console.log(m.matchRecord?.upperTeam.matchHistory[0].toString());
	// })
	// printRound(round3Middle.matches, tournament.teamNames);
	// const sr = round3Middle.matches[1].matchRecord?.lowerTeam;
	// console.log(tournament.teamNames[sr!.seed - 1]);
	// console.log(sr!.matchHistory.length);
	// for (const m of sr!.matchHistory) {
	// 	console.log(m);
	// }
	// checkVersusData(swissBracket, tournament, "1-1");
	// checkVersusData(swissBracket, tournament, "0-2");

	// populateMatchRecordFromData(swissBracket, tournament, "2-0");
	// populateMatchRecordFromData(swissBracket, tournament, "1-1");
	// populateMatchRecordFromData(swissBracket, tournament, "0-2");

	// checkVersusData(swissBracket, tournament, "2-1");
	// checkVersusData(swissBracket, tournament, "1-2");

	// populateMatchRecordFromData(swissBracket, tournament, "2-1");
	// populateMatchRecordFromData(swissBracket, tournament, "1-2");

	// checkVersusData(swissBracket, tournament, "2-2");

	// populateMatchRecordFromData(swissBracket, tournament, "2-2");
});

Deno.test(function naRegional4Test3() {
	const tournamentPath = "./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_4.json";
	const tournament: TournamentData = getJsonSync(tournamentPath);
	const swissBracket = new SwissBracket(16, 3);
	populateMatchRecordFromData(swissBracket, tournament, "0-0");

	checkVersusData(swissBracket, tournament, "1-0");
	checkVersusData(swissBracket, tournament, "0-1");

	populateMatchRecordFromData(swissBracket, tournament, "1-0");
	populateMatchRecordFromData(swissBracket, tournament, "0-1");

	checkVersusData(swissBracket, tournament, "2-0");
	checkVersusData(swissBracket, tournament, "1-1");
	checkVersusData(swissBracket, tournament, "0-2");

	populateMatchRecordFromData(swissBracket, tournament, "2-0");
	populateMatchRecordFromData(swissBracket, tournament, "1-1");
	populateMatchRecordFromData(swissBracket, tournament, "0-2");

	checkVersusData(swissBracket, tournament, "2-1");
	checkVersusData(swissBracket, tournament, "1-2");

	populateMatchRecordFromData(swissBracket, tournament, "2-1");
	populateMatchRecordFromData(swissBracket, tournament, "1-2");

	checkVersusData(swissBracket, tournament, "2-2");

	populateMatchRecordFromData(swissBracket, tournament, "2-2");

	const swiss2 = new SwissBracket(16, 3);
	populateMatchRecordFromData(swiss2, tournament, "0-0");
	checkVersusData(swiss2, tournament, "1-0");
	checkVersusData(swiss2, tournament, "0-1");
	populateMatchRecordFromData(swiss2, tournament, "1-0");
	populateMatchRecordFromData(swiss2, tournament, "0-1");
	checkVersusData(swiss2, tournament, "2-0");
	checkVersusData(swiss2, tournament, "1-1");
	checkVersusData(swiss2, tournament, "0-2");

	populateMatchRecordFromData(swissBracket, tournament, "0-0");
	checkVersusData(swissBracket, tournament, "1-0");
	checkVersusData(swissBracket, tournament, "0-1");
	populateMatchRecordFromData(swissBracket, tournament, "1-0");
	populateMatchRecordFromData(swissBracket, tournament, "0-1");
	checkVersusData(swissBracket, tournament, "2-0");

	const swiss1Round1 = swissBracket.rootRound;
	const swiss2Round1 = swiss2.rootRound;

	const swiss1Round2Upper = swissBracket.roundNodes.get("1-0") as RoundNode;
	const swiss2Round2Upper = swiss2.roundNodes.get("1-0") as RoundNode;

	const swiss1Round2Lower = swissBracket.roundNodes.get("0-1") as RoundNode;
	const swiss2Round2Lower = swiss2.roundNodes.get("0-1") as RoundNode;

	for (let index = 0; index < 8; index++) {
		const mr1 = swiss1Round1.matches[index].matchRecord as MatchRecord;
		const mr2 = swiss2Round1.matches[index].matchRecord as MatchRecord;
		if (!mr1!.equals(mr2)) {
			console.log("REALLY BAD");
		}
	}

	for (let index = 0; index < 4; index++) {
		const mr1 = swiss1Round2Upper.matches[index].matchRecord as MatchRecord;
		const mr2 = swiss2Round2Upper.matches[index].matchRecord as MatchRecord;
		if (!mr1!.equals(mr2)) {
			console.log("REALLY BAD");
		}
	}

	for (let index = 0; index < 4; index++) {
		const mr1 = swiss1Round2Lower.matches[index].matchRecord as MatchRecord;
		const mr2 = swiss2Round2Lower.matches[index].matchRecord as MatchRecord;
		if (!mr1!.equals(mr2)) {
			console.log("REALLY BAD");
		}
	}

	// checkVersusData(swissBracket, tournament, "1-1");
	// checkVersusData(swissBracket, tournament, "0-2");

	// populateMatchRecordFromData(swissBracket, tournament, "2-0");
	// populateMatchRecordFromData(swissBracket, tournament, "1-1");
	// populateMatchRecordFromData(swissBracket, tournament, "0-2");

	// checkVersusData(swissBracket, tournament, "2-1");
	// checkVersusData(swissBracket, tournament, "1-2");

	// populateMatchRecordFromData(swissBracket, tournament, "2-1");
	// populateMatchRecordFromData(swissBracket, tournament, "1-2");

	// checkVersusData(swissBracket, tournament, "2-2");

	// populateMatchRecordFromData(swissBracket, tournament, "2-2")
});

Deno.test(function naRegional5Test1() {
	testTournament("./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_5.json");
});

Deno.test(function naRegional6Test1() {
	testTournament("./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_6.json");
});

// checkVersusData(swissBracket, tournament, "1-1");
// checkVersusData(swissBracket, tournament, "0-2");

// populateMatchRecordFromData(swissBracket, tournament, "2-0");
// populateMatchRecordFromData(swissBracket, tournament, "1-1");
// populateMatchRecordFromData(swissBracket, tournament, "0-2");

// checkVersusData(swissBracket, tournament, "2-1");
// checkVersusData(swissBracket, tournament, "1-2");

// populateMatchRecordFromData(swissBracket, tournament, "2-1");
// populateMatchRecordFromData(swissBracket, tournament, "1-2");

// checkVersusData(swissBracket, tournament, "2-2");

// populateMatchRecordFromData(swissBracket, tournament, "2-2")

Deno.test(function naRegional5Test1() {
	testTournament("./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_5.json");
});

Deno.test(function naRegional6Test1() {
	testTournament("./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_6.json");
});
