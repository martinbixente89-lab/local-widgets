import { WidgetDefinition } from '../types';
import { base, readParams, text } from '../utils';

interface FlipDigit {
	root: HTMLElement;
	top: HTMLElement;
	bottom: HTMLElement;
}

function createFace(parent: HTMLElement, cls: string, value: string): HTMLElement {
	return parent.createDiv({ cls, text: value });
}

function createDigit(parent: HTMLElement, initial: string): FlipDigit {
	const root = parent.createDiv({ cls: 'widget-flip-digit' });
	const top = createFace(root, 'widget-flip-top', initial);
	const bottom = createFace(root, 'widget-flip-bottom', initial);
	return { root, top, bottom };
}

function createSeparator(parent: HTMLElement): void {
	const separator = parent.createDiv({ cls: 'widget-flip-separator' });
	separator.createSpan({ cls: 'widget-flip-dot' });
	separator.createSpan({ cls: 'widget-flip-dot' });
}

function updateDigit(digit: FlipDigit, next: string, animated: boolean): void {
	if (digit.bottom.textContent === next) return;

	const current = digit.bottom.textContent ?? next;
	if (!animated) {
		digit.top.setText(next);
		digit.bottom.setText(next);
		return;
	}

	const top = createFace(digit.root, 'widget-flip-top widget-flip-top-flip', current);
	const bottom = createFace(digit.root, 'widget-flip-bottom widget-flip-bottom-flip', next);
	top.addEventListener('animationstart', () => digit.top.setText(next));
	top.addEventListener('animationend', () => top.remove());
	bottom.addEventListener('animationend', () => {
		digit.top.setText(next);
		digit.bottom.setText(next);
		bottom.remove();
	});
}

const flipclock: WidgetDefinition = { id: 'flipclock', name: 'Flip clock', description: 'Une horloge rétro animée.', category: 'Temps', icon: '▣', defaultCode: '```flipclock\ncolor: amber\nsize: large\nmode: flip\n```', render(source, el, ctx) {
	const params = readParams(source);
	const root = base(el, params, ctx, 'widget-flipclock');
	const textColor = text(params.textColor ?? params['text-color'], '');
	const cardColor = text(params.cardColor ?? params['card-color'], '');
	const mode = text(params.mode, 'flip').toLowerCase();
	const animated = mode !== 'static' && mode !== 'simple';
	if (textColor) root.style.setProperty('--flip-text-color', textColor);
	if (cardColor) root.style.setProperty('--flip-card-color', cardColor);
	const clock = root.createDiv({ cls: 'widget-flip-clock' });
	const hours = [createDigit(clock, '0'), createDigit(clock, '0')];
	createSeparator(clock);
	const minutes = [createDigit(clock, '0'), createDigit(clock, '0')];
	const showSeconds = params.seconds === true || text(params.seconds, 'false').toLowerCase() === 'true';
	if (showSeconds) createSeparator(clock);
	const seconds = showSeconds ? [createDigit(clock, '0'), createDigit(clock, '0')] : [];

	const update = () => {
		const now = new Date();
		const hour = ctx.settings.timeFormat === '12h' ? (now.getHours() % 12 || 12) : now.getHours();
		const hoursValue = String(hour).padStart(2, '0');
		const values = [hoursValue, String(now.getMinutes()).padStart(2, '0')];
		if (showSeconds) values.push(String(now.getSeconds()).padStart(2, '0'));
		[hours, minutes, seconds].forEach((digits, index) => digits.forEach((digit, digitIndex) => updateDigit(digit, values[index]?.[digitIndex] ?? '0', animated)));
	};

	update();
	ctx.addInterval(update, 1000);
} };
export default flipclock;