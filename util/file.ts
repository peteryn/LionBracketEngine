export function getJsonSync(filePath: string) {
	return JSON.parse(Deno.readTextFileSync(filePath));
}
