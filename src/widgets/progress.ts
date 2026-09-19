import { WidgetDefinition } from '../types';
import { base, number, readParams, text } from '../utils';

const progress: WidgetDefinition = { id: 'progress', name: 'Progression', description: 'Visualisez votre journée ou votre année.', category: 'Productivité', icon: '◔', defaultCode: '```progress\nperiod: day\nlabel: Ma journée\ncolor: green\n```', render(source, el, ctx) {
	const params = readParams(source); const root = base(el, params, ctx, 'widget-progress'); const period = text(params.period, 'day'); const now = new Date(); let percent = 0;
	if (period === 'week') percent = (now.getDay() + (now.getDay() === 0 ? 6 : -1) + now.getHours() / 24) / 7 * 100;
	else if (period === 'month') percent = (now.getDate() - 1 + now.getHours() / 24) / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() * 100;
	else if (period === 'year') percent = (now.getMonth() + now.getDate() / 31) / 12 * 100;
	else percent = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
	percent = number(params.value, percent, 0, 100); root.createDiv({ cls: 'widget-label', text: text(params.label, `Progression de la ${period}`) }); const track = root.createDiv({ cls: 'widget-progress-track' }); track.createDiv({ cls: 'widget-progress-bar' }).style.width = `${percent}%`; root.createDiv({ cls: 'widget-progress-meta', text: `${Math.round(percent)} %` });
} };
export default progress;