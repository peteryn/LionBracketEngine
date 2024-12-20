import { Match } from "@/models/match.ts";
import { TeamNameMap } from "../models.ts";

export function printRound(matches: Match[], teamNameMap?: TeamNameMap[]) {
	if (teamNameMap) {
		for (const match of matches) {
			console.log(
				`${teamNameMap[match.matchRecord!.upperSeed - 1].name} vs ${
					teamNameMap[match.matchRecord!.lowerSeed - 1].name
				}`
			);
		}
	} else {
		for (const match of matches) {
			console.log(`${match.matchRecord?.upperSeed} vs ${match.matchRecord?.lowerSeed}`);
		}
	}
}
