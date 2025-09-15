# APP-BASE Template

Template base ottimizzato per app Quasar con supporto iOS/Android tramite Capacitor.

## Cosa include

### ✅ Configurazioni ottimizzate
- **Quasar Config**: Build targets moderni, PWA ottimizzata, Service Worker con caching strategies
- **Capacitor**: Configurato per iOS e Android con ottimizzazioni specifiche per piattaforma
- **TypeScript**: Setup completo per sviluppo type-safe
- **i18n**: Sistema internazionalizzazione pronto
- **PWA**: Service Worker con strategie di cache ottimizzate

### ✅ Dipendenze essenziali
- **Pinia**: State management con persistenza automatica
- **Axios**: HTTP client pre-configurato
- **Vue i18n**: Internazionalizzazione
- **Capacitor Plugins**: Camera, Geolocation, Haptics, Push Notifications, ecc.
- **PWA Elements**: Supporto Capacitor per web/PWA

### ✅ Boot files
- `pinia.js`: Store management con debug in sviluppo
- `axios.js`: Client HTTP con interceptors
- `i18n.js`: Sistema multilingua
- `capacitor-pwa-elements.js`: Supporto camera/native su PWA

### ✅ Ottimizzazioni Mobile
- **iOS**: contentInset automatic, preferredContentMode mobile
- **Android**: allowMixedContent false, webContentsDebuggingEnabled false
- **PWA**: Manifest ottimizzato, shortcuts, share target
- **Service Worker**: Cache API, fonts, immagini, assets statici

## Come utilizzare il template

### 🚀 **Metodo 1: Script Automatico (RACCOMANDATO)**

Usa lo script intelligente che personalizza automaticamente tutto:

```bash
# Da qualsiasi directory
create-quasar-app .           # Crea nella directory corrente
create-quasar-app /path/to/dir # Crea in un percorso specifico
create-quasar-app             # Ti chiederà dove creare il progetto
```

Lo script ti chiederà:
- 📦 **Nome progetto** (es: my-awesome-app)
- 🏷️ **App ID** (es: com.company.myapp) 
- 📱 **Nome visualizzato** (es: My Awesome App)
- 📝 **Descrizione** del progetto
- 🎨 **Colore tema** (hex color)

E automaticamente:
- ✅ Crea il progetto personalizzato
- ✅ Aggiorna tutti i file di configurazione
- ✅ Installa le dipendenze
- ✅ Genera README.md personalizzato

### 📋 **Metodo 2: Copia Manuale**

```bash
# 1. Copia il template
cp -r /home/mas/Documents/MumbleProjects/APP-BASE /path/to/new-project
cd /path/to/new-project

# 2. Personalizza manualmente
# - package.json: name, appId, description
# - src-capacitor/capacitor.config.json: appId, appName, colori
# - quasar.config.js: PWA config, colori tema

# 3. Installa dipendenze
npm install
```

### 🔧 **Sviluppo**

```bash
npm run dev              # Web development
quasar dev -m capacitor  # Mobile development

# Build per produzione
npm run build                    # Web/PWA build
quasar build -m capacitor -T ios # iOS build  
quasar build -m capacitor -T android # Android build
```

## Struttura del template

```
APP-BASE/
├── src/
│   ├── boot/           # Boot files per inizializzazione
│   ├── i18n/          # File internazionalizzazione
│   └── ...            # Struttura Quasar standard
├── src-capacitor/     # Configurazioni Capacitor
├── quasar.config.js   # Configurazione ottimizzata
├── package.json       # Dipendenze essenziali
└── TEMPLATE.md        # Questa documentazione
```

## Personalizzazioni disponibili

### Colori e tema
- `capacitor.config.json`: backgroundColor per splash screen
- `quasar.config.js`: theme_color e background_color per PWA

### API
- `quasar.config.js`: URLs per sviluppo e produzione
- `src/boot/axios.js`: Interceptors e configurazioni HTTP

### Capacitor Plugins
Plugins già configurati:
- Camera, Filesystem, Geolocation
- Haptics, Preferences, Share
- Status Bar, Toast, Push Notifications

### PWA Features
- Service Worker con cache ottimizzate
- Manifest con shortcuts e share target
- Offline support per funzionalità base

## Note importanti

- Template ottimizzato per **Node 20+**
- Supporta **Vue 3 + Composition API**
- **TypeScript ready** (configurazione in .quasar/)
- **PWA compliant** con tutti i requisiti moderni
- **Mobile-first** con ottimizzazioni specifiche iOS/Android

## Prossimi passi dopo il setup

1. Personalizzare le pagine in `src/pages/`
2. Aggiungere store Pinia in `src/stores/`
3. Configurare routing in `src/router/`
4. Aggiungere componenti personalizzati
5. Configurare CI/CD per build automatici

---

**Template creato da**: Base ottimizzata del progetto BDrive
**Versione**: 1.0.0
**Ultima modifica**: Settembre 2024