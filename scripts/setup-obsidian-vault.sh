#!/usr/bin/env bash
#
# Connect the Obsidian vault to the website's content directories.
#
# What this does:
#   1. Sets group ownership of src/content/{landing,faq,team,posts,pages,site}
#      to the `obsidian` group, with `g+w` and setgid so the obsidian user can
#      edit existing files and any new files inherit the right group.
#   2. Creates a `Website/` folder inside the Obsidian vault and adds
#      symlinks pointing back to each content folder.
#
# Result: edit a markdown file in Obsidian → it writes to the real file in
# the website tree → the Astro dev server hot-reloads → site updates.
#
# Run as root (or with sudo). Idempotent — safe to run again.
#
# Usage:
#   sudo bash scripts/setup-obsidian-vault.sh
#
set -euo pipefail

WEBSITE_DIR="/srv/reliacode/website"
CONTENT_DIR="${WEBSITE_DIR}/src/content"
VAULT_DIR="/home/obsidian/ReliaCode_Vault"
VAULT_WEBSITE_DIR="${VAULT_DIR}/Website"
OBSIDIAN_USER="obsidian"
OBSIDIAN_GROUP="obsidian"

# Subfolders that should appear as separate folders in the vault. Each
# is symlinked individually so you can navigate straight to (e.g.) the
# FAQ folder without drilling through nested paths.
SUBDIRS=(landing faq team posts pages site)

if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root (use sudo)." >&2
  exit 1
fi

if ! id -u "${OBSIDIAN_USER}" >/dev/null 2>&1; then
  echo "User '${OBSIDIAN_USER}' does not exist on this system." >&2
  exit 1
fi

if [[ ! -d "${CONTENT_DIR}" ]]; then
  echo "Content directory not found: ${CONTENT_DIR}" >&2
  exit 1
fi

echo "==> Setting group ownership + perms on website content dirs"
for sub in "${SUBDIRS[@]}"; do
  target="${CONTENT_DIR}/${sub}"
  if [[ ! -d "${target}" ]]; then
    echo "  skip: ${target} (missing)" >&2
    continue
  fi
  chgrp -R "${OBSIDIAN_GROUP}" "${target}"
  chmod -R g+w "${target}"
  find "${target}" -type d -exec chmod g+s {} \;
  echo "  ok:   ${target}"
done

# Group ownership on the README.md too so it shows up the same way.
if [[ -f "${CONTENT_DIR}/README.md" ]]; then
  chgrp "${OBSIDIAN_GROUP}" "${CONTENT_DIR}/README.md"
  chmod g+w "${CONTENT_DIR}/README.md"
fi

echo
echo "==> Ensuring vault directory exists: ${VAULT_WEBSITE_DIR}"
sudo -u "${OBSIDIAN_USER}" mkdir -p "${VAULT_WEBSITE_DIR}"

echo
echo "==> Creating symlinks in the vault (as user '${OBSIDIAN_USER}')"
for sub in "${SUBDIRS[@]}"; do
  link="${VAULT_WEBSITE_DIR}/${sub}"
  target="${CONTENT_DIR}/${sub}"

  # `ln -sfn` replaces an existing symlink atomically; -n prevents
  # following into a directory and creating a nested link.
  sudo -u "${OBSIDIAN_USER}" ln -sfn "${target}" "${link}"
  echo "  ${link}  →  ${target}"
done

# README too, as a regular file copy (Obsidian doesn't always render
# README.md from a parent dir).
if [[ -f "${CONTENT_DIR}/README.md" ]]; then
  sudo -u "${OBSIDIAN_USER}" ln -sfn "${CONTENT_DIR}/README.md" "${VAULT_WEBSITE_DIR}/README.md"
  echo "  ${VAULT_WEBSITE_DIR}/README.md  →  ${CONTENT_DIR}/README.md"
fi

echo
echo "==> Done."
echo
echo "Open the vault in Obsidian; you should see a 'Website' folder with"
echo "  landing/, faq/, team/, posts/, pages/, site/ subfolders. Edit any"
echo "  markdown file and the website's dev server will hot-reload."
echo
echo "Tip: if Obsidian writes files with mode 644 (no group write), aleksi"
echo "  won't be able to edit them via terminal. Either set 'umask 002' in"
echo "  the obsidian user's shell profile, or run 'chmod -R g+w ${CONTENT_DIR}'"
echo "  before each git commit."
