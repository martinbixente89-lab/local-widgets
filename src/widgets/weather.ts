import { requestUrl } from 'obsidian';
import { WidgetDefinition } from '../types';
import { base, number, readParams, text } from '../utils';

interface WeatherData { current_weather?: { temperature?: number; windspeed?: number; weathercode?: number }; }
const cache = new Map<string, { expires: number; data: WeatherData }>();
const descriptions: Record<number, string> = { 0: 'Ciel dégagé', 1: 'Principalement dégagé', 2: 'Partiellement nuageux', 3: 'Couvert', 45: 'Brouillard', 51: 'Bruine', 61: 'Pluie', 71: 'Neige', 80: 'Averses', 95: 'Orage' };

const weather: WidgetDefinition = { id: 'weather', name: 'Météo', description: 'Conditions actuelles via Open-Meteo.', category: 'Nature', icon: '☀', defaultCode: '```weather\nlatitude: 48.8566\nlongitude: 2.3522\nlabel: Paris\ncolor: blue\n```', async render(source, el, ctx) {
	const params = readParams(source); const root = base(el, params, ctx, 'widget-weather'); const latitude = number(params.latitude, 48.8566, -90, 90); const longitude = number(params.longitude, 2.3522, -180, 180); const key = `${latitude},${longitude}`; const content = root.createDiv({ cls: 'widget-weather-content', text: 'Chargement de la météo…' });
	try {
		const cached = cache.get(key); const data = cached && cached.expires > Date.now() ? cached.data : (await requestUrl(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)).json as WeatherData;
		cache.set(key, { data, expires: Date.now() + 30 * 60 * 1000 }); const current = data.current_weather; if (!current || typeof current.temperature !== 'number') throw new Error('Réponse météo incomplète.');
		content.empty(); content.createDiv({ cls: 'widget-weather-temp', text: `${Math.round(current.temperature)}°` }); content.createDiv({ cls: 'widget-label', text: text(params.label, descriptions[current.weathercode ?? -1] ?? 'Conditions actuelles') }); content.createDiv({ cls: 'widget-weather-wind', text: `${Math.round(current.windspeed ?? 0)} km/h de vent` });
	} catch (error) { content.setText(`Météo indisponible : ${String(error)}`); content.addClass('local-widgets-error'); }
} };
export default weather;