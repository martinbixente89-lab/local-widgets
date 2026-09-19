import { App, Editor, EventRef, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownView, Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, LocalWidgetsSettings, LocalWidgetsTab } from './settings';
import { WidgetMenuModal } from './ui/widget-menu';
import { WidgetSettingsModal } from './ui/widget-settings';
import { allWidgets } from './widgets';
import { WidgetContext, WidgetDefinition } from './types';
import { blockRank } from './utils/block-text';

export default class LocalWidgetsPlugin extends Plugin {
	settings!: LocalWidgetsSettings;
	private widgetStates: Record<string, unknown> = {};
	private stateSaveTimer?: number;

	async onload() {
		const data = await this.loadData() as Partial<LocalWidgetsSettings> & { widgetStates?: Record<string, unknown> };
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
		this.widgetStates = data.widgetStates ?? {};
		const expiry = Date.now() - 30 * 86400000;
		this.widgetStates = Object.fromEntries(Object.entries(this.widgetStates).filter(([, value]) => typeof value === 'object' && value !== null && Number((value as { updatedAt?: unknown }).updatedAt ?? Date.now()) >= expiry));
		this.addRibbonIcon('layout-dashboard', 'Ouvrir le menu des widgets', () => this.openWidgetMenu());
		this.addCommand({ id: 'insert-widget', name: 'Insérer un widget', callback: () => this.openWidgetMenu() });
		this.addSettingTab(new LocalWidgetsTab(this.app, this));
		for (const widget of allWidgets) {
			this.registerMarkdownCodeBlockProcessor(widget.id, async (source, el, markdownContext) => {
				const file = this.app.vault.getAbstractFileByPath(markdownContext.sourcePath);
				const section = markdownContext.getSectionInfo(el);
				const content = file instanceof TFile ? await this.app.vault.cachedRead(file) : '';
				const context: WidgetContext = { app: this.app, plugin: this, settings: this.settings, sourcePath: markdownContext.sourcePath, blockRank: section ? blockRank(content, widget.id, section.lineStart) : undefined, loadWidgetState: (key) => this.widgetStates[key] as never, saveWidgetState: (key, value) => { this.widgetStates[key] = typeof value === 'object' && value !== null ? { ...value as Record<string, unknown>, updatedAt: Date.now() } : value; if (this.stateSaveTimer !== undefined) window.clearTimeout(this.stateSaveTimer); this.stateSaveTimer = window.setTimeout(() => { void this.saveData({ ...this.settings, widgetStates: this.widgetStates }); }, 300); }, addInterval: (callback, delay) => markdownContext.addChild(new WidgetInterval(el, callback, delay)), addTimeout: (callback, delay) => markdownContext.addChild(new WidgetTimeout(el, callback, delay)), addWindowEvent: (type, callback) => markdownContext.addChild(new WidgetWindowEvent(el, type, callback)), addVaultModify: (callback) => markdownContext.addChild(new WidgetVaultModify(el, this.app, callback)), editBlock: () => this.editBlock(el, markdownContext), openSettings: () => { void this.openWidgetSettings(widget, source, el, markdownContext); } };
				try { Promise.resolve(widget.render(source, el, context)).catch((error: unknown) => { el.empty(); el.createDiv({ cls: 'local-widgets-error', text: `Impossible d'afficher ce widget : ${String(error)}` }); }); } catch (error) { el.empty(); el.createDiv({ cls: 'local-widgets-error', text: `Impossible d'afficher ce widget : ${String(error)}` }); }
			});
		}
	}

	async saveSettings(): Promise<void> { await this.saveData({ ...this.settings, widgetStates: this.widgetStates }); }
	private openWidgetMenu(): void { new WidgetMenuModal(this.app, this, (code) => this.insertWidget(code)).open(); }
	private async openWidgetSettings(widget: WidgetDefinition, source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
		const sectionInfo = ctx.getSectionInfo(el);
		if (!sectionInfo) return;
		const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
		if (!(file instanceof TFile)) return;
		const content = await this.app.vault.cachedRead(file);
		const rank = blockRank(content, widget.id, sectionInfo.lineStart);
		if (rank < 0) return;
		new WidgetSettingsModal(this.app, this, widget, ctx.sourcePath, rank, () => this.editBlock(el, ctx)).open();
	}
	private insertWidget(code: string): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;
		const editor: Editor = view.editor;
		const selection = editor.getSelection();
		editor.replaceSelection(`${selection ? `${selection}\n` : ''}${code}\n`);
	}
	private editBlock(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const section = ctx.getSectionInfo(el);
		if (!view || !section || view.file?.path !== ctx.sourcePath) return;
		view.editor.setCursor({ line: section.lineStart, ch: 0 });
		view.editor.scrollIntoView({ from: { line: section.lineStart, ch: 0 }, to: { line: section.lineEnd, ch: 0 } }, true);
	}
}

class WidgetInterval extends MarkdownRenderChild {
	private intervalId?: number;
	constructor(containerEl: HTMLElement, private readonly callback: () => void, private readonly delay: number) { super(containerEl); }
	onload(): void { this.intervalId = window.setInterval(this.callback, this.delay); }
	onunload(): void { if (this.intervalId !== undefined) window.clearInterval(this.intervalId); }
}

class WidgetTimeout extends MarkdownRenderChild {
	private timeoutId?: number;
	constructor(containerEl: HTMLElement, private readonly callback: () => void, private readonly delay: number) { super(containerEl); }
	onload(): void { this.timeoutId = window.setTimeout(this.callback, this.delay); }
	onunload(): void { if (this.timeoutId !== undefined) window.clearTimeout(this.timeoutId); }
}

class WidgetWindowEvent extends MarkdownRenderChild {
	constructor(containerEl: HTMLElement, private readonly type: 'focus' | 'visibilitychange', private readonly callback: () => void) { super(containerEl); }
	onload(): void { window.addEventListener(this.type, this.callback); }
	onunload(): void { window.removeEventListener(this.type, this.callback); }
}

class WidgetVaultModify extends MarkdownRenderChild {
	private ref?: EventRef;
	constructor(containerEl: HTMLElement, private readonly app: App, private readonly callback: (file: unknown) => void) { super(containerEl); }
	onload(): void { this.ref = this.app.vault.on('modify', (file) => this.callback(file)); }
	onunload(): void { if (this.ref) this.app.vault.offref(this.ref); }
}
