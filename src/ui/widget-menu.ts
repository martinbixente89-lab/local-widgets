import { App, Modal } from 'obsidian';
import { allWidgets } from '../widgets';
import { WidgetDefinition } from '../types';
import LocalWidgetsPlugin from '../main';
import { DEFAULT_SETTINGS } from '../settings';

export class WidgetMenuModal extends Modal {
	private listEl!: HTMLElement;
	constructor(app: App, private readonly plugin: LocalWidgetsPlugin, private readonly onSelect: (code: string) => void) { super(app); }
	onOpen(): void {
		this.contentEl.addClass('local-widgets-menu');
		this.contentEl.createEl('h2', { text: 'Insérer un widget' });
		const search = this.contentEl.createEl('input', { type: 'search', placeholder: 'Rechercher un widget…' });
		this.listEl = this.contentEl.createDiv({ cls: 'local-widgets-menu-list' });
		search.addEventListener('input', () => this.render(search.value));
		this.render('');
	}
	private render(query: string): void {
		this.listEl.empty();
		const normalized = query.toLocaleLowerCase();
		const filtered = allWidgets.filter((widget) => `${widget.name} ${widget.description} ${widget.category}`.toLocaleLowerCase().includes(normalized));
		const groups = new Map<string, WidgetDefinition[]>();
		for (const widget of filtered) groups.set(widget.category, [...(groups.get(widget.category) ?? []), widget]);
		for (const [category, widgets] of groups) {
			this.listEl.createEl('h3', { text: category });
			for (const widget of widgets) {
				const card = this.listEl.createDiv({ cls: 'local-widgets-card' });
				const header = card.createDiv({ cls: 'local-widgets-card-header' }); header.createSpan({ cls: 'local-widgets-card-icon', text: widget.icon }); const copy = header.createDiv(); copy.createEl('strong', { text: widget.name }); copy.createEl('small', { text: widget.description });
				const preview = card.createDiv({ cls: 'local-widgets-card-preview' });
				const previewSource = widget.defaultCode.replace(/^```[^\n]*\n/, '').replace(/\n```\s*$/, '');
				try { Promise.resolve(widget.render(previewSource, preview, { app: this.app, plugin: this.plugin, settings: this.plugin.settings ?? DEFAULT_SETTINGS, addInterval: () => undefined })).catch((error: unknown) => preview.createDiv({ cls: 'local-widgets-preview-error', text: String(error) })); } catch (error) { preview.createDiv({ cls: 'local-widgets-preview-error', text: String(error) }); }
				const insert = card.createEl('button', { cls: 'local-widgets-insert', text: 'Insérer' }); insert.addEventListener('click', (event) => { event.stopPropagation(); this.onSelect(widget.defaultCode); this.close(); });
			}
		}
		if (!filtered.length) this.listEl.createDiv({ cls: 'local-widgets-empty', text: 'Aucun widget trouvé.' });
	}
	onClose(): void { this.contentEl.empty(); }
}