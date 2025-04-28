import { assertEquals } from "@std/assert";
import { getSeedOrUndefined } from "../src/util/util.ts";
import {
	FullRecordFactory,
	LowerRecordFactory,
	UpperRecordFactory,
} from "../src/models/match_record.ts";

Deno.test(function getSeedOrUndefinedOnUndefined() {
	const matchRecord = undefined;
	const res = getSeedOrUndefined(matchRecord);
	assertEquals(res, undefined);
});

Deno.test(function getSeedOrUndefinedOnUpperRecord() {
	const matchRecord = UpperRecordFactory(1);
	const res = getSeedOrUndefined(matchRecord);
	assertEquals(res, undefined);
});

Deno.test(function getSeedOrUndefinedOnLowerRecord() {
	const matchRecord = LowerRecordFactory(1);
	const res = getSeedOrUndefined(matchRecord);
	assertEquals(res, undefined);
});

Deno.test(function getSeedOrUndefinedOnFullRecordWithUpperSeedWinner() {
	const matchRecord = FullRecordFactory(1, 2);
	matchRecord.upperSeedWins = 1;
	matchRecord.lowerSeedWins = 0;
	const res = getSeedOrUndefined(matchRecord);
	assertEquals(res, 1);
});

Deno.test(function getSeedOrUndefinedOnFullRecordWithLowerSeedWinner() {
	const matchRecord = FullRecordFactory(1, 2);
	matchRecord.upperSeedWins = 0;
	matchRecord.lowerSeedWins = 1;
	const res = getSeedOrUndefined(matchRecord);
	assertEquals(res, 2);
});
