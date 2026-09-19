import { App, Modal, Notice, Setting, TFile, parseYaml } from 'obsidian';
import LocalWidgetsPlugin from '../main';
import { WidgetDefinition, WidgetSettingField } from '../types';

interface SectionInfo { lineStart: number; lineEnd: number; }

function readValues(source: string): Record<string, unknown> {
	try { const parsed = parseYaml(source) as unknown; return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}; } catch { return {}; }
}

function displayValue(value: unknown, field: WidgetSettingField): string {
	if (typeof value === 'undefined') value = field.default;
	return typeof value === 'string' ? value : String(value);
}

function yamlValue(value: string, field: WidgetSettingField): string {
	if (field.type === 'toggle') return value === 'true' ? 'true' : 'false';
	if (field.type === 'number') return Number.isFinite(Number(value)) ? value : String(field.default);
	return JSON.stringify(value);
}

export class WidgetSettingsModal extends Modal {
	private readonly values: Record<string, unknown>;
	private saveTimer?: number;
	private readonly controls = new Map<string, HTMLElement>();
	constructor(app: App, private readonly plugin: LocalWidgetsPlugin, private readonly widget: WidgetDefinition, private readonly source: string, private readonly sourcePath: string, private readonly section: SectionInfo, private readonly viewCode: () => void) {
		super(app);
		this.values = readValues(source);
	}

	onOpen(): void {
		this.contentEl.addClass('local-widgets-settings-modal');
		this.contentEl.createEl('h2', { text: `Paramètres : ${this.widget.name}` });
		for (const section of ['Contenu', 'Police', 'Couleurs', 'Affichage'] as const) {
			const fields = (this.widget.settings ?? []).filter((field) => (field.section ?? 'Contenu') === section);
			if (!fields.length) continue;
			this.contentEl.createEl('h3', { text: section });
			for (const field of fields) this.renderField(field);
		}
		new Setting(this.contentEl).addButton((button) => button.setButtonText('Voir le code').setCta().onClick(() => { this.viewCode(); this.close(); }));
	}

	private renderField(field: WidgetSettingField): void {
		const setting = new Setting(this.contentEl).setName(field.label);
		if (field.description) setting.setDesc(field.description);
		const current = this.values[field.key];
		if (field.type === 'select') setting.addDropdown((control) => control.addOptions(field.options ?? {}).setValue(displayValue(current, field)).onChange((value) => this.change(field, value)));
		else if (field.type === 'toggle') setting.addToggle((control) => control.setValue(current === true || current === 'true').onChange((value) => this.change(field, String(value))));
		else if (field.type === 'color') this.renderColor(setting, field, displayValue(current, field));
		else if (field.type === 'font') this.renderFont(setting, field, displayValue(current, field));
		else setting.addText((control) => { control.setValue(displayValue(current, field)); if (field.type === 'number') control.inputEl.type = 'number'; if (field.type === 'date') control.inputEl.type = 'date'; control.onChange((value) => this.change(field, value)); });
	}

	private renderColor(setting: Setting, field: WidgetSettingField, value: string): void {
		const textInput = setting.controlEl.createEl('input', { type: 'text', value, cls: 'local-widgets-color-text' });
		const picker = setting.controlEl.createEl('input', { type: 'color', cls: 'local-widgets-color-picker' });
		if (/^#[0-9a-f]{6}$/i.test(value)) picker.value = value;
		textInput.addEventListener('input', () => this.change(field, textInput.value));
		picker.addEventListener('input', () => { textInput.value = picker.value; this.change(field, picker.value); });
		setting.addButton((button) => button.setButtonText('Par défaut').onClick(() => { textInput.value = String(field.default); this.change(field, textInput.value); }));
	}

	private renderFont(setting: Setting, field: WidgetSettingField, value: string): void {
		const select = setting.controlEl.createEl('select');
		for (const option of ['serif', 'sans', 'mono', 'elegant', 'handwriting']) { const item = select.createEl('option', { value: option, text: option }); if (option === value) item.selected = true; }
		const input = setting.controlEl.createEl('input', { type: 'text', value: value.match(/^(serif|sans|mono|elegant|handwriting)$/) ? '' : value, placeholder: 'Police installée' });
		select.addEventListener('change', () => { input.value = ''; this.change(field, select.value); });
		input.addEventListener('input', () => this.change(field, input.value || String(field.default)));
	}

	private change(field: WidgetSettingField, value: string): void {
		this.values[field.key] = field.type === 'toggle' ? value === 'true' : value;
		if (this.saveTimer !== undefined) window.clearTimeout(this.saveTimer);
		this.saveTimer = window.setTimeout(() => { void this.saveBlock(); }, 300);
	}

	private async saveBlock(): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(this.sourcePath);
		if (!(file instanceof TFile)) return;
		try {
			await this.app.vault.process(file, (contents) => {
				const lines = contents.split(/\r?\n/);
				const start = this.section.lineStart + 1;
				const end = Math.min(this.section.lineEnd, lines.length - 1);
				for (const [key, value] of Object.entries(this.values)) {
					const pattern = new RegExp(`^(\\s*)${key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*:`);
					const lineIndex = lines.findIndex((line, index) => index >= start && index <= end && pattern.test(line));
					if (lineIndex >= 0) { const indent = lines[lineIndex]?.match(/^\\s*/)?.[0] ?? ''; lines[lineIndex] = `${indent}${key}: ${yamlValue(String(value), this.widget.settings?.find((field) => field.key === key) ?? { type: 'text', default: '' } as WidgetSettingField)}`; }
				}
				return lines.join('\n');
			});
		} catch (error) { new Notice(`Impossible de mettre à jour le widget : ${String(error)}`); }
	}

	onClose(): void { if (this.saveTimer !== undefined) window.clearTimeout(this.saveTimer); this.contentEl.empty(); this.controls.clear(); }
}
