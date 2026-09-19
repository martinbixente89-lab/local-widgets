import { App, Editor, EventRef, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownView, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, LocalWidgetsSettings, LocalWidgetsTab } from './settings';
import { WidgetMenuModal } from './ui/widget-menu';
import { allWidgets } from './widgets';
import { WidgetContext } from './types';

export default class LocalWidgetsPlugin extends Plugin {
	settings!: LocalWidgetsSettings;

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<LocalWidgetsSettings>);
		this.addRibbonIcon('layout-dashboard', 'Ouvrir le menu des widgets', () => this.openWidgetMenu());
		this.addCommand({ id: 'insert-widget', name: 'Insérer un widget', callback: () => this.openWidgetMenu() });
		this.addSettingTab(new LocalWidgetsTab(this.app, this));
		for (const widget of allWidgets) {
			this.registerMarkdownCodeBlockProcessor(widget.id, (source, el, markdownContext) => {
				const context: WidgetContext = { app: this.app, plugin: this, settings: this.settings, addInterval: (callback, delay) => markdownContext.addChild(new WidgetInterval(el, callback, delay)), addTimeout: (callback, delay) => markdownContext.addChild(new WidgetTimeout(el, callback, delay)), addWindowEvent: (type, callback) => markdownContext.addChild(new WidgetWindowEvent(el, type, callback)), addVaultModify: (callback) => markdownContext.addChild(new WidgetVaultModify(el, this.app, callback)), editBlock: () => this.editBlock(el, markdownContext) };
				try { Promise.resolve(widget.render(source, el, context)).catch((error: unknown) => { el.empty(); el.createDiv({ cls: 'local-widgets-error', text: `Impossible d'afficher ce widget : ${String(error)}` }); }); } catch (error) { el.empty(); el.createDiv({ cls: 'local-widgets-error', text: `Impossible d'afficher ce widget : ${String(error)}` }); }
			});
		}
	}

	async saveSettings(): Promise<void> { await this.saveData(this.settings); }
	private openWidgetMenu(): void { new WidgetMenuModal(this.app, this, (code) => this.insertWidget(code)).open(); }
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
