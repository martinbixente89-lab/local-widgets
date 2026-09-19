import { WidgetDefinition } from '../types';
import { base, formatTime, readParams } from '../utils';

const flipclock: WidgetDefinition = { id: 'flipclock', name: 'Flip clock', description: 'Une horloge rétro animée.', category: 'Temps', icon: '▣', defaultCode: '```flipclock\ncolor: amber\nsize: large\n```', render(source, el, ctx) {
	const params = readParams(source); const root = base(el, params, ctx, 'widget-flipclock'); const value = root.createDiv({ cls: 'widget-flip-value' });
	const update = () => { value.setText(formatTime(new Date(), ctx, { second: undefined })); value.addClass('is-ticking'); window.setTimeout(() => value.removeClass('is-ticking'), 500); };
	update(); ctx.addInterval(update, 1000);
} };
export default flipclock;