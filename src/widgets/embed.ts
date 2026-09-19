import { WidgetDefinition } from '../types';
import { base, readParams, text } from '../utils';

function embedUrl(raw: string): string | null {
	const url = new URL(raw);
	const host = url.hostname.toLowerCase().replace(/^www\./, '');
	if (host === 'youtube.com' && url.pathname === '/watch') {
		const video = url.searchParams.get('v'); return video ? `https://www.youtube.com/embed/${encodeURIComponent(video)}` : null;
	}
	if (host === 'youtu.be') { const video = url.pathname.slice(1).split('/')[0]; return video ? `https://www.youtube.com/embed/${encodeURIComponent(video)}` : null; }
	if (host === 'youtube.com' && url.pathname.startsWith('/shorts/')) { const video = url.pathname.split('/')[2]; return video ? `https://www.youtube.com/embed/${encodeURIComponent(video)}` : null; }
	if (host === 'open.spotify.com') { const parts = url.pathname.split('/').filter(Boolean); return parts.length >= 2 ? `https://open.spotify.com/embed/${parts[0]}/${parts[1]}` : null; }
	if (host === 'giphy.com') { const parts = url.pathname.split('/').filter(Boolean); const id = parts.at(-1); return id ? `https://giphy.com/embed/${encodeURIComponent(id)}` : null; }
	return null;
}

const embed: WidgetDefinition = { id: 'embed', name: 'Embed média', description: 'Spotify, YouTube ou GIPHY via une URL.', category: 'Média', icon: '▶', defaultCode: '```embed\nurl: https://www.youtube.com/watch?v=dQw4w9WgXcQ\ncolor: blue\n```', render(source, el, ctx) { const params = readParams(source); const root = base(el, params, ctx, 'widget-embed'); const raw = text(params.url, ''); let src: string | null; try { src = embedUrl(raw); } catch { root.createDiv({ cls: 'local-widgets-error', text: 'URL invalide. Utilisez un lien Spotify, YouTube ou GIPHY.' }); return; } if (!src) { root.createDiv({ cls: 'local-widgets-error', text: 'Lien non reconnu. Formats acceptés : Spotify, YouTube (watch ou youtu.be) et GIPHY.' }); return; } const frame = root.createEl('iframe', { attr: { src, loading: 'lazy', allow: 'autoplay; encrypted-media; picture-in-picture', frameborder: '0' } }); frame.setAttribute('title', 'Média intégré'); } };
export default embed;