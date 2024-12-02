import { assertEquals } from "@std/assert";
import { SwissBracket } from "./SwissBracket.ts";
import { TournamentData, type MatchRecordSerialized } from "./models.ts";
import { getJsonSync } from "./util/file.ts";
import {
	checkVersusData,
	populateMatchRecordFromData,
	testTournament,
} from "./util/testFunctions.ts";
import { RoundNode } from "./models.ts";
import { printRound } from "./util/util.ts";

Deno.test(function structureTest1() {
	const swissBracket = new SwissBracket(16, 3);
	const rootRound = swissBracket.data.rootRound;
	assertEquals(rootRound.level, 1);
	assertEquals(rootRound.has2Parents, false);
	assertEquals(rootRound.matches[0].matchRecord?.upperTeam.seed, 1);
	assertEquals(rootRound.matches[0].matchRecord?.lowerTeam.seed, 16);
	assertEquals(rootRound.matches[1].matchRecord?.upperTeam.seed, 2);
	assertEquals(rootRound.matches[1].matchRecord?.lowerTeam.seed, 15);
	assertEquals(swissBracket.data.roundNodes.get("0-0")?.name, swissBracket.data.rootRound.name);

	const round2Upper = rootRound.winningRound;
	const round2Lower = rootRound.losingRound;
	assertEquals(swissBracket.data.roundNodes.get("1-0")?.name, round2Upper?.name);
	assertEquals(swissBracket.data.roundNodes.get("0-1")?.name, round2Lower?.name);
	assertEquals(round2Upper?.level, 2);
	assertEquals(round2Lower?.level, 2);
	assertEquals(round2Upper?.has2Parents, false);
	assertEquals(round2Lower?.has2Parents, false);
	assertEquals(round2Upper?.matches.length, 4);
	assertEquals(round2Lower?.matches.length, 4);

	const round3Upper = round2Upper?.winningRound;
	const round3Middle = round2Upper?.losingRound;
	const round3Lower = round2Lower?.losingRound;
	assertEquals(swissBracket.data.roundNodes.get("2-0")?.name, round3Upper?.name);
	assertEquals(swissBracket.data.roundNodes.get("1-1")?.name, round3Middle?.name);
	assertEquals(swissBracket.data.roundNodes.get("0-2")?.name, round3Lower?.name);
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
	assertEquals(swissBracket.data.roundNodes.get("2-1")?.name, round4Upper?.name);
	assertEquals(swissBracket.data.roundNodes.get("1-2")?.name, round4Lower?.name);
	assertEquals(round4Upper?.level, 4);
	assertEquals(round4Lower?.level, 4);
	assertEquals(round4Upper?.has2Parents, true);
	assertEquals(round4Lower?.has2Parents, true);
	assertEquals(round4Upper?.matches.length, 3);
	assertEquals(round4Lower?.matches.length, 3);

	const round5 = round4Lower?.winningRound;
	assertEquals(swissBracket.data.roundNodes.get("2-2")?.name, round5?.name);
	assertEquals(round5?.level, 5);
	assertEquals(round5?.has2Parents, true);
	assertEquals(round5?.matches.length, 3);
});

Deno.test(function computeRound1() {
	const swissBracket = new SwissBracket(16, 2);
	const f: MatchRecordSerialized[] = getJsonSync("./data/round1UpperTestData1.json");
	for (let index = 0; index < f.length; index++) {
		const matchRecordS = f[index];
		const mr = swissBracket.getMatchRecord("0-0", index);
		if (mr) {
			mr.lowerTeamWins = matchRecordS.lowerTeamWins;
			mr.upperTeamWins = matchRecordS.upperTeamWins;
			swissBracket.setMatchRecord("0-0", index, mr);
		} else {
			throw new Error("Match record doesn't exist when it should");
		}
	}
	const round1 = swissBracket.data.rootRound;
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

	// change record in round 1
	const mr = swissBracket.getMatchRecord("0-0", 1);
	mr!.lowerTeamWins = 1;
	swissBracket.setMatchRecord("0-0", 1, mr!);

	// make sure that future rounds are now undefined
	const round3Upper = swissBracket.data.roundNodes.get("2-0") as RoundNode;
	assertEquals(round3Upper.matches[0].matchRecord, undefined);
	assertEquals(round3Upper.matches[1].matchRecord, undefined);

	const round3Middle = swissBracket.data.roundNodes.get("1-1") as RoundNode;
	assertEquals(round3Middle.matches[0].matchRecord, undefined);
	assertEquals(round3Middle.matches[1].matchRecord, undefined);
	assertEquals(round3Middle.matches[2].matchRecord, undefined);
	assertEquals(round3Middle.matches[3].matchRecord, undefined);

	const round3Lower = swissBracket.data.roundNodes.get("0-2") as RoundNode;
	assertEquals(round3Lower.matches[0].matchRecord, undefined);
	assertEquals(round3Lower.matches[1].matchRecord, undefined);

	const round4Upper = swissBracket.data.roundNodes.get("2-1") as RoundNode;
	assertEquals(round4Upper.matches[0].matchRecord, undefined);
	assertEquals(round4Upper.matches[1].matchRecord, undefined);
	assertEquals(round4Upper.matches[2].matchRecord, undefined);

	// start filling out from beginning
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
});

Deno.test(function naRegional4Test3() {
	const tournamentPath = "./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_4.json";
	const tournament: TournamentData = getJsonSync(tournamentPath);
	const swissBracket = new SwissBracket(16, 3);

	// fill out bracket
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

	// fill it out again
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
});

Deno.test(function naRegional5Test1() {
	testTournament("./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_5.json");
});

Deno.test(function naRegional6Test1() {
	testTournament("./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_6.json");
});

Deno.test(function drawTest1() {
	const swissBracket = new SwissBracket(16, 3);
	const numMatches = swissBracket.data.rootRound.matches.length;
	for (let i = 0; i < numMatches; i++) {
		const mr = swissBracket.getMatchRecord("0-0", i);
		if (!mr) {
			throw new Error("match record DNE when it should");
		}

		mr.upperTeamWins = 1;

		swissBracket.setMatchRecord("0-0", i, mr);
	}

	const round2Upper = swissBracket.data.roundNodes.get("1-0");
	assertEquals(round2Upper!.matches[0].matchRecord?.upperTeam.seed, 1);
	assertEquals(round2Upper!.matches[0].matchRecord?.lowerTeam.seed, 8);

	const mr = swissBracket.getMatchRecord("0-0", 0);
	const round1 = swissBracket.data.roundNodes.get("0-0");
	mr!.lowerTeamWins = 1;
	swissBracket.setMatchRecord("0-0", 0, mr!);
	assertEquals(round1?.matches[0].matchRecord?.upperTeamWins, 1);
	assertEquals(round1?.matches[0].matchRecord?.lowerTeamWins, 1);
	// TODO, when a user enters data that causes a draw, future rounds should be erased because they are no longer valid
	// since they cannot be calculated until the current round is filled out.
	// console.log(round2Upper!.matches[0].matchRecord);
});

Deno.test(function matchRecordTest1() {
	const swissBracket = new SwissBracket(16, 3);
	const numMatches = swissBracket.data.rootRound.matches.length;
	for (let i = 0; i < numMatches; i++) {
		const mr = swissBracket.getMatchRecord("0-0", i);
		if (!mr) {
			throw new Error("match record DNE when it should");
		}

		mr.upperTeamWins = 2;

		swissBracket.setMatchRecord("0-0", i, mr);
	}

	const seed1 = swissBracket.data.rootRound.matches[0].matchRecord!.upperTeam;
	const seed1History = swissBracket.getMatchHistory(seed1.seed);
	const seed1MatchDiff = seed1.getMatchDifferential(seed1History);
	const seed1GameDiff = seed1.getGameDifferential(seed1History);
	assertEquals(seed1MatchDiff, 1);
	assertEquals(seed1GameDiff, 2);
});

// For some reason, the initial matchups are created using a different seeding system.
// traditionally, round1 match1 is seed 1 vs seed 16.
// in this tournament it is seed 1 vs seed 15.
// in other words, the order of teams in round1 matches does NOT match the actual inital seed
// which leads to erroneous results
// this is why the other tests pass but this does not
/*
Deno.test(function euRegional1Test1() {
	const tournamentPath = "./data/RLCS_2024_-_Major_1_Europe_Open_Qualifier_1.json";
	const tournament: TournamentData = getJsonSync(tournamentPath);
	const swissBracket = new SwissBracket(16, 3);
	populateMatchRecordFromData(swissBracket, tournament, "0-0");

	// TODO round 1-0 is incorrect
	printRound(swissBracket.roundNodes.get("0-0")!.matches, tournament.teamNames);
	console.log();
	printRound(swissBracket.roundNodes.get("1-0")!.matches, tournament.teamNames);

	const red = swissBracket.rootRound.matches[5].matchRecord?.lowerTeam;
	console.log(red?.seed);
	// TODO match differential is not calculated correctly here.
	console.log(swissBracket.getMatchHistory(red!.seed));
	// TODO match differential else clause for when record is tied is not handeled correctly
	console.log(red?.getMatchDifferential(swissBracket.getMatchHistory(red.seed)));
	// checkVersusData(swissBracket, tournament, "1-0");
	// checkVersusData(swissBracket, tournament, "0-1");

	// populateMatchRecordFromData(swissBracket, tournament, "1-0");
	// populateMatchRecordFromData(swissBracket, tournament, "0-1");

	// checkVersusData(swissBracket, tournament, "2-0");
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
*/
