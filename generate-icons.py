#!/usr/bin/env python3
"""
Script per generare icone PWA con l'icona wallet su sfondo azzurro arrotondato
"""

import xml.etree.ElementTree as ET
from pathlib import Path

# Colori del template
PRIMARY_COLOR = "#239db0"  # Teal primary dal CSS
WHITE = "#ffffff"

# Dimensioni icone PWA richieste
PWA_SIZES = [
    16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512
]

def create_icon_svg(size, corner_radius_percent=20):
    """
    Crea un'icona SVG con sfondo colorato arrotondato e icona bianca centrata
    """
    # Calcola il raggio degli angoli arrotondati
    corner_radius = size * corner_radius_percent / 100

    # Dimensione dell'icona interna (70% della dimensione totale)
    icon_size = size * 0.7
    icon_offset = (size - icon_size) / 2

    # Crea l'SVG principale
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
    <!-- Sfondo arrotondato -->
    <rect width="{size}" height="{size}" rx="{corner_radius}" ry="{corner_radius}" fill="{PRIMARY_COLOR}"/>

    <!-- Icona wallet centrata e ridimensionata -->
    <g transform="translate({icon_offset}, {icon_offset}) scale({icon_size/24})">
        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="{WHITE}"/>
    </g>
</svg>'''

    return svg

def generate_all_icons():
    """Genera tutte le icone PWA necessarie"""

    # Crea la cartella icons se non esiste
    icons_dir = Path("public/icons")
    icons_dir.mkdir(exist_ok=True)

    print("🎨 Generando icone PWA...")

    for size in PWA_SIZES:
        # Crea SVG
        svg_content = create_icon_svg(size)

        # Salva il file SVG
        svg_file = icons_dir / f"icon-{size}x{size}.svg"
        with open(svg_file, 'w') as f:
            f.write(svg_content)

        print(f"✅ Creata: {svg_file}")

    # Crea anche versioni speciali
    special_icons = {
        "apple-touch-icon.svg": 180,
        "favicon.svg": 32,
        "icon-512.svg": 512  # Per manifest.json
    }

    for filename, size in special_icons.items():
        svg_content = create_icon_svg(size)
        svg_file = icons_dir / filename
        with open(svg_file, 'w') as f:
            f.write(svg_content)
        print(f"✅ Creata: {svg_file}")

    print(f"\n🎉 Generate {len(PWA_SIZES) + len(special_icons)} icone PWA!")
    print(f"📁 Cartella: {icons_dir.absolute()}")
    print("\n📋 Prossimi passi:")
    print("1. Aggiorna manifest.json con le nuove icone")
    print("2. Aggiorna index.html con i meta tag delle icone")
    print("3. Testa la PWA su dispositivi mobili")

if __name__ == "__main__":
    generate_all_icons()