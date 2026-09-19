import { describe, expect, it } from 'vitest';
import { formatElapsed, parseDuration } from '../src/widgets/time';

describe('time modes', () => {
	it('parse les durées usuelles', () => {
		expect(parseDuration('00:25:00')).toBe(1500000);
		expect(parseDuration('25m')).toBe(1500000);
		expect(parseDuration('1h30m')).toBe(5400000);
		expect(parseDuration('90s')).toBe(90000);
	});
	it('arrondit les minutes quand les secondes sont masquées', () => {
		expect(formatElapsed(24 * 60000 + 30000, { showSeconds: false, hours: 'hide' })).toEqual(['25']);
		expect(formatElapsed(90 * 60000, { showSeconds: false, hours: 'hide' })).toEqual(['90']);
	});
	it('gère les heures automatiques et les secondes', () => {
		expect(formatElapsed(3661000, { showSeconds: true, hours: 'auto' })).toEqual(['01', '01', '01']);
		expect(formatElapsed(61000, { showSeconds: true, hours: 'auto' })).toEqual(['01', '01']);
	});
});
