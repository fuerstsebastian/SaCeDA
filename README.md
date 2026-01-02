# SaCeDA
Saarland Centre for Digital Archaeology
# SaCeDA Network - Digital Archaeology Hub

Ein interaktives Netzwerk zur Visualisierung von Methoden, Projekten, Personen und Institutionen im Bereich der Digitalen Archäologie am Saarland Center for Digital Archaeology.

## 🌐 Live Demo

Die Seite ist erreichbar unter: `https://fuerstsebastian.github.io/SaCeDA/`

## ✨ Features

- **Interaktives Netzwerk** mit filterbaren Kategorien
- **Hierarchische Methoden-Struktur** (3 Ebenen) mit Akkordeon-Navigation
- **Vollständige Zweisprachigkeit** (Deutsch/Englisch)
- **Responsive Design** für Desktop und Mobile
- **Dunkles, futuristisches Design** mit Animationen
- **Automatisch generierte Projektseiten** aus JSON-Daten
- **Externe Verlinkungen** zu Personen- und Institutionsseiten

## 📁 Repository-Struktur

```
├── index.html              # Hauptseite mit Netzwerk
├── styles.css              # Hauptstyles
├── i18n.js                 # Übersetzungssystem
├── network.js              # Netzwerk-Logik
├── data/
│   ├── network.json        # Netzwerkdaten (aus Gephi)
│   ├── projects.json       # Projektbeschreibungen
│   └── external-links.json # URLs für Personen/Institutionen
├── projects/
│   └── template.html       # Template für Projektseiten
└── images/
    └── projects/           # Projektbilder
        └── projekt-id/
            ├── image-01.jpg
            ├── image-02.jpg
            └── image-03.jpg
```

## 🚀 Quick Start

### 1. Repository klonen/forken

```bash
git clone https://github.com/[username]/[repo-name].git
```

### 2. Netzwerkdaten aktualisieren

Ersetzen Sie `data/network.json` mit Ihren Gephi-Export-Daten.

### 3. Projektdaten hinzufügen

Bearbeiten Sie `data/projects.json` und fügen Sie Ihre Projekte hinzu.

### 4. Externe Links konfigurieren

Bearbeiten Sie `data/external-links.json` mit URLs zu Personen- und Institutionsseiten.

### 5. Bilder hochladen

Laden Sie Projektbilder nach `images/projects/[projekt-id]/` hoch.

### 6. GitHub Pages aktivieren

- Settings → Pages → Source: main branch, / (root)
- Nach 1-2 Minuten ist die Seite live!

## 📝 Daten-Formate

### network.json

Exportieren Sie Ihr Netzwerk aus Gephi als JSON. Erforderliche Felder:

```json
{
  "nodes": [
    {
      "key": "1",
      "attributes": {
        "label": "Node Name",
        "role": "Method|Project|Person|Institution|Application Field|Teaching",
        "rang": 1.0,
        "color": "#4a86e8"
      }
    }
  ],
  "edges": [
    {
      "source": "1",
      "target": "2",
      "attributes": {
        "relation": "has_subcategory|utilizes|member_of|..."
      }
    }
  ]
}
```

### projects.json

```json
{
  "projects": [
    {
      "id": "projekt-id",
      "title": { "en": "Title", "de": "Titel" },
      "team": [{ "name": "Name", "url": "URL" }],
      "summary": { "en": "...", "de": "..." },
      "methods": ["Method 1", "Method 2"],
      "description": { "en": "<p>...</p>", "de": "<p>...</p>" },
      "images": ["images/projects/projekt-id/image-01.jpg"],
      "partners": { "en": "...", "de": "..." },
      "publications": { "en": [...], "de": [...] }
    }
  ]
}
```

### external-links.json

```json
{
  "Personenname": "https://...",
  "Institutionsname": "https://..."
}
```

**Wichtig:** Die Keys müssen exakt mit den `label`-Werten aus `network.json` übereinstimmen!

## 🎨 Anpassungen

### Farben ändern

Bearbeiten Sie die CSS-Variablen in `styles.css`:

```css
:root {
  --accent-blue: #4a86e8;
  --accent-cyan: #37a2bd;
  /* ... */
}
```

### Übersetzungen hinzufügen

Bearbeiten Sie `i18n.js`:

```javascript
const translations = {
  en: { key: "English text" },
  de: { key: "Deutscher Text" }
};
```

## 🐛 Troubleshooting

- **Netzwerk lädt nicht:** Prüfen Sie die JSON-Syntax mit jsonlint.com
- **Links funktionieren nicht:** Überprüfen Sie exakte Namensübereinstimmung in `external-links.json`
- **Bilder fehlen:** Prüfen Sie Pfade in `projects.json` und ob Bilder hochgeladen sind
- **Alte Version wird angezeigt:** Hard Reload mit Ctrl+Shift+R (Windows) oder Cmd+Shift+R (Mac)

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

## 🤝 Beitragen

Contributions sind willkommen! Bitte erstellen Sie einen Pull Request oder öffnen Sie ein Issue.

## 📧 Kontakt

Bei Fragen oder Problemen erstellen Sie bitte ein Issue in diesem Repository.
