import { App, EventRef, Modal, Notice, Setting, TFile, parseYaml } from 'obsidian';
import LocalWidgetsPlugin from '../main';
import { WidgetDefinition, WidgetSettingField } from '../types';
import { blockBody, findCodeBlocks, removeBlockKey, writeBlockKey } from '../utils/block-text';
import { normalizeParams } from '../params';

function parseValues(source: string): Record<string, unknown> {
	try { const parsed = parseYaml(source) as unknown; return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}; } catch { return {}; }
}

function valueText(value: unknown, field: WidgetSettingField): string { const selected = typeof value === 'undefined' ? field.default : value; return typeof selected === 'string' || typeof selected === 'number' || typeof selected === 'boolean' ? String(selected) : ''; }

export class WidgetSettingsModal extends Modal {
	private saveTimer?: number;
	private refreshTimer?: number;
	private modifyRef?: EventRef;
	private writing = false;
	private queued?: { key: string; value: unknown; remove: boolean };
	private readonly controls = new Map<string, { root: HTMLElement; input: HTMLInputElement | HTMLSelectElement; field: WidgetSettingField }>();
	private codeEl!: HTMLElement;
	private values: Record<string, unknown> = {};
	private normalizedValues: Record<string, unknown> = {};
	private blockSource = '';

	constructor(app: App, private readonly plugin: LocalWidgetsPlugin, private readonly widget: WidgetDefinition, private readonly sourcePath: string, private readonly rank: number, private readonly viewCode: () => void) { super(app); }

	async onOpen(): Promise<void> {
		this.contentEl.addClass('local-widgets-settings-modal');
		this.contentEl.createEl('h2', { text: `Paramètres : ${this.widget.name}` });
		this.codeEl = this.contentEl.createDiv({ cls: 'local-widgets-settings-code' });
		await this.refreshFromFile(true);
		this.modifyRef = this.app.vault.on('modify', (file) => { if (file.path === this.sourcePath && !this.writing) void this.refreshFromFile(false); });
	}

	private async refreshFromFile(initial: boolean): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(this.sourcePath);
		if (!(file instanceof TFile)) { new Notice('Le fichier du widget est introuvable.'); this.close(); return; }
		const content = await this.app.vault.read(file);
		const blocks = findCodeBlocks(content, this.widget.id);
		const block = blocks[this.rank];
		if (!block) { new Notice('Le bloc du widget a été supprimé ou déplacé.'); this.close(); return; }
		this.blockSource = blockBody(content, block);
		this.values = parseValues(this.blockSource);
		this.normalizedValues = normalizeParams(this.widget, this.blockSource);
		this.codeEl.empty();
		this.codeEl.createEl('h3', { text: 'Code du bloc' });
		this.codeEl.createEl('pre', { text: this.blockSource });
		if (initial) this.renderFields();
		else this.refreshControls();
	}

	private renderFields(): void {
		for (const section of ['Contenu', 'Police', 'Couleurs', 'Affichage'] as const) {
			const fields = (this.widget.settings ?? []).filter((field) => (field.section ?? 'Contenu') === section);
			if (!fields.length) continue;
			this.contentEl.createEl('h3', { text: section });
			for (const field of fields) this.renderField(field);
		}
		new Setting(this.contentEl).addButton((button) => button.setButtonText('Voir le code').onClick(() => { this.viewCode(); this.close(); }));
		this.contentEl.appendChild(this.codeEl);
	}

	private renderField(field: WidgetSettingField): void {
		const setting = new Setting(this.contentEl).setName(field.label);
		if (field.description) setting.setDesc(field.description);
		const input = field.type === 'select' ? setting.controlEl.createEl('select') : setting.controlEl.createEl('input', { type: field.type === 'toggle' ? 'checkbox' : field.type === 'color' ? 'text' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text' });
		if (field.type === 'select') { for (const [key, label] of Object.entries(field.options ?? {})) input.createEl('option', { value: key, text: label }); }
		const wrapper = setting.controlEl;
		if (field.type === 'color') { const picker = wrapper.createEl('input', { type: 'color' }); picker.addEventListener('input', () => this.change(field, picker.value)); setting.addButton((button) => button.setButtonText('Par défaut').onClick(() => void this.reset(field))); }
		if (field.type === 'font') { input.setAttribute('list', 'local-widget-fonts'); }
		input.addEventListener('change', () => this.change(field, field.type === 'toggle' ? (input as HTMLInputElement).checked : input.value));
		input.addEventListener('input', () => { if (field.type === 'text' || field.type === 'font' || field.type === 'number') this.debouncedChange(field, input.value); });
		this.controls.set(field.key, { root: setting.settingEl, input, field });
		this.setControl(field);
	}

	private setControl(field: WidgetSettingField): void {
		const control = this.controls.get(field.key);
		if (!control) return;
		const present = Object.prototype.hasOwnProperty.call(this.values, field.key);
		const value = valueText(Object.prototype.hasOwnProperty.call(this.values, field.key) ? this.values[field.key] : this.normalizedValues[field.key], field);
		control.root.toggleClass('is-default', !present);
		control.root.setAttribute('data-default-label', present ? '' : 'Par défaut');
		if (field.type === 'toggle') (control.input as HTMLInputElement).checked = value === 'true';
		else control.input.value = value;
		control.input.setAttribute('aria-label', present ? field.label : `${field.label} (par défaut)`);
	}

	private refreshControls(): void { for (const field of this.widget.settings ?? []) { if (!this.isFocused(field.key)) this.setControl(field); } }
	private isFocused(key: string): boolean { return document.activeElement === this.controls.get(key)?.input; }
	private debouncedChange(field: WidgetSettingField, value: string): void { if (this.saveTimer !== undefined) window.clearTimeout(this.saveTimer); this.saveTimer = window.setTimeout(() => void this.change(field, value), 300); }
	private change(field: WidgetSettingField, value: unknown): void { if (String(this.values[field.key] ?? field.default) === String(value) && Object.prototype.hasOwnProperty.call(this.values, field.key)) return; this.queued = { key: field.key, value, remove: false }; void this.flushWrite(); }
	private async reset(field: WidgetSettingField): Promise<void> { this.queued = { key: field.key, value: undefined, remove: true }; await this.flushWrite(); }

	private async flushWrite(): Promise<void> {
		if (!this.queued || this.writing) return;
		const operation = this.queued;
		this.queued = undefined;
		this.writing = true;
		try {
			const file = this.app.vault.getAbstractFileByPath(this.sourcePath);
			if (!(file instanceof TFile)) throw new Error('Fichier introuvable.');
			await this.app.vault.process(file, (content) => {
				const blocks = findCodeBlocks(content, this.widget.id);
				const block = blocks[this.rank];
				if (!block) throw new Error('Le bloc ciblé n’existe plus.');
				const field = this.widget.settings?.find((candidate) => candidate.key === operation.key);
				if (!field) throw new Error(`Paramètre inconnu : ${operation.key}`);
				return operation.remove ? removeBlockKey(content, block, operation.key) : writeBlockKey(content, block, operation.key, operation.value, field.type);
			});
		} catch (error) { new Notice(`Impossible de mettre à jour le widget : ${String(error)}`); }
		finally { this.writing = false; await this.refreshFromFile(false); if (this.queued) void this.flushWrite(); }
	}

	onClose(): void { if (this.saveTimer !== undefined) window.clearTimeout(this.saveTimer); if (this.refreshTimer !== undefined) window.clearTimeout(this.refreshTimer); if (this.modifyRef) this.app.vault.offref(this.modifyRef); this.contentEl.empty(); this.controls.clear(); }
}
