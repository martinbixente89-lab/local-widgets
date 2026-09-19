import { parseYaml } from 'obsidian';
import { WidgetDefinition } from './types';

export function normalizeParams(widget: WidgetDefinition, rawYaml: string): Record<string, unknown> {
	let parsed: Record<string, unknown> = {};
	try {
		const value = parseYaml(rawYaml) as unknown;
		if (value && typeof value === 'object' && !Array.isArray(value)) parsed = value as Record<string, unknown>;
	} catch { return {};
	}
	const normalized = { ...parsed };
	for (const field of widget.settings ?? []) if (!Object.prototype.hasOwnProperty.call(normalized, field.key)) normalized[field.key] = field.default;
	return normalized;
}
