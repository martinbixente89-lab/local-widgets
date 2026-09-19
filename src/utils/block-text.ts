export interface CodeBlockRange { language: string; start: number; end: number; bodyStart: number; bodyEnd: number; }

export function findCodeBlocks(content: string, language: string): CodeBlockRange[] {
	const lines = content.split(/\r?\n/);
	const result: CodeBlockRange[] = [];
	for (let index = 0; index < lines.length; index += 1) {
		const opening = lines[index]?.match(/^\s*```([^\s`]*)\s*$/);
		if (!opening || opening[1]?.toLowerCase() !== language.toLowerCase()) continue;
		for (let end = index + 1; end < lines.length; end += 1) {
			if (!/^\s*```\s*$/.test(lines[end] ?? '')) continue;
			result.push({ language: opening[1], start: index, end, bodyStart: index + 1, bodyEnd: end - 1 });
			index = end;
			break;
		}
	}
	return result;
}

export function blockRank(content: string, language: string, startLine: number): number {
	const blocks = findCodeBlocks(content, language);
	const rank = blocks.findIndex((block) => block.start === startLine);
	return rank;
}

export function blockBody(content: string, block: CodeBlockRange): string {
	return content.split(/\r?\n/).slice(block.bodyStart, block.end).join('\n');
}

function yamlScalar(value: unknown, type: string): string {
	if (type === 'toggle') return value === true || value === 'true' ? 'true' : 'false';
	if (type === 'number') return Number.isFinite(Number(value)) ? String(value) : '0';
	const raw = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
	const specialCharacters = [' ', '\t', ':', '#', '"', "'", '{', '}', '[', ']', ',', '&', '*', '!', '|', '>', '=', '%', '@', '`'];
	const needsQuotes = specialCharacters.some((character) => raw.includes(character));
	if (!raw || needsQuotes || /^(?:true|false|null|~|[-+]?\d+(?:\.\d+)?)$/i.test(raw)) return JSON.stringify(raw);
	return raw;
}

export function writeBlockKey(content: string, block: CodeBlockRange, key: string, value: unknown, type: string): string {
	const lines = content.split(/\r?\n/);
	const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const pattern = new RegExp(`^(\\s*)${escaped}\\s*:`);
	const index = lines.findIndex((line, lineIndex) => lineIndex >= block.bodyStart && lineIndex <= block.bodyEnd && pattern.test(line));
	if (index >= 0) {
		const indent = lines[index]?.match(/^\s*/)?.[0] ?? '';
		lines[index] = `${indent}${key}: ${yamlScalar(value, type)}`;
	} else {
		lines.splice(block.end, 0, `${key}: ${yamlScalar(value, type)}`);
	}
	return lines.join('\n');
}

export function removeBlockKey(content: string, block: CodeBlockRange, key: string): string {
	const lines = content.split(/\r?\n/);
	const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const pattern = new RegExp(`^\\s*${escaped}\\s*:`);
	const index = lines.findIndex((line, lineIndex) => lineIndex >= block.bodyStart && lineIndex <= block.bodyEnd && pattern.test(line));
	if (index >= 0) lines.splice(index, 1);
	return lines.join('\n');
}
