import { assertEquals } from "@std/assert";
import { TournamentData, type MatchRecordSerialized } from "./models.ts";
import { getJsonSync } from "./util/file.ts";
import {
	checkVersusData,
	populateMatchRecordFromData,
	testTournament,
} from "./util/testFunctions.ts";
import { RoundNode } from "../src/models/round_node.ts";
import { MatchRecord } from "../src/models/match_record.ts";
import { SwissBracketFlow } from "../src/swiss_bracket/swiss_backet_flow.ts";
import { Bracket } from "../src/models/bracket.ts";

Deno.test(function structureTest1() {
	const swissBracket = new SwissBracketFlow(16, 3);
	const rootRound = swissBracket.rootRound;
	assertEquals(rootRound.level, 1);
	assertEquals(rootRound.has2Parents, false);
	assertEquals(rootRound.matches[0].matchRecord?.upperSeed, 1);
	assertEquals(rootRound.matches[0].matchRecord?.lowerSeed, 16);
	assertEquals(rootRound.matches[1].matchRecord?.upperSeed, 2);
	assertEquals(rootRound.matches[1].matchRecord?.lowerSeed, 15);
	assertEquals(swissBracket.getRoundNode("0-0")?.name, swissBracket.rootRound.name);

	const round2Upper = rootRound.upperRound;
	const round2Lower = rootRound.lowerRound;
	assertEquals(swissBracket.getRoundNode("1-0")?.name, round2Upper?.name);
	assertEquals(swissBracket.getRoundNode("0-1")?.name, round2Lower?.name);
	assertEquals(round2Upper?.level, 2);
	assertEquals(round2Lower?.level, 2);
	assertEquals(round2Upper?.has2Parents, false);
	assertEquals(round2Lower?.has2Parents, false);
	assertEquals(round2Upper?.matches.length, 4);
	assertEquals(round2Lower?.matches.length, 4);

	const round3Upper = round2Upper?.upperRound;
	const round3Middle = round2Upper?.lowerRound;
	const round3Lower = round2Lower?.lowerRound;
	assertEquals(swissBracket.getRoundNode("2-0")?.name, round3Upper?.name);
	assertEquals(swissBracket.getRoundNode("1-1")?.name, round3Middle?.name);
	assertEquals(swissBracket.getRoundNode("0-2")?.name, round3Lower?.name);
	assertEquals(round3Upper?.level, 3);
	assertEquals(round3Middle?.level, 3);
	assertEquals(round3Lower?.level, 3);
	assertEquals(round3Upper?.has2Parents, false);
	assertEquals(round3Middle?.has2Parents, true);
	assertEquals(round3Lower?.has2Parents, false);
	assertEquals(round3Upper?.matches.length, 2);
	assertEquals(round3Middle?.matches.length, 4);
	assertEquals(round3Lower?.matches.length, 2);

	const round4Upper = round3Upper?.lowerRound;
	const round4Lower = round3Lower?.upperRound;
	assertEquals(swissBracket.getRoundNode("2-1")?.name, round4Upper?.name);
	assertEquals(swissBracket.getRoundNode("1-2")?.name, round4Lower?.name);
	assertEquals(round4Upper?.level, 4);
	assertEquals(round4Lower?.level, 4);
	assertEquals(round4Upper?.has2Parents, true);
	assertEquals(round4Lower?.has2Parents, true);
	assertEquals(round4Upper?.matches.length, 3);
	assertEquals(round4Lower?.matches.length, 3);

	const round5 = round4Lower?.upperRound;
	assertEquals(swissBracket.getRoundNode("2-2")?.name, round5?.name);
	assertEquals(round5?.level, 5);
	assertEquals(round5?.has2Parents, true);
	assertEquals(round5?.matches.length, 3);
});

Deno.test(function computeRound1() {
	const swissBracket = new SwissBracketFlow(16, 2);
	const f: MatchRecordSerialized[] = getJsonSync("./data/round1UpperTestData1.json");
	for (let index = 0; index < f.length; index++) {
		const matchRecordS = f[index];
		const mr = swissBracket.getMatchRecord("0-0", index);
		if (mr) {
			mr.lowerSeedWins = matchRecordS.lowerSeedWins;
			mr.upperSeedWins = matchRecordS.upperSeedWins;
			swissBracket.setMatchRecord("0-0", index, mr);
		} else {
			throw new Error("Match record doesn't exist when it should");
		}
	}
	const round1 = swissBracket.rootRound;
	const round2Upper = round1.upperRound;
	const round2Lower = round1.lowerRound;
	assertEquals(round2Upper?.matches[0].matchRecord?.upperSeed, 1);
	assertEquals(round2Upper?.matches[0].matchRecord?.lowerSeed, 8);

	assertEquals(round2Upper?.matches[1].matchRecord?.upperSeed, 2);
	assertEquals(round2Upper?.matches[1].matchRecord?.lowerSeed, 7);

	assertEquals(round2Upper?.matches[2].matchRecord?.upperSeed, 3);
	assertEquals(round2Upper?.matches[2].matchRecord?.lowerSeed, 6);

	assertEquals(round2Upper?.matches[3].matchRecord?.upperSeed, 4);
	assertEquals(round2Upper?.matches[3].matchRecord?.lowerSeed, 5);

	assertEquals(round2Lower?.matches[0].matchRecord?.upperSeed, 9);
	assertEquals(round2Lower?.matches[0].matchRecord?.lowerSeed, 16);

	assertEquals(round2Lower?.matches[1].matchRecord?.upperSeed, 10);
	assertEquals(round2Lower?.matches[1].matchRecord?.lowerSeed, 15);

	assertEquals(round2Lower?.matches[2].matchRecord?.upperSeed, 11);
	assertEquals(round2Lower?.matches[2].matchRecord?.lowerSeed, 14);

	assertEquals(round2Lower?.matches[3].matchRecord?.upperSeed, 12);
	assertEquals(round2Lower?.matches[3].matchRecord?.lowerSeed, 13);
});

Deno.test(function naRegional4Test1() {
	testTournament("./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_4.json");
});

Deno.test(function naRegional4Test2() {
	const tournamentPath = "./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_4.json";
	const tournament: TournamentData = getJsonSync(tournamentPath);
	const swissBracket = new SwissBracketFlow(16, 3);
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
	mr!.lowerSeedWins = 1;
	swissBracket.setMatchRecord("0-0", 1, mr!);

	// make sure that future rounds are now undefined
	const round3Upper = swissBracket.getRoundNode("2-0") as RoundNode;
	assertEquals(round3Upper.matches[0].matchRecord, undefined);
	assertEquals(round3Upper.matches[1].matchRecord, undefined);

	const round3Middle = swissBracket.getRoundNode("1-1") as RoundNode;
	assertEquals(round3Middle.matches[0].matchRecord, undefined);
	assertEquals(round3Middle.matches[1].matchRecord, undefined);
	assertEquals(round3Middle.matches[2].matchRecord, undefined);
	assertEquals(round3Middle.matches[3].matchRecord, undefined);

	const round3Lower = swissBracket.getRoundNode("0-2") as RoundNode;
	assertEquals(round3Lower.matches[0].matchRecord, undefined);
	assertEquals(round3Lower.matches[1].matchRecord, undefined);

	const round4Upper = swissBracket.getRoundNode("2-1") as RoundNode;
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
	const swissBracket = new SwissBracketFlow(16, 3);

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

Deno.test(function naRegional4BuchholzTest1() {
	const tournamentPath = "./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_4.json";
	const tournament: TournamentData = getJsonSync(tournamentPath);
	const swissBracket = new SwissBracketFlow(16, 3);

	// fill out bracket
	populateMatchRecordFromData(swissBracket, tournament, "0-0");

	populateMatchRecordFromData(swissBracket, tournament, "1-0");
	populateMatchRecordFromData(swissBracket, tournament, "0-1");

	populateMatchRecordFromData(swissBracket, tournament, "2-0");
	populateMatchRecordFromData(swissBracket, tournament, "1-1");
	populateMatchRecordFromData(swissBracket, tournament, "0-2");

	populateMatchRecordFromData(swissBracket, tournament, "2-1");
	populateMatchRecordFromData(swissBracket, tournament, "1-2");

	populateMatchRecordFromData(swissBracket, tournament, "2-2");

	assertEquals(swissBracket.getBuchholzScore(1), 0, "G2's buchholz ratings should be 0");
	assertEquals(swissBracket.getBuchholzScore(2), -1, "GenG's buchholz ratings should be -1");
	assertEquals(swissBracket.getBuchholzScore(12), -2, "Snowmen's buchholz ratings should be -2");
});

Deno.test(function drawTest1() {
	const swissBracket = new SwissBracketFlow(16, 3);
	const numMatches = swissBracket.rootRound.matches.length;
	// set all round 1 matches to 1-0
	for (let i = 0; i < numMatches; i++) {
		const mr = swissBracket.getMatchRecord("0-0", i);
		if (!mr) {
			throw new Error("match record DNE when it should");
		}

		mr.upperSeedWins = 1;

		swissBracket.setMatchRecord("0-0", i, mr);
	}

	// check r2 was generated correctly
	const round2Upper = swissBracket.getRoundNode("1-0");
	assertEquals(round2Upper!.matches[0].matchRecord?.upperSeed, 1);
	assertEquals(round2Upper!.matches[0].matchRecord?.lowerSeed, 8);

	// now get first match from round 1
	const mr = swissBracket.getMatchRecord("0-0", 0);
	const round1 = swissBracket.getRoundNode("0-0");
	// set it to 1-1 aka a draw
	mr!.lowerSeedWins = 1;
	swissBracket.setMatchRecord("0-0", 0, mr!);
	// check that the draw exists
	assertEquals(round1?.matches[0].matchRecord?.upperSeedWins, 1);
	assertEquals(round1?.matches[0].matchRecord?.lowerSeedWins, 1);
	// TODO, when a user enters data that causes a draw, future rounds should be erased because they are no longer valid
	// since they cannot be calculated until the current round is filled out.
	const r2UpperMatch1Mr = round2Upper!.matches[0].matchRecord;
	assertEquals(
		r2UpperMatch1Mr,
		undefined,
		"Since r1 has a draw, all future match records should not exist"
	);
});

Deno.test(function matchRecordTest1() {
	const swissBracket = new SwissBracketFlow(16, 3);
	const numMatches = swissBracket.rootRound.matches.length;
	for (let i = 0; i < numMatches; i++) {
		const mr = swissBracket.getMatchRecord("0-0", i);
		if (!mr) {
			throw new Error("match record DNE when it should");
		}

		mr.upperSeedWins = 2;

		swissBracket.setMatchRecord("0-0", i, mr);
	}

	const seed1 = swissBracket.rootRound.matches[0].matchRecord!.upperSeed;
	const seed1MatchDiff = swissBracket.getMatchDifferential(seed1);
	const seed1GameDiff = swissBracket.getGameDifferential(seed1);
	assertEquals(seed1MatchDiff, 1);
	assertEquals(seed1GameDiff, 2);
});

Deno.test(function inheritanceTest1() {
	const a = new SwissBracketFlow();
	a.setMatchRecord("0-0", 0, new MatchRecord(1, 2));

	// so even if we use polymorphism, this will call the the setMatchRecord
	// in the child class
	const b: Bracket = a;
	b.setMatchRecord("0-0", 0, new MatchRecord(1, 2));
});
