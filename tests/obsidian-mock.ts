export function parseYaml(source: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const line of source.split(/\r?\n/)) {
		const match = line.match(/^\s*([^:#]+):\s*(.*)$/);
		if (!match) continue;
		const value = match[2]?.trim() ?? '';
		result[match[1]?.trim() ?? ''] = value.replace(/^['"]|['"]$/g, '');
	}
	return result;
}
