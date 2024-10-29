import { createEmptyMatches, createTeams } from "../SwissBracket.ts";
import { MatchRecord, MatchRecordSerialized, Team } from "../models.ts";
import { getJsonSync } from "./file.ts";
import { evaluationSort, populateMatches } from "../SwissBracket.ts";

export function evaluationSortTest(numTeams: number, name: string, filePath: string) {
	const teams = createTeams(numTeams);
	const matches = createEmptyMatches(numTeams / 2, name);

	const f: MatchRecordSerialized[] = getJsonSync(filePath);
	populateMatchRecords(teams, f);
	evaluationSort(teams);
	populateMatches(matches, teams);
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
