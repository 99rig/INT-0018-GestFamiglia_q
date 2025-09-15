#!/bin/bash

# 🚀 Mumble Projects - Quasar App Generator
# Crea nuovi progetti basati su APP-BASE template
# Uso: ./create-project.sh [target-directory]

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directory del template (questo script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR"

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🚀 MUMBLE PROJECTS                            ║"
echo "║                 Quasar App Generator                         ║"
echo "║              Powered by APP-BASE Template                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Funzione per validare app ID
validate_app_id() {
    local app_id="$1"
    if [[ ! $app_id =~ ^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$ ]]; then
        return 1
    fi
    return 0
}

# Funzione per validare nome progetto
validate_project_name() {
    local name="$1"
    if [[ ! $name =~ ^[a-z0-9-]+$ ]]; then
        return 1
    fi
    return 0
}

# Determina directory target
TARGET_DIR=""
if [ "$1" = "." ]; then
    TARGET_DIR="$(pwd)"
    echo -e "${CYAN}📍 Target: Directory corrente${NC}"
elif [ -n "$1" ]; then
    TARGET_DIR="$(realpath "$1")"
    echo -e "${CYAN}📍 Target: $TARGET_DIR${NC}"
else
    echo -e "${YELLOW}📁 Inserisci il percorso dove creare il progetto:${NC}"
    read -p "Directory (o '.' per corrente): " user_dir
    if [ "$user_dir" = "." ]; then
        TARGET_DIR="$(pwd)"
    else
        TARGET_DIR="$(realpath "$user_dir")"
    fi
fi

echo ""

# Raccolta parametri
echo -e "${BLUE}📋 Configurazione del nuovo progetto:${NC}"
echo ""

# Nome progetto
while true; do
    echo -e "${YELLOW}📦 Nome del progetto (es: my-awesome-app):${NC}"
    echo -e "${CYAN}   - Solo lettere minuscole, numeri e trattini${NC}"
    echo -e "${CYAN}   - Sarà usato come nome cartella e package${NC}"
    read -p "Nome progetto: " PROJECT_NAME
    
    if validate_project_name "$PROJECT_NAME"; then
        break
    else
        echo -e "${RED}❌ Nome non valido. Usa solo lettere minuscole, numeri e trattini${NC}"
        echo ""
    fi
done

# App ID
while true; do
    echo ""
    echo -e "${YELLOW}🏷️  App ID (es: com.company.myapp):${NC}"
    echo -e "${CYAN}   - Formato: com.company.appname${NC}"
    echo -e "${CYAN}   - Usato per identificare l'app negli store${NC}"
    
    # Suggerimento basato sul nome progetto
    SUGGESTED_ID="com.mumble.${PROJECT_NAME//-/}"
    echo -e "${CYAN}   - Suggerito: $SUGGESTED_ID${NC}"
    
    read -p "App ID [$SUGGESTED_ID]: " APP_ID
    
    # Usa il suggerimento se vuoto
    if [ -z "$APP_ID" ]; then
        APP_ID="$SUGGESTED_ID"
    fi
    
    if validate_app_id "$APP_ID"; then
        break
    else
        echo -e "${RED}❌ App ID non valido. Formato: com.company.appname${NC}"
    fi
done

# Display Name
echo ""
echo -e "${YELLOW}📱 Nome visualizzato (es: My Awesome App):${NC}"
echo -e "${CYAN}   - Nome mostrato sull'icona dell'app${NC}"
echo -e "${CYAN}   - Può contenere spazi e caratteri speciali${NC}"

# Suggerimento basato sul nome progetto
SUGGESTED_DISPLAY=$(echo "$PROJECT_NAME" | sed 's/-/ /g' | sed 's/\b\w/\u&/g')
echo -e "${CYAN}   - Suggerito: $SUGGESTED_DISPLAY${NC}"

read -p "Nome visualizzato [$SUGGESTED_DISPLAY]: " DISPLAY_NAME

if [ -z "$DISPLAY_NAME" ]; then
    DISPLAY_NAME="$SUGGESTED_DISPLAY"
fi

# Descrizione
echo ""
echo -e "${YELLOW}📝 Descrizione del progetto:${NC}"
echo -e "${CYAN}   - Breve descrizione della tua app${NC}"

SUGGESTED_DESC="A Quasar application powered by Mumble Projects"
echo -e "${CYAN}   - Suggerito: $SUGGESTED_DESC${NC}"

read -p "Descrizione [$SUGGESTED_DESC]: " DESCRIPTION

if [ -z "$DESCRIPTION" ]; then
    DESCRIPTION="$SUGGESTED_DESC"
fi

# Colore tema
echo ""
echo -e "${YELLOW}🎨 Colore tema principale (hex):${NC}"
echo -e "${CYAN}   - Colore principale dell'app (es: #1976d2)${NC}"
echo -e "${CYAN}   - Usato per splash screen, PWA theme, ecc.${NC}"

SUGGESTED_COLOR="#3A3F4A"
echo -e "${CYAN}   - Suggerito: $SUGGESTED_COLOR (Mumble Primary)${NC}"

read -p "Colore tema [$SUGGESTED_COLOR]: " THEME_COLOR

if [ -z "$THEME_COLOR" ]; then
    THEME_COLOR="$SUGGESTED_COLOR"
fi

# Riepilogo
echo ""
echo -e "${GREEN}✨ Riepilogo configurazione:${NC}"
echo -e "${CYAN}   📦 Nome progetto:    $PROJECT_NAME${NC}"
echo -e "${CYAN}   🏷️  App ID:          $APP_ID${NC}"
echo -e "${CYAN}   📱 Nome visualizzato: $DISPLAY_NAME${NC}"
echo -e "${CYAN}   📝 Descrizione:      $DESCRIPTION${NC}"
echo -e "${CYAN}   🎨 Colore tema:      $THEME_COLOR${NC}"
echo -e "${CYAN}   📁 Directory target: $TARGET_DIR/$PROJECT_NAME${NC}"
echo ""

# Conferma
read -p "🚀 Procedere con la creazione? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Operazione annullata${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🔧 Creazione progetto in corso...${NC}"

# Verifica che la directory target non esista
PROJECT_PATH="$TARGET_DIR/$PROJECT_NAME"
if [ -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Errore: Directory $PROJECT_PATH già esistente${NC}"
    exit 1
fi

# Crea directory target se non esiste
mkdir -p "$TARGET_DIR"

# Copia template
echo -e "${BLUE}📋 Copia del template APP-BASE...${NC}"
cp -r "$TEMPLATE_DIR" "$PROJECT_PATH"

# Rimuovi script e documentazione del template
cd "$PROJECT_PATH"
rm -f create-project.sh
rm -f TEMPLATE.md

# Aggiorna package.json
echo -e "${BLUE}📝 Aggiornamento package.json...${NC}"
jq --arg name "$PROJECT_NAME" \
   --arg description "$DESCRIPTION" \
   --arg productName "$DISPLAY_NAME" \
   '.name = $name | .description = $description | .productName = $productName' \
   package.json > package.json.tmp && mv package.json.tmp package.json

# Aggiorna capacitor.config.json
echo -e "${BLUE}📱 Aggiornamento configurazione Capacitor...${NC}"
jq --arg appId "$APP_ID" \
   --arg appName "$DISPLAY_NAME" \
   --arg bgColor "$THEME_COLOR" \
   --arg userAgent "$DISPLAY_NAME/1.0" \
   '.appId = $appId | .appName = $appName | .backgroundColor = $bgColor | .ios.backgroundColor = $bgColor | .ios.overrideUserAgent = $userAgent | .android.backgroundColor = $bgColor | .plugins.SplashScreen.backgroundColor = $bgColor | .plugins.StatusBar.backgroundColor = $bgColor' \
   src-capacitor/capacitor.config.json > src-capacitor/capacitor.config.json.tmp && mv src-capacitor/capacitor.config.json.tmp src-capacitor/capacitor.config.json

# Aggiorna quasar.config.js per PWA
echo -e "${BLUE}🌐 Aggiornamento configurazione PWA...${NC}"
sed -i.bak "s/json\.name = 'Mumble App'/json.name = '$DISPLAY_NAME'/g" quasar.config.js
sed -i.bak "s/json\.short_name = 'Mumble'/json.short_name = '$PROJECT_NAME'/g" quasar.config.js
sed -i.bak "s/json\.description = 'Powered by Mumble Projects'/json.description = '$DESCRIPTION'/g" quasar.config.js
sed -i.bak "s/json\.theme_color = '#3A3F4A'/json.theme_color = '$THEME_COLOR'/g" quasar.config.js
sed -i.bak "s/json\.background_color = '#E5E9DF'/json.background_color = '$THEME_COLOR'/g" quasar.config.js
sed -i.bak "s/appId: 'app-base'/appId: '$PROJECT_NAME'/g" quasar.config.js
rm -f quasar.config.js.bak

# Crea README.md personalizzato
echo -e "${BLUE}📄 Creazione README.md...${NC}"
cat > README.md << EOF
# $DISPLAY_NAME

$DESCRIPTION

## 🚀 Progetto generato con Mumble Projects

Questo progetto è stato creato utilizzando il boilerplate APP-BASE ottimizzato per Quasar con supporto iOS/Android.

### ⚡ Quick Start

\`\`\`bash
# Installa dipendenze
npm install

# Sviluppo web
npm run dev

# Sviluppo mobile
quasar dev -m capacitor

# Build per produzione
npm run build                      # Web/PWA
quasar build -m capacitor -T ios   # iOS
quasar build -m capacitor -T android # Android
\`\`\`

### 📱 Configurazione

- **App ID**: $APP_ID
- **Nome**: $DISPLAY_NAME
- **Tema**: $THEME_COLOR

### 🛠️ Stack Tecnologico

- Vue 3 + Composition API
- Quasar Framework
- Capacitor per mobile
- Pinia per state management
- PWA ready con Service Worker
- TypeScript support

### 📦 Plugin Capacitor inclusi

- 📸 Camera/WebCam
- 📍 Geolocation/GPS
- 🔔 Push Notifications
- 📱 Haptics/Vibrazione
- 📁 Filesystem
- 📤 Share
- 💾 Preferences
- 📊 Status Bar
- 🍞 Toast

---

**Creato il**: $(date)  
**Template**: APP-BASE v1.0.0  
**Generator**: Mumble Projects
EOF

# Genera icone Mumble per il progetto
if [ -f "$PROJECT_PATH/generate-mumble-icons.sh" ]; then
    echo -e "${BLUE}🎨 Generazione icone Mumble...${NC}"
    cd "$PROJECT_PATH"
    ./generate-mumble-icons.sh > /dev/null 2>&1
    echo -e "${GREEN}✅ Icone generate${NC}"
fi

# Installa dipendenze
echo -e "${BLUE}📦 Installazione dipendenze...${NC}"
npm install --silent

echo ""
echo -e "${GREEN}✅ Progetto creato con successo!${NC}"
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗"
echo -e "║                    🎉 PROGETTO PRONTO                       ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📁 Percorso: $PROJECT_PATH${NC}"
echo -e "${CYAN}🚀 Per iniziare:${NC}"
echo -e "${YELLOW}   cd $PROJECT_NAME${NC}"
echo -e "${YELLOW}   npm run dev${NC}"
echo ""
echo -e "${GREEN}🔥 Il tuo nuovo progetto Quasar è pronto per il decollo!${NC}"
echo ""