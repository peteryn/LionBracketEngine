import { Match, TeamNameMap } from "../models.ts";

export function cartesianProduct<Type>(a: Type[], b: Type[]) {
	return a.flatMap((x) => b.map((y) => [x, y]));
}

export function printRound(matches: Match[], teamNameMap?: TeamNameMap[]) {
	if (teamNameMap) {
		for (const match of matches) {
			console.log(
				`${teamNameMap[match.matchRecord!.upperTeam.seed - 1].name} vs ${
					teamNameMap[match.matchRecord!.lowerTeam.seed - 1].name
				}`
			);
		}
	} else {
		for (const match of matches) {
			console.log(
				`${match.matchRecord?.upperTeam.seed} vs ${match.matchRecord?.lowerTeam.seed}`
			);
		}
	}
}
