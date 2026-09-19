# Local Widgets

Plugin Obsidian qui transforme des blocs de code locaux en widgets esthétiques : compte à rebours, progression, horloges, citation, Pomodoro, embeds média, habitudes, phase de lune, météo, calendrier, ambiance et calculatrice scientifique.

## Installation

Copiez `main.js`, `manifest.json` et `styles.css` dans `VotreVault/.obsidian/plugins/local-widgets/`, puis activez **Local Widgets** dans **Paramètres → Plugins communautaires**.

## Développement

```bash
npm install
npm run dev       # compilation avec surveillance
npm run build     # vérification TypeScript et bundle production
npm run lint
```

L’icône du ruban ou la commande **Insérer un widget** ouvre le menu filtrable. Le bloc YAML peut ensuite être modifié directement dans la note, par exemple :

```countdown
date: 2026-12-20
label: Examen final
color: blue
icon: 🎓
```

Les liens Spotify, YouTube (`watch?v=`, `youtu.be`, Shorts) et GIPHY sont convertis automatiquement vers leur URL d’embed. Le bouton crayon affiché au survol d’un widget replace le curseur dans son bloc source.

Le widget météo utilise Open-Meteo avec un cache local de 30 minutes. Le calendrier génère des liens vers les notes quotidiennes du dossier indiqué. Le widget ambiance lit uniquement les fichiers audio présents dans le vault, et la calculatrice utilise `mathjs` sans évaluer de code JavaScript arbitraire.

Le widget `flipclock` propose les modes `clock`, `timer` et `stopwatch`. Les minuteurs et chronomètres sauvegardent leur état dans les données du plugin et utilisent les paramètres `duration`, `autostart`, `on-finish`, `loop`, `laps` et `id`. Les options d’horloge communes sont `format`, `ampm`, `leading-zero`, `timezone`, `seconds` et `hours`.

## Citation du jour

Le widget `quote` choisit la même citation pour toute la journée dans toutes les notes, puis change automatiquement à minuit. La sélection `daily` parcourt les citations sans répétition avant la fin d’un cycle.

```quote
mode: daily
lang: fr
font: elegant
size: large
weight: normal
style: italic
align: left
text-color: normal
border-color: accent
bar-color: accent
background: transparent
author: true
author-style: normal
author-color: muted
```

Paramètres : `source` (`builtin`, `file`, `inline`), `file`, `quotes`, `lang` (`fr`, `en`, `all`), `category` (`motivation`, `sagesse`, `science`, `littérature`, `humour`, `all`), `mode` (`daily`, `random`), `author`, `font`, `size`, `weight`, `style`, `align`, `text-color`, `border-color`, `bar-color`, `background`, `border` et `bar`. Les options auteur sont `author-font`, `author-size`, `author-weight`, `author-style` et `author-color`. Les couleurs acceptent les valeurs CSS et les alias `accent`, `muted`, `normal`. `color` reste accepté comme raccourci pour la barre et le contour.

Pour une source personnelle, utilisez une citation par ligne dans `Citations.md`, au format `Texte — Auteur`. Pour une liste inline, utilisez `quotes:` avec des chaînes ou des objets `{ text, author, lang, category }`.

### Paramètres graphiques

Survolez un widget pour ouvrir son menu de paramètres. La modale relit toujours le bloc depuis le vault : le bloc est l’unique source de vérité. Chaque changement est écrit dans le bloc avec une opération atomique, sans réordonner ni supprimer les clés inconnues. Le bouton **Voir le code** place le curseur dans le bloc source.

Les modifications manuelles du bloc sont relues tant que la modale est ouverte. Les champs actuellement saisis ne sont pas remplacés pendant leur focus. Les clés absentes utilisent leur valeur par défaut et le bouton **Par défaut** supprime la clé du YAML.

## Ajouter un widget

Créez un fichier dans `src/widgets/` qui exporte un `WidgetDefinition`, puis importez-le et ajoutez-le au tableau `allWidgets` dans `src/widgets/index.ts`. Utilisez `readParams`, `base` et les variables CSS existantes pour conserver le comportement et le style communs. Les timers doivent passer par `ctx.addInterval` afin d’être nettoyés avec le bloc Markdown. Les rendus réseau peuvent être asynchrones et doivent utiliser `requestUrl`.
