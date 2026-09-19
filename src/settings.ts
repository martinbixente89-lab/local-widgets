import { App, PluginSettingTab as ObsidianSettingTab } from 'obsidian';
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

export interface LocalWidgetsSettings { defaultColor: string; timeFormat: '12h' | '24h'; language: string; }
export const DEFAULT_SETTINGS: LocalWidgetsSettings = { defaultColor: 'blue', timeFormat: '24h', language: 'fr-FR' };

export class LocalWidgetsTab extends ObsidianSettingTab {
	constructor(app: App, private readonly plugin: LocalWidgetsPlugin) { super(app, plugin); }

	getSettingDefinitions(): LocalSettingDefinition[] {
		return [
			{ key: 'defaultColor', type: 'dropdown', name: 'Couleur par défaut', description: 'Couleur utilisée par les widgets.', default: 'blue', options: { blue: 'Bleu', green: 'Vert', amber: 'Ambre', pink: 'Rose', purple: 'Violet' }, onChange: async (value) => { this.plugin.settings.defaultColor = value; await this.plugin.saveSettings(); } },
			{ key: 'timeFormat', type: 'dropdown', name: 'Format de l’heure', default: '24h', options: { '24h': '24 heures', '12h': '12 heures' }, onChange: async (value) => { this.plugin.settings.timeFormat = value as '12h' | '24h'; await this.plugin.saveSettings(); } },
			{ key: 'language', type: 'text', name: 'Langue', description: 'Locale utilisée pour les dates et heures.', default: 'fr-FR', onChange: async (value) => { this.plugin.settings.language = value || 'fr-FR'; await this.plugin.saveSettings(); } },
		];
	}

	display(): void { this.containerEl.empty(); }

}
