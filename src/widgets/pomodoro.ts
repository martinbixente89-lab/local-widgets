import { Notice } from 'obsidian';
import { WidgetDefinition } from '../types';
import { base, number, readParams } from '../utils';

const pomodoro: WidgetDefinition = { id: 'pomodoro', name: 'Pomodoro', description: 'Travaillez par cycles concentrés.', category: 'Productivité', icon: '🍅', defaultCode: '```pomodoro\nwork: 25\nbreak: 5\ncolor: red\n```', render(source, el, ctx) {
	const params = readParams(source); const root = base(el, params, ctx, 'widget-pomodoro'); const work = number(params.work, 25, 1, 120); const pause = number(params.break, 5, 1, 60); let running = false; let remaining = work * 60; let isWork = true;
	const display = root.createDiv({ cls: 'widget-pomodoro-time' }); const mode = root.createDiv({ cls: 'widget-label', text: 'Travail' }); const controls = root.createDiv({ cls: 'widget-controls' }); const toggle = controls.createEl('button', { text: 'Démarrer' }); const reset = controls.createEl('button', { text: 'Réinitialiser' });
	const update = () => { const minutes = Math.floor(remaining / 60).toString().padStart(2, '0'); const seconds = (remaining % 60).toString().padStart(2, '0'); display.setText(`${minutes}:${seconds}`); };
	toggle.addEventListener('click', () => { running = !running; toggle.setText(running ? 'Pause' : 'Démarrer'); }); reset.addEventListener('click', () => { running = false; isWork = true; remaining = work * 60; mode.setText('Travail'); toggle.setText('Démarrer'); update(); });
	const tick = () => { if (!running) return; remaining--; if (remaining <= 0) { isWork = !isWork; remaining = (isWork ? work : pause) * 60; mode.setText(isWork ? 'Travail' : 'Pause'); new Notice(isWork ? 'Pomodoro : c’est reparti.' : 'Pomodoro : temps de pause.'); } update(); }; update(); ctx.addInterval(tick, 1000);
} };
export default pomodoro;