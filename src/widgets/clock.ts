import { WidgetDefinition } from '../types';
import { base, formatTime, readParams, text } from '../utils';

const clock: WidgetDefinition = { id: 'clock', name: 'Horloge', description: 'Une horloge locale ou dans un autre fuseau.', category: 'Temps', icon: '◷', defaultCode: '```clock\ntimezone: Europe/Paris\nlabel: Paris\ncolor: purple\n```', render(source, el, ctx) {
	const params = readParams(source); const root = base(el, params, ctx, 'widget-clock'); const value = root.createDiv({ cls: 'widget-clock-value' }); const label = root.createDiv({ cls: 'widget-clock-label', text: text(params.label, text(params.timezone, 'Heure locale')) });
	const update = () => { const timezone = text(params.timezone, ''); try { value.setText(formatTime(new Date(), ctx, timezone ? { timeZone: timezone } : undefined)); } catch { value.setText('Fuseau horaire invalide'); } };
	update(); ctx.addInterval(update, 1000); void label;
} };
export default clock;