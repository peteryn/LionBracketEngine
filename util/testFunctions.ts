import { SwissBracket } from "../SwissBracket.ts";
import { MatchRecord, MatchRecordSerialized, Team, TournamentData } from "../models.ts";
import { getJsonSync } from "./file.ts";
import { assertEquals } from "@std/assert/equals";

export function populateMatchRecords(teams: Team[], data: MatchRecordSerialized[]) {
	let i = 0;
	let j = teams.length - 1;
	while (i < j) {
		const record = new MatchRecord(teams[i], teams[j]);
		record.upperTeamWins = data[i].upperTeamWins;
		record.lowerTeamWins = data[i].lowerTeamWins;
		i++;
		j--;
	}
}

export function checkVersusData(
	swissBracket: SwissBracket,
	// deno-lint-ignore no-explicit-any
	tournament: any,
	roundName: string
) {
	const roundNode = swissBracket.data.roundNodes.get(roundName);
	if (!roundNode) {
		throw new Error("roundNode doesn't exist when it should");
	}
	const numMatches = roundNode.matches.length;
	for (let j = 0; j < numMatches; j++) {
		const calculated = swissBracket.getMatchRecord(roundName, j);
		if (calculated) {
			const actualUpperSeed = calculated.upperTeam.seed;
			const expectedUpperSeed = tournament[roundName][j].upperTeam.seed;
			const actualLowerSeed = calculated.lowerTeam.seed;
			const expectedLowerSeed = tournament[roundName][j].lowerTeam.seed;
			assertEquals(actualUpperSeed, expectedUpperSeed);
			assertEquals(actualLowerSeed, expectedLowerSeed);
		} else {
			throw new Error(`match record doesn't exist when it should`);
		}
	}
}

export function populateMatchRecordFromData(
	swissBracket: SwissBracket,
	// deno-lint-ignore no-explicit-any
	tournament: any,
	roundName: string
) {
	const roundNode = swissBracket.data.roundNodes.get(roundName);
	if (!roundNode) {
		throw new Error("roundNode doesn't exist when it should");
	}
	const numMatches = roundNode.matches.length;
	for (let i = 0; i < numMatches; i++) {
		const mr = swissBracket.getMatchRecord(roundName, i);
		if (!mr) {
			throw new Error("match record DNE when it should");
		}

		mr.lowerTeamWins = tournament[roundName][i].lowerTeamWins;
		mr.upperTeamWins = tournament[roundName][i].upperTeamWins;

		swissBracket.setMatchRecord(roundName, i, mr);
	}
}

export function testTournament(tournamentPath: string) {
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
}
