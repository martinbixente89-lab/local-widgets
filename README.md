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

## Ajouter un widget

Créez un fichier dans `src/widgets/` qui exporte un `WidgetDefinition`, puis importez-le et ajoutez-le au tableau `allWidgets` dans `src/widgets/index.ts`. Utilisez `readParams`, `base` et les variables CSS existantes pour conserver le comportement et le style communs. Les timers doivent passer par `ctx.addInterval` afin d’être nettoyés avec le bloc Markdown. Les rendus réseau peuvent être asynchrones et doivent utiliser `requestUrl`.
