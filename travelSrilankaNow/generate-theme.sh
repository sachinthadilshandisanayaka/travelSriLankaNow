#!/bin/sh
# Writes /usr/share/nginx/html/assets/theme.css based on THEME_PRESET, and
# replaces favicon.ico / favicon-32.png from FAVICON_URL if set.
# Runs as Docker CMD before nginx starts.

THEME="${THEME_PRESET:-navy}"
THEME_FILE="/usr/share/nginx/html/assets/theme.css"

echo "[theme] Applying theme: $THEME"

case "$THEME" in

  warm)
    cat > "$THEME_FILE" << 'EOF'
/* Theme: warm */
:root {
  --primary-navy-dark: #C62828;
  --primary-navy:      #FF8F00;
  --primary-blue:      #FBC02D;
  --primary-sky:       #F5F5DC;
  --accent-gold:       #D4AF73;

  --navy-bg-lightest: #FFFDF5;
  --navy-bg-light:    #FFF8E1;
  --navy-bg-soft:     #FFF3CC;

  --primary-sky-a05:       rgba(245,245,220,0.05);
  --primary-sky-a08:       rgba(245,245,220,0.08);
  --primary-sky-a10:       rgba(245,245,220,0.10);
  --primary-sky-a12:       rgba(245,245,220,0.12);
  --primary-sky-a15:       rgba(245,245,220,0.15);
  --primary-sky-a20:       rgba(245,245,220,0.20);
  --primary-sky-a30:       rgba(245,245,220,0.30);
  --primary-sky-a40:       rgba(245,245,220,0.40);
  --primary-sky-a50:       rgba(245,245,220,0.50);

  --primary-navy-dark-a05: rgba(198,40,40,0.05);
  --primary-navy-dark-a08: rgba(198,40,40,0.08);
  --primary-navy-dark-a10: rgba(198,40,40,0.10);
  --primary-navy-dark-a12: rgba(198,40,40,0.12);
  --primary-navy-dark-a15: rgba(198,40,40,0.15);
  --primary-navy-dark-a20: rgba(198,40,40,0.20);
  --primary-navy-dark-a30: rgba(198,40,40,0.30);
  --primary-navy-dark-a40: rgba(198,40,40,0.40);
  --primary-navy-dark-a50: rgba(198,40,40,0.50);

  --primary-navy-a05:  rgba(255,143,0,0.05);
  --primary-navy-a08:  rgba(255,143,0,0.08);
  --primary-navy-a10:  rgba(255,143,0,0.10);
  --primary-navy-a12:  rgba(255,143,0,0.12);
  --primary-navy-a15:  rgba(255,143,0,0.15);
  --primary-navy-a20:  rgba(255,143,0,0.20);
  --primary-navy-a30:  rgba(255,143,0,0.30);
  --primary-navy-a40:  rgba(255,143,0,0.40);
  --primary-navy-a50:  rgba(255,143,0,0.50);

  --primary-blue-a05:  rgba(251,192,45,0.05);
  --primary-blue-a08:  rgba(251,192,45,0.08);
  --primary-blue-a10:  rgba(251,192,45,0.10);
  --primary-blue-a12:  rgba(251,192,45,0.12);
  --primary-blue-a15:  rgba(251,192,45,0.15);
  --primary-blue-a20:  rgba(251,192,45,0.20);
  --primary-blue-a30:  rgba(251,192,45,0.30);
  --primary-blue-a40:  rgba(251,192,45,0.40);
  --primary-blue-a50:  rgba(251,192,45,0.50);

  --primary-blue-d10:  #F0AD05;

  --gradient-primary:       linear-gradient(135deg,#C62828 0%,#FF8F00 100%);
  --gradient-primary-hover: linear-gradient(135deg,#FF8F00 0%,#FBC02D 100%);
  --gradient-light:         linear-gradient(135deg,#FBC02D 0%,#F5F5DC 100%);
  --gradient-overlay:       linear-gradient(180deg,rgba(198,40,40,0.5) 0%,rgba(198,40,40,0.2) 100%);
  --gradient-calm:          linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(245,245,220,0.3) 100%);
}
EOF
    ;;

  *)  # navy (default)
    cat > "$THEME_FILE" << 'EOF'
/* Theme: navy */
:root {
  --primary-navy-dark: #0F2854;
  --primary-navy:      #1C4D8D;
  --primary-blue:      #4988C4;
  --primary-sky:       #BDE8F5;
  --accent-gold:       #D4AF73;

  --navy-bg-lightest: #F8FAFC;
  --navy-bg-light:    #F0F5FA;
  --navy-bg-soft:     #E8F0F8;

  --primary-sky-a05:       rgba(189,232,245,0.05);
  --primary-sky-a08:       rgba(189,232,245,0.08);
  --primary-sky-a10:       rgba(189,232,245,0.10);
  --primary-sky-a12:       rgba(189,232,245,0.12);
  --primary-sky-a15:       rgba(189,232,245,0.15);
  --primary-sky-a20:       rgba(189,232,245,0.20);
  --primary-sky-a30:       rgba(189,232,245,0.30);
  --primary-sky-a40:       rgba(189,232,245,0.40);
  --primary-sky-a50:       rgba(189,232,245,0.50);

  --primary-navy-dark-a05: rgba(15,40,84,0.05);
  --primary-navy-dark-a08: rgba(15,40,84,0.08);
  --primary-navy-dark-a10: rgba(15,40,84,0.10);
  --primary-navy-dark-a12: rgba(15,40,84,0.12);
  --primary-navy-dark-a15: rgba(15,40,84,0.15);
  --primary-navy-dark-a20: rgba(15,40,84,0.20);
  --primary-navy-dark-a30: rgba(15,40,84,0.30);
  --primary-navy-dark-a40: rgba(15,40,84,0.40);
  --primary-navy-dark-a50: rgba(15,40,84,0.50);

  --primary-navy-a05:  rgba(28,77,141,0.05);
  --primary-navy-a08:  rgba(28,77,141,0.08);
  --primary-navy-a10:  rgba(28,77,141,0.10);
  --primary-navy-a12:  rgba(28,77,141,0.12);
  --primary-navy-a15:  rgba(28,77,141,0.15);
  --primary-navy-a20:  rgba(28,77,141,0.20);
  --primary-navy-a30:  rgba(28,77,141,0.30);
  --primary-navy-a40:  rgba(28,77,141,0.40);
  --primary-navy-a50:  rgba(28,77,141,0.50);

  --primary-blue-a05:  rgba(73,136,196,0.05);
  --primary-blue-a08:  rgba(73,136,196,0.08);
  --primary-blue-a10:  rgba(73,136,196,0.10);
  --primary-blue-a12:  rgba(73,136,196,0.12);
  --primary-blue-a15:  rgba(73,136,196,0.15);
  --primary-blue-a20:  rgba(73,136,196,0.20);
  --primary-blue-a30:  rgba(73,136,196,0.30);
  --primary-blue-a40:  rgba(73,136,196,0.40);
  --primary-blue-a50:  rgba(73,136,196,0.50);

  --primary-blue-d10:  #356EA5;

  --gradient-primary:       linear-gradient(135deg,#0F2854 0%,#1C4D8D 100%);
  --gradient-primary-hover: linear-gradient(135deg,#1C4D8D 0%,#4988C4 100%);
  --gradient-light:         linear-gradient(135deg,#4988C4 0%,#BDE8F5 100%);
  --gradient-overlay:       linear-gradient(180deg,rgba(15,40,84,0.5) 0%,rgba(15,40,84,0.2) 100%);
  --gradient-calm:          linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(189,232,245,0.3) 100%);
}
EOF
    ;;
esac

echo "[theme] Done."

# ── Favicon ────────────────────────────────────────────────────────────────────
# Browsers fetch favicon.ico before JavaScript runs, so we replace the static
# file at container start using the FAVICON_URL env var.
if [ -n "$FAVICON_URL" ]; then
  HTML=/usr/share/nginx/html
  echo "[favicon] Downloading from $FAVICON_URL"
  wget -q -O "$HTML/favicon.ico"                    "$FAVICON_URL" && echo "[favicon] favicon.ico updated"
  wget -q -O "$HTML/assets/images/favicon-32.png"   "$FAVICON_URL" && echo "[favicon] favicon-32.png updated"
  wget -q -O "$HTML/assets/images/favicon-192.png"  "$FAVICON_URL" && echo "[favicon] favicon-192.png updated"
  wget -q -O "$HTML/assets/images/apple-touch-icon.png" "$FAVICON_URL" && echo "[favicon] apple-touch-icon.png updated"
else
  echo "[favicon] FAVICON_URL not set, using build default."
fi

exec nginx -g "daemon off;"
