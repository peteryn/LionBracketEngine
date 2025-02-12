import { assertEquals } from "@std/assert/equals";
import { Tournament } from "../src/major1/tournament.ts";
import { getMatchId } from "../src/models/match.ts";
import { FullRecord, UpperRecord } from "../src/models/match_record.ts";
import { TournamentData } from "./models.ts";
import { getJsonSync } from "./util/file.ts";
import { checkVersusData, populateMatchRecordFromData } from "./util/testFunctions.ts";

Deno.test(function upperSeedAflBracketInitializationTest1() {
	const tournament = new Tournament();
	for (let i = 0; i < 8; i++) {
		tournament.updateFlow(true, getMatchId("0-0", i), 1, 0);
	}
	for (let i = 0; i < 4; i++) {
		tournament.updateFlow(true, getMatchId("1-0", i), 1, 0);
	}
	for (let i = 0; i < 2; i++) {
		tournament.updateFlow(true, getMatchId("2-0", i), 1, 0);
	}

	const uqf1 = tournament.aflBracket.getRoundNode("upperQuarterFinal1");
	const uqf1MR = uqf1.match.matchRecord as UpperRecord;
	assertEquals(uqf1MR.upperSeed, 1);

	const uqf2 = tournament.aflBracket.getRoundNode("upperQuarterFinal2");
	const uqf2MR = uqf2.match.matchRecord as UpperRecord;
	assertEquals(uqf2MR.upperSeed, 2);
});

Deno.test(function naRegional4AflBracketInitializationTest() {
	const tournament = new Tournament();

	const tournamentPath = "./data/RLCS_2024_-_Major_2_North_America_Open_Qualifier_4.json";
	const tournamentData: TournamentData = getJsonSync(tournamentPath);
	const swissBracket = tournament.swissBracket;

	// fill out bracket
	populateMatchRecordFromData(swissBracket, tournamentData, "0-0");

	checkVersusData(swissBracket, tournamentData, "0-1");

	populateMatchRecordFromData(swissBracket, tournamentData, "1-0");
	populateMatchRecordFromData(swissBracket, tournamentData, "0-1");

	checkVersusData(swissBracket, tournamentData, "2-0");
	checkVersusData(swissBracket, tournamentData, "1-1");
	checkVersusData(swissBracket, tournamentData, "0-2");

	populateMatchRecordFromData(swissBracket, tournamentData, "2-0");
	populateMatchRecordFromData(swissBracket, tournamentData, "1-1");
	populateMatchRecordFromData(swissBracket, tournamentData, "0-2");

	checkVersusData(swissBracket, tournamentData, "2-1");
	checkVersusData(swissBracket, tournamentData, "1-2");

	populateMatchRecordFromData(swissBracket, tournamentData, "2-1");
	populateMatchRecordFromData(swissBracket, tournamentData, "1-2");

	checkVersusData(swissBracket, tournamentData, "2-2");

	// populateMatchRecordFromData(swissBracket, tournamentData, "2-2");
	tournament.updateFlow(true, getMatchId("2-2", 0), 3, 0);
	tournament.updateFlow(true, getMatchId("2-2", 1), 3, 1);
	tournament.updateFlow(true, getMatchId("2-2", 2), 3, 0);

	const uqf1 = tournament.aflBracket.getRoundNode("upperQuarterFinal1");
	const uqf1MR = uqf1.match.matchRecord as FullRecord;
	assertEquals(uqf1MR.upperSeed, 1);
	assertEquals(uqf1MR.lowerSeed, 4);

	const uqf2 = tournament.aflBracket.getRoundNode("upperQuarterFinal2");
	const uqf2MR = uqf2.match.matchRecord as FullRecord;
	assertEquals(uqf2MR.upperSeed, 12);
	assertEquals(uqf2MR.lowerSeed, 10);

	const lbr1 = tournament.aflBracket.getRoundNode("lowerBracketRound1");
	const lbr1MR = lbr1.match.matchRecord as FullRecord;
	assertEquals(lbr1MR.upperSeed, 7);
	assertEquals(lbr1MR.lowerSeed, 6);

	const lbr2 = tournament.aflBracket.getRoundNode("lowerBracketRound2");
	const lbr2MR = lbr2.match.matchRecord as FullRecord;
	assertEquals(lbr2MR.upperSeed, 2);
	assertEquals(lbr2MR.lowerSeed, 11);
});
