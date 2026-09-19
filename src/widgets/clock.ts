import { WidgetDefinition } from '../types';
import { base, readParams, text } from '../utils';
import { parseBoolean, timeParts, updateEvery } from './time';

function renderClock(root: HTMLElement, params: Record<string, unknown>, ctx: Parameters<WidgetDefinition['render']>[2]): void {
	const format = text(params.format, '24') === '12' ? '12' as const : '24' as const;
	const options = { format, ampm: parseBoolean(params.ampm, true), leadingZero: parseBoolean(params['leading-zero'], true), timezone: text(params.timezone, 'local'), showSeconds: parseBoolean(params.seconds, true), hours: 'show' as const };
	const value = root.createDiv({ cls: 'widget-time-value' });
	const badge = root.createSpan({ cls: 'widget-time-ampm' });
	const update = () => { try { const parts = timeParts(new Date(), options); const hour = options.leadingZero || format === '24' ? String(parts.hours).padStart(2, '0') : String(parts.hours); value.setText([hour, String(parts.minutes).padStart(2, '0'), ...(options.showSeconds ? [String(parts.seconds).padStart(2, '0')] : [])].join(':')); badge.setText(format === '12' && options.ampm ? parts.ampm : ''); } catch { value.setText('Fuseau horaire invalide'); badge.setText(''); } };
	update(); ctx.addInterval(update, updateEvery(options));
}

const clock: WidgetDefinition = { id: 'clock', name: 'Horloge', description: 'Horloge avec format, fuseau et secondes configurables.', category: 'Temps', icon: '◷', defaultCode: '```clock\nformat: 24\nampm: true\nseconds: true\ntimezone: local\n```', render(source, el, ctx) { const params = readParams(source); const root = base(el, params, ctx, 'widget-clock'); renderClock(root, params, ctx); } };
export default clock;
