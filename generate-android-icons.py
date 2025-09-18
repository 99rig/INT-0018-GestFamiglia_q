#!/usr/bin/env python3
"""
Script per generare icone Android PNG dalle icone SVG
"""

import subprocess
import sys
from pathlib import Path

# Dimensioni icone Android per ogni densità
ANDROID_DENSITIES = {
    'mdpi': 48,      # baseline
    'hdpi': 72,      # 1.5x
    'xhdpi': 96,     # 2x
    'xxhdpi': 144,   # 3x
    'xxxhdpi': 192   # 4x
}

def check_dependencies():
    """Controlla se inkscape o rsvg-convert sono disponibili"""
    converters = ['inkscape', 'rsvg-convert']
    available_converter = None

    for converter in converters:
        try:
            result = subprocess.run([converter, '--version'],
                                  capture_output=True, text=True)
            if result.returncode == 0:
                available_converter = converter
                print(f"✅ Trovato {converter}")
                break
        except FileNotFoundError:
            continue

    if not available_converter:
        print("❌ Errore: Non è disponibile nessun convertitore SVG->PNG")
        print("Installa uno di questi:")
        print("- sudo apt install inkscape")
        print("- sudo apt install librsvg2-bin")
        return None

    return available_converter

def convert_svg_to_png(svg_file, png_file, size, converter):
    """Converte SVG in PNG usando il converter disponibile"""

    if converter == 'inkscape':
        cmd = [
            'inkscape',
            f'--export-filename={png_file}',
            f'--export-width={size}',
            f'--export-height={size}',
            str(svg_file)
        ]
    elif converter == 'rsvg-convert':
        cmd = [
            'rsvg-convert',
            '-w', str(size),
            '-h', str(size),
            '-f', 'png',
            '-o', str(png_file),
            str(svg_file)
        ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return True
        else:
            print(f"❌ Errore conversione: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Errore: {e}")
        return False

def generate_android_icons():
    """Genera tutte le icone Android PNG"""

    # Controlla dependencies
    converter = check_dependencies()
    if not converter:
        return

    # Path di base
    base_path = Path("src-capacitor/android/app/src/main/res")

    # Icona sorgente (192x192 è una buona base)
    source_svg = Path("public/icons/icon-192x192.svg")

    if not source_svg.exists():
        print(f"❌ File sorgente non trovato: {source_svg}")
        print("Esegui prima: python generate-icons.py")
        return

    print("🤖 Generando icone Android...")

    total_generated = 0

    for density, size in ANDROID_DENSITIES.items():
        density_dir = base_path / f"mipmap-{density}"
        density_dir.mkdir(parents=True, exist_ok=True)

        # Icona normale
        ic_launcher = density_dir / "ic_launcher.png"
        if convert_svg_to_png(source_svg, ic_launcher, size, converter):
            print(f"✅ {ic_launcher}")
            total_generated += 1

        # Icona rotonda (stessa immagine, ma sarà ritagliata dal sistema)
        ic_launcher_round = density_dir / "ic_launcher_round.png"
        if convert_svg_to_png(source_svg, ic_launcher_round, size, converter):
            print(f"✅ {ic_launcher_round}")
            total_generated += 1

        # Foreground per icone adaptive (Android 8+)
        ic_launcher_foreground = density_dir / "ic_launcher_foreground.png"
        if convert_svg_to_png(source_svg, ic_launcher_foreground, size, converter):
            print(f"✅ {ic_launcher_foreground}")
            total_generated += 1

    print(f"\n🎉 Generate {total_generated} icone Android!")
    print(f"📁 Cartella: {base_path.absolute()}")
    print("\n📋 Prossimi passi:")
    print("1. Ricompila l'app: quasar build")
    print("2. Sincronizza Capacitor: npx cap sync android")
    print("3. Genera APK: npx cap build android")
    print("4. L'icona dovrebbe apparire nell'APK!")

if __name__ == "__main__":
    generate_android_icons()