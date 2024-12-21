import type { Match } from "../models/match.ts";
import { type Seed, MatchRecord } from "../models/match_record.ts";

export function cartesianProduct<Type>(a: Type[], b: Type[]) {
	return a.flatMap((x) => b.map((y) => [x, y]));
}

export function isFilledRound(matches: Match[]): boolean {
	for (let index = 0; index < matches.length; index++) {
		const matchRecord = matches[index].matchRecord;
		if (matchRecord) {
			const isFilledOut = matchRecord.upperSeedWins - matchRecord.lowerSeedWins !== 0;
			if (!isFilledOut) {
				return false;
			}
		}
	}
	return true;
}

export function getWinners(matches: Match[]) {
	const result: Seed[] = [];

	for (let index = 0; index < matches.length; index++) {
		const match = matches[index];
		if (match.matchRecord) {
			const mr = match.matchRecord;
			if (mr.upperSeedWins > mr.lowerSeedWins) {
				result.push(mr.upperSeed);
			} else if (mr.lowerSeedWins > mr.upperSeedWins) {
				result.push(mr.lowerSeed);
			}
		}
	}

	return result;
}

export function getLosers(matches: Match[]) {
	const result: Seed[] = [];

	for (let index = 0; index < matches.length; index++) {
		const match = matches[index];
		if (match.matchRecord) {
			const mr = match.matchRecord;
			if (mr.upperSeedWins < mr.lowerSeedWins) {
				result.push(mr.upperSeed);
			} else if (mr.lowerSeedWins < mr.upperSeedWins) {
				result.push(mr.lowerSeed);
			}
		}
	}

	return result;
}

export function populateMatches(matches: Match[], seeds: Seed[][]) {
	if (seeds.length !== matches.length) {
		throw new Error(
			`There must twice as many teams as matches. matches.length=${matches.length}, teams.length=${seeds.length}`
		);
	}

	for (let index = 0; index < seeds.length; index++) {
		const matchup = seeds[index];
		const seed1 = matchup[0];
		const seed2 = matchup[1];
		const record = new MatchRecord(seed1, seed2);
		matches[index].matchRecord = record;
	}
}
