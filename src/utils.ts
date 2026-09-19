import { parseYaml, setIcon } from 'obsidian';
import { WidgetContext } from './types';

export function readParams(source: string): Record<string, unknown> { try { const parsed = parseYaml(source) as unknown; return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}; } catch { return {}; } }
export function text(value: unknown, fallback: string): string { return typeof value === 'string' && value.trim() ? value.trim() : fallback; }
export function number(value: unknown, fallback: number, min = -Infinity, max = Infinity): number { const parsed = typeof value === 'number' ? value : Number(value); return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback; }
export function color(params: Record<string, unknown>, ctx: WidgetContext): string { return text(params.color, ctx.settings.defaultColor); }
export function base(el: HTMLElement, params: Record<string, unknown>, ctx: WidgetContext, className: string): HTMLElement { el.empty(); const root = el.createDiv({ cls: `local-widget ${className} local-widget-${color(params, ctx)}` }); root.dataset.size = text(params.size, 'medium'); if (ctx.openSettings) { const settings = root.createEl('button', { cls: 'local-widget-settings', attr: { 'aria-label': 'Ouvrir les paramètres du widget' } }); setIcon(settings, 'settings'); settings.addEventListener('click', (event) => { event.stopPropagation(); ctx.openSettings?.(); }); } return root; }
export function icon(params: Record<string, unknown>, fallback: string): string { return text(params.icon, fallback); }
export function formatTime(date: Date, ctx: WidgetContext, options?: Intl.DateTimeFormatOptions): string { return new Intl.DateTimeFormat(ctx.settings.language, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: ctx.settings.timeFormat === '12h', ...options }).format(date); }
export function addError(el: HTMLElement, message: string): void { el.empty(); el.createDiv({ cls: 'local-widgets-error', text: message }); }