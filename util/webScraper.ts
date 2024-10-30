import { scrape } from "@panha/scrape/";
import { MatchRecord, Team } from "../models.ts";

const url =
	"https://liquipedia.net/rocketleague/Rocket_League_Championship_Series/2024/Major_2/North_America/Open_Qualifier_4";
const scraper = await scrape(url);
const res = scraper.text(".brkts-matchlist-cell-content");
// const res = scraper.html("h3");

const nameToSeed: Map<string, Team> = new Map();
let j = 1;
let k = 16;
for (let i = 0; i < 8 * 4; i += 4) {
	const t1 = res[i];
	const t2 = res[i + 3];
	const team1 = new Team(j);
	const team2 = new Team(k);
	nameToSeed.set(t1, team1);
	nameToSeed.set(t2, team2);
	j++;
	k--;
}

const round1: MatchRecord[] = [];
const round2Upper: MatchRecord[] = [];
const round2Lower: MatchRecord[] = [];
const round3Upper: MatchRecord[] = [];
const round3Middle: MatchRecord[] = [];
const round3Lower: MatchRecord[] = [];
const round4Upper: MatchRecord[] = [];
const round4Lower: MatchRecord[] = [];
const round5: MatchRecord[] = [];
const bracketSerialized = {
	"0-0": round1,
	"1-0": round2Upper,
	"0-1": round2Lower,
	"2-0": round3Upper,
	"1-1": round3Middle,
	"0-2": round3Lower,
	"2-1": round4Upper,
	"1-2": round4Lower,
	"2-2": round5,
};
for (let i = 0; i < res.length; i += 4) {
	const t1 = res[i];
	const t2 = res[i + 3];
	const team1 = nameToSeed.get(t1);
	const team2 = nameToSeed.get(t2);

	const s1 = res[i + 1];
	const s2 = res[i + 2];

	const mr = new MatchRecord(team1!, team2!);
	mr.upperTeamWins = parseInt(s1);
	mr.lowerTeamWins = parseInt(s2);
	if (i >= 0 && i < 8 * 4) {
		round1.push(mr);
	} else if (i >= 8 * 4 && i < 12 * 4) {
		round2Upper.push(mr);
	} else if (i >= 12 * 4 && i < 16 * 4) {
		round2Lower.push(mr);
	} else if (i >= 16 * 4 && i < 18 * 4) {
		round3Upper.push(mr);
	} else if (i >= 18 * 4 && i < 22 * 4) {
		round3Middle.push(mr);
	} else if (i >= 22 * 4 && i < 24 * 4) {
		round3Lower.push(mr);
	} else if (i >= 24 * 4 && i < 27 * 4) {
		round4Upper.push(mr);
	} else if (i >= 27 * 4 && i < 30 * 4) {
		round4Lower.push(mr);
	} else {
		round5.push(mr);
	}

	console.log(`Match Index: ${i / 4}: ${res[i]}: ${res[i + 1]}-${res[i + 2]}: ${res[i + 3]}`);
}
console.log(round1);
console.log();
console.log(round5);

// const title = scraper.html("#firstHeading");
// const title = scraper.attr("span", "dir");
const temp = scraper.text("h1>span");
const title = temp[0].replaceAll(" ", "_");
// const path = `./data/${title}.json`;
const path = "hi.json";
// await Deno.writeTextFile(`./data/${title}.json`, JSON.stringify(bracketSerialized));
await Deno.writeTextFile(path, JSON.stringify(bracketSerialized));
