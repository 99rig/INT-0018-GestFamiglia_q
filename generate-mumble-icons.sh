#!/bin/bash

# 🎨 Mumble Icons Generator
# Genera tutte le icone necessarie per l'app dai file SVG Mumble

set -e

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           🎨 MUMBLE ICONS GENERATOR                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Directory base
BASE_DIR="/home/mas/Documents/MumbleProjects/APP-BASE"
SVG_DIR="$BASE_DIR/public/mumble_svg"
ICONS_DIR="$BASE_DIR/public/icons"
SRC_PWA_DIR="$BASE_DIR/src-pwa/icons"

# Crea directory se non esistono
mkdir -p "$ICONS_DIR"
mkdir -p "$SRC_PWA_DIR"

# Verifica che esistano i file SVG
if [ ! -d "$SVG_DIR" ]; then
    echo -e "${YELLOW}❌ Directory SVG non trovata: $SVG_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}📁 Directory SVG trovata${NC}"
echo -e "${BLUE}🔧 Installazione dipendenze per conversione...${NC}"

# Installa sharp-cli se non presente
if ! command -v sharp &> /dev/null; then
    echo -e "${YELLOW}📦 Installazione sharp-cli...${NC}"
    npm install -g sharp-cli
fi

# Usa l'icona positiva come base per le icone app
ICON_SOURCE="$SVG_DIR/Mumble_Icona_Positivo.svg"
FAVICON_SOURCE="$SVG_DIR/Mumble_Favicon_Positivo.svg"

if [ ! -f "$ICON_SOURCE" ]; then
    echo -e "${YELLOW}⚠️  Mumble_Icona_Positivo.svg non trovato, uso Favicon${NC}"
    ICON_SOURCE="$FAVICON_SOURCE"
fi

echo -e "${GREEN}✅ File sorgente: $(basename $ICON_SOURCE)${NC}"
echo ""

# Funzione per convertire SVG in PNG con Inkscape o rsvg-convert
convert_svg_to_png() {
    local input=$1
    local output=$2
    local size=$3
    
    echo -e "${BLUE}  Generando: $(basename $output) (${size}x${size})${NC}"
    
    # Prima prova con Inkscape
    if command -v inkscape &> /dev/null; then
        inkscape "$input" --export-type=png --export-filename="$output" --export-width=$size --export-height=$size 2>/dev/null
    # Altrimenti usa rsvg-convert
    elif command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w $size -h $size "$input" -o "$output"
    # Altrimenti usa ImageMagick
    elif command -v convert &> /dev/null; then
        convert -background none -resize ${size}x${size} "$input" "$output"
    else
        echo -e "${YELLOW}⚠️  Nessun convertitore SVG trovato. Installa inkscape, librsvg o imagemagick${NC}"
        return 1
    fi
}

echo -e "${GREEN}🎨 Generazione icone favicon standard...${NC}"

# Genera favicon standard per Quasar
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/favicon-16x16.png" 16
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/favicon-32x32.png" 32
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/favicon-96x96.png" 96
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/favicon-128x128.png" 128
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/favicon-192x192.png" 192
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/favicon-256x256.png" 256
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/favicon-512x512.png" 512

echo ""
echo -e "${GREEN}📱 Generazione icone app mobile...${NC}"

# Genera icone per mobile app
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/icon-128x128.png" 128
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/icon-192x192.png" 192
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/icon-256x256.png" 256
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/icon-384x384.png" 384
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/icon-512x512.png" 512

echo ""
echo -e "${GREEN}🍎 Generazione icone iOS...${NC}"

# Genera icone iOS (diverse dimensioni richieste)
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/apple-icon-120x120.png" 120
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/apple-icon-152x152.png" 152
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/apple-icon-167x167.png" 167
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/apple-icon-180x180.png" 180
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/apple-icon-1024x1024.png" 1024

echo ""
echo -e "${GREEN}🤖 Generazione icone Android...${NC}"

# Genera icone Android adaptive
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/android-chrome-192x192.png" 192
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/android-chrome-512x512.png" 512
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/android-chrome-maskable-192x192.png" 192
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/android-chrome-maskable-512x512.png" 512

echo ""
echo -e "${GREEN}🌊 Generazione splash screens...${NC}"

# Genera splash screens
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/splash-1024x1024.png" 1024
convert_svg_to_png "$ICON_SOURCE" "$ICONS_DIR/splash-2048x2048.png" 2048

# Genera anche per src-pwa se esiste
if [ -d "$BASE_DIR/src-pwa" ]; then
    echo ""
    echo -e "${GREEN}📦 Copiando icone in src-pwa...${NC}"
    cp "$ICONS_DIR/icon-128x128.png" "$SRC_PWA_DIR/" 2>/dev/null || true
    cp "$ICONS_DIR/icon-192x192.png" "$SRC_PWA_DIR/" 2>/dev/null || true
    cp "$ICONS_DIR/icon-256x256.png" "$SRC_PWA_DIR/" 2>/dev/null || true
    cp "$ICONS_DIR/icon-384x384.png" "$SRC_PWA_DIR/" 2>/dev/null || true
    cp "$ICONS_DIR/icon-512x512.png" "$SRC_PWA_DIR/" 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}🎯 Generazione favicon.ico multi-risoluzione...${NC}"

# Genera favicon.ico con multiple risoluzioni
if command -v convert &> /dev/null; then
    convert "$ICONS_DIR/favicon-16x16.png" \
            "$ICONS_DIR/favicon-32x32.png" \
            "$ICONS_DIR/favicon-96x96.png" \
            "$BASE_DIR/public/favicon.ico"
    echo -e "${GREEN}✅ favicon.ico generato${NC}"
else
    echo -e "${YELLOW}⚠️  ImageMagick non trovato, favicon.ico non generato${NC}"
fi

# Copia i logo SVG principali
echo ""
echo -e "${GREEN}📄 Copiando logo SVG principali...${NC}"
cp "$SVG_DIR/Mumble_Logo_A_Positivo.svg" "$BASE_DIR/public/mumble-logo.svg"
cp "$SVG_DIR/Mumble_Logo_A_Negativo.svg" "$BASE_DIR/public/mumble-logo-white.svg"
cp "$SVG_DIR/Mumble_Icona_Positivo.svg" "$BASE_DIR/public/mumble-icon.svg"
cp "$SVG_DIR/Mumble_Icona_Negativo.svg" "$BASE_DIR/public/mumble-icon-white.svg"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ✅ GENERAZIONE COMPLETATA                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📊 Riepilogo:${NC}"
echo -e "${YELLOW}  • Favicon generati: 7 dimensioni${NC}"
echo -e "${YELLOW}  • Icone app: 5 dimensioni${NC}"
echo -e "${YELLOW}  • Icone iOS: 5 dimensioni${NC}"
echo -e "${YELLOW}  • Icone Android: 4 dimensioni${NC}"
echo -e "${YELLOW}  • Splash screens: 2 dimensioni${NC}"
echo -e "${YELLOW}  • Logo SVG copiati${NC}"
echo ""
echo -e "${GREEN}🚀 Le icone Mumble sono pronte!${NC}"