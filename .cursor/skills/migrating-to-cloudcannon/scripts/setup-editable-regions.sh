#!/usr/bin/env bash
set -euo pipefail

# Sets up @cloudcannon/editable-regions boilerplate for an Astro site.
# Installs the package, adds the integration to astro.config.mjs,
# and creates the registerComponents script.
#
# Usage: bash setup-editable-regions.sh [project-dir]
#   project-dir defaults to the current directory.

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

PACKAGE="@cloudcannon/editable-regions"
CONFIG="astro.config.mjs"
REGISTER_DIR="src/cloudcannon"
REGISTER_FILE="$REGISTER_DIR/registerComponents.ts"

# --- Install the package ---
echo "Installing $PACKAGE..."
if npm install "$PACKAGE" 2>/dev/null; then
  echo "Installed $PACKAGE"
else
  echo "Peer dependency conflict detected, retrying with --legacy-peer-deps..."
  npm install "$PACKAGE" --legacy-peer-deps
  echo "Installed $PACKAGE (with --legacy-peer-deps)"
fi
echo ""

# --- Add integration to astro.config.mjs ---
if [ ! -f "$CONFIG" ]; then
  echo "WARNING: $CONFIG not found. Add the integration manually."
else
  if grep -q "editable-regions/astro-integration" "$CONFIG"; then
    echo "Integration already present in $CONFIG"
  else
    # Add the import after the last existing import line
    last_import_line=$(grep -n "^import " "$CONFIG" | tail -1 | cut -d: -f1)
    if [ -n "$last_import_line" ]; then
      sed -i '' "${last_import_line}a\\
import editableRegions from \"$PACKAGE/astro-integration\";
" "$CONFIG"
      echo "Added import to $CONFIG (after line $last_import_line)"
    else
      echo "WARNING: No import lines found in $CONFIG. Add manually:"
      echo "  import editableRegions from \"$PACKAGE/astro-integration\";"
    fi

    # Add editableRegions() to the integrations array
    if grep -q "integrations:" "$CONFIG"; then
      # Insert after the integrations: [ line
      sed -i '' '/integrations:[[:space:]]*\[/a\
    editableRegions(),
' "$CONFIG"
      echo "Added editableRegions() to integrations array"
    else
      echo "WARNING: No integrations array found in $CONFIG. Add manually:"
      echo "  integrations: [editableRegions()]"
    fi
  fi
fi
echo ""

# --- Create registerComponents.ts ---
mkdir -p "$REGISTER_DIR"
if [ -f "$REGISTER_FILE" ]; then
  echo "$REGISTER_FILE already exists, skipping"
else
  cat > "$REGISTER_FILE" << 'TSEOF'
// Register Astro components for live re-rendering in the Visual Editor.
// Import each component and call registerAstroComponent() to enable
// EditableComponent regions to re-render when data changes.
//
// import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
// import CallToAction from "@/layouts/partials/CallToAction.astro";
// registerAstroComponent("call-to-action", CallToAction);
TSEOF
  echo "Created $REGISTER_FILE"
fi
echo ""

# --- Reminder ---
echo "=== Next steps ==="
echo "1. Import the registerComponents script from your base layout:"
echo ""
echo '   <script>'
echo '     import "@/cloudcannon/registerComponents";'
echo '   </script>'
echo ""
echo "2. Uncomment and add component registrations in $REGISTER_FILE"
echo "   as you wire up EditableComponent regions."
