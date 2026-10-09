#!/usr/bin/env bash
# Regenerates src/assets/fonts/material-symbols-outlined.woff2 (bundled by webpack): a Material Symbols Outlined subset
# containing only the glyphs listed in src/components/ui/iconNames.ts (Apache-2.0, Google).
set -euo pipefail
cd "$(dirname "$0")/.."

names=$(grep -o '"[a-z_]*",' src/components/ui/iconNames.ts | tr -d '",' | paste -sd, -)
css_url="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..500,0..1,0&icon_names=${names}&display=block"
ua="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

font_url=$(curl -fsSL -A "$ua" "$css_url" | grep -o 'https://[^)]*' | head -1)
[ -n "$font_url" ] || { echo "no font URL in Google Fonts response" >&2; exit 1; }

mkdir -p src/assets/fonts
curl -fsSL -o src/assets/fonts/material-symbols-outlined.woff2 "$font_url"
echo "wrote src/assets/fonts/material-symbols-outlined.woff2 ($(wc -c < src/assets/fonts/material-symbols-outlined.woff2) bytes, $(echo "$names" | tr ',' '\n' | wc -l | tr -d ' ') glyphs)"
