import { TFile } from 'obsidian';
import { BUILTIN_QUOTES, QuoteCategory, QuoteItem, QuoteLanguage } from '../data/quotes';
import { WidgetDefinition } from '../types';
import { base, readParams, text } from '../utils';

const categories = ['motivation', 'sagesse', 'science', 'littérature', 'humour'] as const;
const sources = ['builtin', 'file', 'inline'] as const;
const modes = ['daily', 'random'] as const;

function localDateKey(date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function localDayIndex(dateKey: string): number {
	const [year, month, day] = dateKey.split('-').map(Number);
	return Math.floor(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1) / 86400000);
}

function hash(value: string): number {
	let result = 2166136261;
	for (let index = 0; index < value.length; index += 1) {
		result ^= value.charCodeAt(index);
		result = Math.imul(result, 16777619);
	}
	return result >>> 0;
}

function shuffle<T>(items: T[], seed: number): T[] {
	const result = [...items];
	let state = seed || 1;
	for (let index = result.length - 1; index > 0; index -= 1) {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		const swapIndex = state % (index + 1);
		[result[index], result[swapIndex]] = [result[swapIndex] as T, result[index] as T];
	}
	return result;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string' && ['true', 'false'].includes(value.toLowerCase())) return value.toLowerCase() === 'true';
	return fallback;
}

function parseInlineQuotes(value: unknown): QuoteItem[] {
	if (!Array.isArray(value)) throw new Error('Le paramètre quotes doit être une liste YAML.');
	return value.map((entry, index) => {
		if (typeof entry === 'string') return { text: entry.trim(), author: 'Anonyme', lang: 'fr', category: 'motivation' };
		if (!entry || typeof entry !== 'object') throw new Error(`Citation inline invalide à la position ${index + 1}.`);
		const item = entry as Record<string, unknown>;
		const quoteText = text(item.text, '');
		if (!quoteText) throw new Error(`La citation inline ${index + 1} n’a pas de texte.`);
		const lang = text(item.lang, 'fr');
		const category = text(item.category, 'motivation');
		if (!['fr', 'en'].includes(lang) || !categories.includes(category as QuoteCategory)) throw new Error(`Langue ou catégorie invalide pour la citation inline ${index + 1}.`);
		return { text: quoteText, author: text(item.author, 'Anonyme'), lang: lang as QuoteLanguage, category: category as QuoteCategory };
	});
}

async function readFileQuotes(ctx: Parameters<WidgetDefinition['render']>[2], filePath: string): Promise<QuoteItem[]> {
	const file = ctx.app.vault.getAbstractFileByPath(filePath);
	if (!(file instanceof TFile)) throw new Error(`Fichier de citations introuvable : ${filePath}`);
	const contents = await ctx.app.vault.read(file);
	return contents.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
		const separator = line.match(/\s+—\s+/);
		const [quoteText, author] = separator ? line.split(separator[0], 2) : [line, 'Anonyme'];
		return { text: quoteText?.trim() ?? line, author: author?.trim() || 'Anonyme', lang: 'fr', category: 'motivation' };
	});
}

function filterQuotes(quotes: QuoteItem[], language: string, category: string): QuoteItem[] {
	if (!['fr', 'en', 'all'].includes(language)) throw new Error('Langue invalide : utilisez fr, en ou all.');
	if (category !== 'all' && !categories.includes(category as QuoteCategory)) throw new Error('Catégorie invalide : utilisez motivation, sagesse, science, littérature, humour ou all.');
	const filtered = quotes.filter((quote) => (language === 'all' || quote.lang === language) && (category === 'all' || quote.category === category));
	if (!filtered.length) throw new Error('Aucune citation ne correspond aux filtres sélectionnés.');
	return filtered;
}

function chooseDaily(quotes: QuoteItem[], dateKey: string): QuoteItem {
	const day = localDayIndex(dateKey);
	const cycle = Math.floor(day / quotes.length);
	const position = ((day % quotes.length) + quotes.length) % quotes.length;
	const shuffled = shuffle(quotes, hash(`${cycle}:${quotes.map((quote) => `${quote.text}|${quote.author}`).join('\n')}`));
	const selected = shuffled[position] ?? quotes[0];
	if (!selected) throw new Error('Impossible de sélectionner une citation.');
	return selected;
}

function nextMidnightDelay(): number {
	const now = new Date();
	const next = new Date(now);
	next.setHours(24, 0, 0, 25);
	return Math.max(1000, next.getTime() - now.getTime());
}

function cssColor(value: unknown, fallback: string, warning: string[]): string {
	const raw = text(value, fallback);
	const aliases: Record<string, string> = { accent: 'var(--interactive-accent)', muted: 'var(--text-muted)', normal: 'var(--text-normal)' };
	if (aliases[raw]) return aliases[raw];
	if (typeof CSS !== 'undefined' && CSS.supports('color', raw)) return raw;
	warning.push(`Couleur invalide : ${raw}`);
	return fallback;
}

function cssSize(value: unknown, fallback: string, warning: string[]): string {
	const raw = text(value, fallback);
	const presets: Record<string, string> = { small: '.95em', medium: '1.15em', large: '1.35em' };
	if (presets[raw]) return presets[raw];
	if (typeof CSS !== 'undefined' && CSS.supports('font-size', raw)) return raw;
	warning.push(`Taille invalide : ${raw}`);
	return fallback;
}

function fontFamily(value: unknown, fallback: string, warning: string[]): string {
	const raw = text(value, fallback);
	const presets: Record<string, string> = {
		serif: 'Georgia, var(--font-text)', sans: 'var(--font-text)', mono: 'var(--font-monospace)', elegant: 'Palatino, Georgia, serif', handwriting: '"Segoe Print", "Bradley Hand", cursive',
	};
	if (presets[raw]) return presets[raw];
	if (/^[\w -]{1,80}$/.test(raw)) return `'${raw.replaceAll("'", '')}', var(--font-text), sans-serif`;
	warning.push(`Police invalide : ${raw}`);
	return presets[fallback] ?? fallback;
}

function cssWeight(value: unknown, fallback: string, warning: string[]): string {
	const raw = text(value, fallback);
	if (raw === 'normal' || raw === 'bold' || /^(?:[1-8]00|900)$/.test(raw)) return raw;
	warning.push(`Graisse invalide : ${raw}`);
	return fallback;
}

function cssStyle(value: unknown, fallback: string, warning: string[]): string {
	const raw = text(value, fallback);
	if (raw === 'normal' || raw === 'italic') return raw;
	warning.push(`Style invalide : ${raw}`);
	return fallback;
}

function cssAlign(value: unknown, fallback: string, warning: string[]): string {
	const raw = text(value, fallback);
	if (raw === 'left' || raw === 'center') return raw;
	warning.push(`Alignement invalide : ${raw}`);
	return fallback;
}

const quote: WidgetDefinition = { id: 'quote', name: 'Citation du jour', description: 'Une citation locale qui change chaque jour.', category: 'Fun', icon: '', defaultCode: '```quote\nmode: daily\nlang: fr\nfont: elegant\nsize: large\nweight: normal\nstyle: italic\nalign: left\ntext-color: normal\nborder-color: accent\nbar-color: accent\nbackground: transparent\nauthor: true\nauthor-style: normal\nauthor-color: muted\n```', async render(source, el, ctx) {
	const params = readParams(source);
	const sourceName = text(params.source, 'builtin');
	const language = text(params.lang, 'fr');
	const category = text(params.category, 'all');
	const mode = text(params.mode, 'daily');
	if (!sources.includes(sourceName as typeof sources[number])) throw new Error('Source invalide : utilisez builtin, file ou inline.');
	if (!modes.includes(mode as typeof modes[number])) throw new Error('Mode invalide : utilisez daily ou random.');
	const root = base(el, params, ctx, 'widget-quote');
	const warning: string[] = [];
	const settings = ctx.settings;
	const authorEnabled = parseBoolean(params.author, settings.quoteAuthor);
	const frame = root.createDiv({ cls: 'widget-quote-frame' });
	const bar = frame.createDiv({ cls: 'widget-quote-bar', attr: { 'aria-hidden': 'true' } });
	const content = frame.createDiv({ cls: 'widget-quote-content' });
	const border = parseBoolean(params.border, settings.quoteBorder);
	const barEnabled = parseBoolean(params.bar, settings.quoteBar);
	root.style.setProperty('--quote-font', fontFamily(params.font, settings.quoteFont, warning));
	root.style.setProperty('--quote-size', cssSize(params.size, settings.quoteSize, warning));
	root.style.setProperty('--quote-weight', cssWeight(params.weight, settings.quoteWeight, warning));
	root.style.setProperty('--quote-style', cssStyle(params.style, settings.quoteStyle, warning));
	root.style.setProperty('--quote-align', cssAlign(params.align, settings.quoteAlign, warning));
	root.style.setProperty('--quote-text-color', cssColor(params['text-color'], settings.quoteTextColor, warning));
	root.style.setProperty('--quote-author-font', fontFamily(params['author-font'], settings.quoteAuthorFont, warning));
	root.style.setProperty('--quote-author-size', cssSize(params['author-size'], settings.quoteAuthorSize, warning));
	root.style.setProperty('--quote-author-weight', cssWeight(params['author-weight'], settings.quoteAuthorWeight, warning));
	root.style.setProperty('--quote-author-style', cssStyle(params['author-style'], settings.quoteAuthorStyle, warning));
	root.style.setProperty('--quote-author-color', cssColor(params['author-color'], settings.quoteAuthorColor, warning));
	root.style.setProperty('--quote-border-color', cssColor(params['border-color'] ?? params.color, settings.quoteBorderColor, warning));
	root.style.setProperty('--quote-bar-color', cssColor(params['bar-color'] ?? params.color, settings.quoteBarColor, warning));
	root.style.setProperty('--quote-background', cssColor(params.background, settings.quoteBackground, warning));
	root.style.setProperty('--quote-border-width', border ? '1px' : '0');
	root.style.setProperty('--quote-bar-width', barEnabled ? '3px' : '0');
	let randomQuote: QuoteItem | undefined;
	let lastDate = localDateKey();

	const loadQuotes = async (): Promise<QuoteItem[]> => {
		if (sourceName === 'builtin') return BUILTIN_QUOTES;
		if (sourceName === 'inline') return parseInlineQuotes(params.quotes);
		return readFileQuotes(ctx, text(params.file, 'Citations.md'));
	};
	const renderCurrent = async (): Promise<void> => {
		const quotes = filterQuotes(await loadQuotes(), language, category);
		const dateKey = localDateKey();
		if (mode === 'random' && !randomQuote) randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
		const item = mode === 'daily' ? chooseDaily(quotes, dateKey) : randomQuote;
		if (!item) throw new Error('Impossible de sélectionner une citation.');
		content.empty();
		content.createEl('blockquote', { text: item.text });
		if (authorEnabled) content.createDiv({ cls: 'widget-quote-author', text: `— ${item.author || 'Anonyme'}` });
		bar.toggleAttribute('hidden', !barEnabled);
		lastDate = dateKey;
	};
	const safeRender = () => { void renderCurrent().catch((error: unknown) => content.setText(String(error))); };

	await renderCurrent();
	const checkDate = () => { if (localDateKey() !== lastDate) { randomQuote = undefined; safeRender(); } };
	ctx.addInterval(checkDate, 60000);
	ctx.addTimeout?.(() => { checkDate(); }, nextMidnightDelay());
	ctx.addWindowEvent?.('focus', checkDate);
	ctx.addWindowEvent?.('visibilitychange', checkDate);
	if (sourceName === 'file') ctx.addVaultModify?.((file) => { const path = file && typeof file === 'object' && 'path' in file ? String(file.path) : ''; if (path === text(params.file, 'Citations.md')) { randomQuote = undefined; safeRender(); } });
	if (warning.length) root.createDiv({ cls: 'widget-quote-warning', text: warning.join(' · ') });
} };

export default quote;
