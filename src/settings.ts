import { App, PluginSettingTab as ObsidianSettingTab, Setting } from 'obsidian';
import LocalWidgetsPlugin from './main';

interface LocalSettingDefinition {
	key: string;
	type: 'text' | 'dropdown';
	name: string;
	description?: string;
	default: string;
	options?: Record<string, string>;
	onChange: (value: string) => Promise<void>;
}

export interface LocalWidgetsSettings {
	defaultColor: string;
	timeFormat: '12h' | '24h';
	language: string;
	quoteFont: string;
	quoteSize: string;
	quoteWeight: string;
	quoteStyle: 'normal' | 'italic';
	quoteAlign: 'left' | 'center';
	quoteTextColor: string;
	quoteBorderColor: string;
	quoteBarColor: string;
	quoteBackground: string;
	quoteAuthor: boolean;
	quoteAuthorFont: string;
	quoteAuthorSize: string;
	quoteAuthorWeight: string;
	quoteAuthorStyle: 'normal' | 'italic';
	quoteAuthorColor: string;
	quoteBorder: boolean;
	quoteBar: boolean;
}
export const DEFAULT_SETTINGS: LocalWidgetsSettings = { defaultColor: 'blue', timeFormat: '24h', language: 'fr-FR', quoteFont: 'serif', quoteSize: 'medium', quoteWeight: 'normal', quoteStyle: 'normal', quoteAlign: 'left', quoteTextColor: 'normal', quoteBorderColor: 'accent', quoteBarColor: 'accent', quoteBackground: 'transparent', quoteAuthor: true, quoteAuthorFont: 'sans', quoteAuthorSize: 'small', quoteAuthorWeight: 'normal', quoteAuthorStyle: 'normal', quoteAuthorColor: 'muted', quoteBorder: true, quoteBar: true };

export class LocalWidgetsTab extends ObsidianSettingTab {
	constructor(app: App, private readonly plugin: LocalWidgetsPlugin) { super(app, plugin); }

	getSettingDefinitions(): LocalSettingDefinition[] {
		return [
			{ key: 'defaultColor', type: 'dropdown', name: 'Couleur par défaut', description: 'Couleur utilisée par les widgets.', default: 'blue', options: { blue: 'Bleu', green: 'Vert', amber: 'Ambre', pink: 'Rose', purple: 'Violet' }, onChange: async (value) => { this.plugin.settings.defaultColor = value; await this.plugin.saveSettings(); } },
			{ key: 'timeFormat', type: 'dropdown', name: 'Format de l’heure', default: '24h', options: { '24h': '24 heures', '12h': '12 heures' }, onChange: async (value) => { this.plugin.settings.timeFormat = value as '12h' | '24h'; await this.plugin.saveSettings(); } },
			{ key: 'language', type: 'text', name: 'Langue', description: 'Locale utilisée pour les dates et heures.', default: 'fr-FR', onChange: async (value) => { this.plugin.settings.language = value || 'fr-FR'; await this.plugin.saveSettings(); } },
		];
	}

	display(): void {
		this.containerEl.empty();
		this.containerEl.createEl('h2', { text: 'Local widgets' });
		new Setting(this.containerEl).setName('Couleur par défaut').setDesc('Couleur utilisée par les widgets.').addDropdown((dropdown) => dropdown.addOptions({ blue: 'Bleu', green: 'Vert', amber: 'Ambre', pink: 'Rose', purple: 'Violet' }).setValue(this.plugin.settings.defaultColor).onChange(async (value) => { this.plugin.settings.defaultColor = value; await this.plugin.saveSettings(); }));
		new Setting(this.containerEl).setName('Format de l’heure').addDropdown((dropdown) => dropdown.addOptions({ '24h': '24 heures', '12h': '12 heures' }).setValue(this.plugin.settings.timeFormat).onChange(async (value) => { this.plugin.settings.timeFormat = value as '12h' | '24h'; await this.plugin.saveSettings(); }));
		new Setting(this.containerEl).setName('Langue').setDesc('Locale utilisée pour les dates et heures.').addText((input) => input.setValue(this.plugin.settings.language).onChange(async (value) => { this.plugin.settings.language = value || 'fr-FR'; await this.plugin.saveSettings(); }));
		this.containerEl.createEl('h3', { text: 'Citation du jour' });
		const addText = (key: keyof LocalWidgetsSettings, name: string, description?: string) => new Setting(this.containerEl).setName(name).setDesc(description ?? '').addText((input) => input.setValue(String(this.plugin.settings[key])).onChange(async (value) => { (this.plugin.settings[key] as string) = value; await this.plugin.saveSettings(); }));
		addText('quoteFont', 'Police', 'Preset : serif, sans, mono, elegant ou handwriting.');
		addText('quoteSize', 'Taille', 'Preset small, medium, large ou une valeur CSS comme 22px.');
		addText('quoteWeight', 'Graisse', 'normal, bold ou 100 à 900.');
		addText('quoteTextColor', 'Couleur du texte', 'Couleur CSS ou alias accent, muted, normal.');
		addText('quoteBorderColor', 'Couleur du contour');
		addText('quoteBarColor', 'Couleur de la barre');
		addText('quoteBackground', 'Fond');
		new Setting(this.containerEl).setName('Alignement').addDropdown((dropdown) => dropdown.addOptions({ left: 'Gauche', center: 'Centre' }).setValue(this.plugin.settings.quoteAlign).onChange(async (value) => { this.plugin.settings.quoteAlign = value as 'left' | 'center'; await this.plugin.saveSettings(); }));
		new Setting(this.containerEl).setName('Style').addDropdown((dropdown) => dropdown.addOptions({ normal: 'Normal', italic: 'Italique' }).setValue(this.plugin.settings.quoteStyle).onChange(async (value) => { this.plugin.settings.quoteStyle = value as 'normal' | 'italic'; await this.plugin.saveSettings(); }));
		new Setting(this.containerEl).setName('Afficher l’auteur').addToggle((toggle) => toggle.setValue(this.plugin.settings.quoteAuthor).onChange(async (value) => { this.plugin.settings.quoteAuthor = value; await this.plugin.saveSettings(); }));
		new Setting(this.containerEl).setName('Contour').addToggle((toggle) => toggle.setValue(this.plugin.settings.quoteBorder).onChange(async (value) => { this.plugin.settings.quoteBorder = value; await this.plugin.saveSettings(); }));
		new Setting(this.containerEl).setName('Barre verticale').addToggle((toggle) => toggle.setValue(this.plugin.settings.quoteBar).onChange(async (value) => { this.plugin.settings.quoteBar = value; await this.plugin.saveSettings(); }));
		addText('quoteAuthorFont', 'Police de l’auteur');
		addText('quoteAuthorSize', 'Taille de l’auteur');
		addText('quoteAuthorWeight', 'Graisse de l’auteur');
		addText('quoteAuthorColor', 'Couleur de l’auteur');
	}

}
