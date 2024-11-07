import { createEmptyMatches, createTeams, SwissBracket } from "../SwissBracket.ts";
import { MatchRecord, MatchRecordSerialized, Team } from "../models.ts";
import { getJsonSync } from "./file.ts";
import { evaluationSort, populateMatches } from "../SwissBracket.ts";
import { assertEquals } from "@std/assert/equals";

export function evaluationSortTest(numTeams: number, name: string, filePath: string) {
	const teams = createTeams(numTeams);
	const matches = createEmptyMatches(numTeams / 2, name);

	const f: MatchRecordSerialized[] = getJsonSync(filePath);
	populateMatchRecords(teams, f);
	const matchups = evaluationSort(teams);
	populateMatches(matches, matchups);
	return matches;
}

export function populateMatchRecords(teams: Team[], data: MatchRecordSerialized[]) {
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

export function checkVersusData(
	swissBracket: SwissBracket,
	// deno-lint-ignore no-explicit-any
	tournament: any,
	roundName: string,
) {
	const roundNode = swissBracket.roundNodes.get(roundName);
	if (!roundNode) {
		throw new Error("roundNode doesn't exist when it should");
	}
	const numMatches = roundNode.matches.length;
	for (let j = 0; j < numMatches; j++) {
		const calculated = swissBracket.getMatchRecord(roundName, j + 1);
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
	roundName: string,
) {
	const roundNode = swissBracket.roundNodes.get(roundName);
	if (!roundNode) {
		throw new Error("roundNode doesn't exist when it should");
	}
	const numMatches = roundNode.matches.length;
	for (let i = 0; i < numMatches; i++) {
		const mr = swissBracket.getMatchRecord(roundName, i + 1);
		if (!mr) {
			throw new Error("match record DNE when it should");
		}

		mr.lowerTeamWins = tournament[roundName][i].lowerTeamWins;
		mr.upperTeamWins = tournament[roundName][i].upperTeamWins;

		swissBracket.setMatchRecord(roundName, i + 1, mr);
	}
}
