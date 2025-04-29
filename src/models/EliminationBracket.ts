import { isFilledMatch, levelOrderTraversal } from "../util/util.ts";
import { FullRecord, MatchRecord, Seed } from "./match_record.ts";
import { GenericMatchNode } from "./generic_match_node.ts";

export class EliminationBracket<NodeNames extends string> {
	updateFlow(root: GenericMatchNode<NodeNames>): void {
		if (!root.matchRecord) {
			return;
		}

		const matchRecord = root.matchRecord;
		switch (matchRecord.type) {
			case "UpperRecord":
			case "LowerRecord":
				break;
			case "FullRecord":
				// this.clearDependents(root.upperRound, matchRecord.upperSeed, matchRecord.lowerSeed);
				// this.clearDependents(root.lowerRound, matchRecord.upperSeed, matchRecord.lowerSeed);
				this.clearDependents2(root.upperRound, [
					matchRecord.upperSeed,
					matchRecord.lowerSeed,
				]);
				this.clearDependents2(root.lowerRound, [
					matchRecord.upperSeed,
					matchRecord.lowerSeed,
				]);
				this.handleScores(root, matchRecord);
		}
	}

	handleScores(root: GenericMatchNode<NodeNames>, matchRecord: FullRecord) {
		if (matchRecord.upperSeedWins > matchRecord.lowerSeedWins) {
			this.updateRound(root.upperRound, matchRecord.upperSeed, root.isUpper);
			this.updateRound(root.lowerRound, matchRecord.lowerSeed, true);
		}
		if (matchRecord.upperSeedWins < matchRecord.lowerSeedWins) {
			this.updateRound(root.upperRound, matchRecord.lowerSeed, root.isUpper);
			this.updateRound(root.lowerRound, matchRecord.upperSeed, true);
		}
	}

	updateRound(round: GenericMatchNode<NodeNames> | undefined, seed: number, isUpper: boolean) {
		if (round) {
			round.matchRecord = this.processTeam(round.matchRecord, seed, isUpper);
		}
	}

	processTeam(
		matchRecord: MatchRecord | undefined,
		curSeed: Seed,
		fromUpper: boolean,
	): MatchRecord | undefined {
		if (!matchRecord) {
			// there needs to be another condition to determine if you are lowerRound1 or upperQuarterFinal1
			if (fromUpper) {
				return {
					type: "UpperRecord",
					upperSeed: curSeed,
					upperSeedWins: 0,
				};
			} else {
				return {
					type: "LowerRecord",
					lowerSeed: curSeed,
					lowerSeedWins: 0,
				};
			}
		}
		switch (matchRecord.type) {
			case "UpperRecord":
				return {
					type: "FullRecord",
					upperSeed: matchRecord.upperSeed,
					upperSeedWins: matchRecord.upperSeedWins,
					lowerSeed: curSeed,
					lowerSeedWins: 0,
				};
			case "LowerRecord":
				return {
					type: "FullRecord",
					upperSeed: curSeed,
					upperSeedWins: 0,
					lowerSeed: matchRecord.lowerSeed,
					lowerSeedWins: matchRecord.lowerSeedWins,
				};
			case "FullRecord":
				// undefined bc this is an impossible state since we cleared dependents
				// the compiler just doesn't know it yet.
				return undefined;
		}
	}

	clearDependents(
		root: GenericMatchNode<NodeNames> | undefined,
		upperSeed: Seed,
		lowerSeed: Seed,
	) {
		if (!root) {
			return;
		}

		const update = (node: GenericMatchNode<NodeNames>) => {
			const mr = node.matchRecord;
			if (!mr) {
				return;
			}

			switch (mr.type) {
				case "UpperRecord":
					if (mr.upperSeed === upperSeed || mr.upperSeed === lowerSeed) {
						node.matchRecord = undefined;
					}
					break;
				case "LowerRecord":
					if (mr.lowerSeed === lowerSeed || mr.lowerSeed === upperSeed) {
						node.matchRecord = undefined;
					}
					break;
				case "FullRecord":
					if (mr.upperSeed === upperSeed || mr.upperSeed === lowerSeed) {
						node.matchRecord = {
							type: "LowerRecord",
							lowerSeed: mr.lowerSeed,
							// potentially want to reset this to 0 if we deem their previous
							// guess invalid when the match up changes
							lowerSeedWins: 0,
						};
					}
					if (mr.lowerSeed === lowerSeed || mr.lowerSeed === upperSeed) {
						node.matchRecord = {
							type: "UpperRecord",
							upperSeed: mr.upperSeed,
							upperSeedWins: 0,
						};
					}
			}
		};
		levelOrderTraversal<GenericMatchNode<NodeNames>>(root, update);
	}

	clearDependents2(
		root: GenericMatchNode<NodeNames> | undefined,
		possibleSeeds: Seed[],
	) {
		if (!root) {
			return;
		}
		const mr = root.matchRecord;
		if (!mr) {
			return;
		}

		switch (mr.type) {
			case "UpperRecord": {
				possibleSeeds.forEach((seed) => {
					if (mr.upperSeed === seed) {
						root.matchRecord = undefined;
					}
				});
				break;
			}
			case "LowerRecord": {
				possibleSeeds.forEach((seed) => {
					if (mr.lowerSeed === seed) {
						root.matchRecord = undefined;
					}
				});
				break;
			}
			case "FullRecord": {
				const recurse = isFilledMatch(mr);
				const potentialSeeds = structuredClone(possibleSeeds);
				possibleSeeds.forEach((seed) => {
					if (mr.upperSeed === seed) {
						root.matchRecord = {
							type: "LowerRecord",
							lowerSeed: mr.lowerSeed,
							// potentially want to reset this to 0 if we deem their previous
							// guess invalid when the match up changes
							lowerSeedWins: 0,
						};
						potentialSeeds.push(mr.lowerSeed);
					}
					if (mr.lowerSeed === seed) {
						root.matchRecord = {
							type: "UpperRecord",
							upperSeed: mr.upperSeed,
							upperSeedWins: 0,
						};
						potentialSeeds.push(mr.upperSeed);
					}
				});
				if (recurse) {
					this.clearDependents2(root.upperRound, potentialSeeds);
					this.clearDependents2(root.lowerRound, potentialSeeds);
				}
			}
		}
	}
}
