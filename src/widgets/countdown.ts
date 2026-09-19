import { WidgetDefinition } from '../types';
import { base, icon, readParams, text } from '../utils';

const countdown: WidgetDefinition = { id: 'countdown', name: 'Compte à rebours', description: 'Les jours avant une date importante.', category: 'Temps', icon: '⏳', defaultCode: '```countdown\ndate: 2026-12-20\nlabel: Examen final\ncolor: blue\nicon: 🎓\n```', render(source, el, ctx) {
	const params = readParams(source); const root = base(el, params, ctx, 'widget-countdown'); const target = new Date(text(params.date, '')); const label = text(params.label, 'Compte à rebours');
	if (Number.isNaN(target.getTime())) { root.createDiv({ cls: 'local-widgets-error', text: 'Date invalide : utilisez le format AAAA-MM-JJ.' }); return; }
	const title = root.createDiv({ cls: 'widget-label', text: `${icon(params, '⏳')} ${label}` }); const value = root.createDiv({ cls: 'widget-countdown-value' });
	const update = () => { const remaining = Math.max(0, target.getTime() - Date.now()); const days = Math.floor(remaining / 86400000); const hours = Math.floor(remaining / 3600000) % 24; const minutes = Math.floor(remaining / 60000) % 60; value.setText(`${days} j  ${hours} h  ${minutes} min`); };
	update(); ctx.addInterval(update, 60000); void title;
} };
export default countdown;