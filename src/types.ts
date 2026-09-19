import { App } from 'obsidian';
import LocalWidgetsPlugin from './main';
import { LocalWidgetsSettings } from './settings';

export type WidgetCategory = 'Temps' | 'Productivité' | 'Média' | 'Nature' | 'Utilitaires' | 'Fun';
export interface WidgetContext { app: App; plugin: LocalWidgetsPlugin; settings: LocalWidgetsSettings; addInterval: (callback: () => void, delay: number) => void; editBlock?: () => void; }
export interface WidgetDefinition { id: string; name: string; description: string; category: WidgetCategory; icon: string; defaultCode: string; render: (source: string, el: HTMLElement, ctx: WidgetContext) => void | Promise<void>; }