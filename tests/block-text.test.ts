import { describe, expect, it } from 'vitest';
import { blockBody, blockRank, findCodeBlocks, removeBlockKey, writeBlockKey } from '../src/utils/block-text';
import { normalizeParams } from '../src/params';

const note = ['# Note', '```quote', 'font: serif', 'text-color: normal', '```', '', '```quote', 'font: "Playfair Display"', '```', '', '```clock', 'timezone: Europe/Paris', '```'].join('\n');

describe('block text helpers', () => {
	it('identifie le n-ième bloc du même langage', () => {
		expect(findCodeBlocks(note, 'quote')).toHaveLength(2);
		expect(blockRank(note, 'quote', 6)).toBe(1);
		expect(blockBody(note, findCodeBlocks(note, 'quote')[1]!)).toContain('Playfair Display');
	});
	it('ajoute, remplace et supprime une clé sans toucher aux commentaires', () => {
		const block = findCodeBlocks(note, 'quote')[0]!;
		const withComment = note.replace('font: serif', '# garder cette ligne\nfont: serif');
		const current = findCodeBlocks(withComment, 'quote')[0]!;
		const added = writeBlockKey(withComment, current, 'background', '#a3c', 'color');
		expect(added).toContain('background: "#a3c"');
		const changed = writeBlockKey(added, findCodeBlocks(added, 'quote')[0]!, 'font', 'Playfair Display', 'font');
		expect(changed).toContain('font: "Playfair Display"');
		expect(changed).toContain('# garder cette ligne');
		const removed = removeBlockKey(changed, findCodeBlocks(changed, 'quote')[0]!, 'font');
		expect(blockBody(removed, findCodeBlocks(removed, 'quote')[0]!)).not.toContain('font: "Playfair Display"');
		void block;
	});
	it('écrit les booléens et nombres en YAML natif', () => {
		const block = findCodeBlocks(note, 'quote')[0]!;
		expect(writeBlockKey(note, block, 'author', true, 'toggle')).toContain('author: true');
		expect(writeBlockKey(note, block, 'days', 28, 'number')).toContain('days: 28');
	});
	it('normalise les valeurs absentes sans écraser les valeurs présentes', () => {
		const widget = { id: 'quote', name: 'Quote', description: '', category: 'Fun', icon: '', defaultCode: '', settings: [{ key: 'font', label: 'Police', type: 'text' as const, default: 'serif' }] };
		expect(normalizeParams(widget, 'font: mono').font).toBe('mono');
		expect(normalizeParams(widget, '').font).toBe('serif');
	});
});