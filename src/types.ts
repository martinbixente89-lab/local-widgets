import { App } from 'obsidian';
import LocalWidgetsPlugin from './main';
import { LocalWidgetsSettings } from './settings';

export type WidgetCategory = 'Temps' | 'Productivité' | 'Média' | 'Nature' | 'Utilitaires' | 'Fun';
export type WidgetSettingType = 'text' | 'number' | 'select' | 'toggle' | 'color' | 'date' | 'font';
export interface WidgetSettingField { key: string; label: string; type: WidgetSettingType; default: unknown; options?: Record<string, string>; description?: string; section?: 'Contenu' | 'Police' | 'Couleurs' | 'Affichage'; }
export interface WidgetContext { app: App; plugin: LocalWidgetsPlugin; settings: LocalWidgetsSettings; sourcePath?: string; blockRank?: number; addInterval: (callback: () => void, delay: number) => void; addTimeout?: (callback: () => void, delay: number) => void; addWindowEvent?: (type: 'focus' | 'visibilitychange', callback: () => void) => void; addVaultModify?: (callback: (file: unknown) => void) => void; loadWidgetState?: <T>(key: string) => T | undefined; saveWidgetState?: (key: string, value: unknown) => void; editBlock?: () => void; openSettings?: () => void; }
export interface WidgetDefinition { id: string; name: string; description: string; category: WidgetCategory; icon: string; defaultCode: string; settings?: WidgetSettingField[]; render: (source: string, el: HTMLElement, ctx: WidgetContext) => void | Promise<void>; }