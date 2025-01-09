import { SwissBracket } from "../../src/swiss_bracket/swiss_bracket.ts";
import { TournamentData } from "../models.ts";
import { getJsonSync } from "./file.ts";
import { assertEquals } from "@std/assert/equals";
import { SwissBracketFlow } from "../../src/swiss_bracket/swiss_backet_flow.ts";
import { getMatchId } from "../../src/models/match.ts";

export function checkVersusData(
	swissBracket: SwissBracket,
	// deno-lint-ignore no-explicit-any
	tournament: any,
	roundName: string
) {
	// const roundNode = swissBracket.data.roundNodes.get(roundName);
	const roundNode = swissBracket.getRoundNode(roundName);
	if (!roundNode) {
		throw new Error("roundNode doesn't exist when it should");
	}
	const numMatches = roundNode.matches.length;
	for (let j = 0; j < numMatches; j++) {
		const calculated = swissBracket.getMatchRecord(getMatchId(roundName, j));
		if (calculated) {
			const actualUpperSeed = calculated.upperSeed;
			const expectedUpperSeed = tournament[roundName][j].upperTeam.seed;
			const actualLowerSeed = calculated.lowerSeed;
			const expectedLowerSeed = tournament[roundName][j].lowerTeam.seed;
			assertEquals(actualUpperSeed, expectedUpperSeed);
			assertEquals(actualLowerSeed, expectedLowerSeed);
		} else {
			throw new Error(`match record doesn't exist when it should`);
		}
	}
}

export function populateMatchRecordFromData(
	swissBracket: SwissBracketFlow,
	// deno-lint-ignore no-explicit-any
	tournament: any,
	roundName: string
) {
	// const roundNode = swissBracket.data.roundNodes.get(roundName);
	const roundNode = swissBracket.getRoundNode(roundName);
	if (!roundNode) {
		throw new Error("roundNode doesn't exist when it should");
	}
	const numMatches = roundNode.matches.length;
	for (let i = 0; i < numMatches; i++) {
		const matchId = getMatchId(roundName, i);
		const mr = swissBracket.getMatchRecord(matchId);
		if (!mr) {
			throw new Error("match record DNE when it should");
		}

		mr.lowerSeedWins = tournament[roundName][i].lowerTeamWins;
		mr.upperSeedWins = tournament[roundName][i].upperTeamWins;

		swissBracket.setMatchRecord(matchId, mr);
		swissBracket.updateFlow(roundNode);
	}
}

export function testTournament(tournamentPath: string) {
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
}
