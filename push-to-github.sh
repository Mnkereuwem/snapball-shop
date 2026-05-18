#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

GH=""
if command -v gh >/dev/null 2>&1; then
  GH=gh
elif [ -x /tmp/gh_2.92.0_macOS_amd64/bin/gh ]; then
  GH=/tmp/gh_2.92.0_macOS_amd64/bin/gh
else
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Log in to GitHub first:"
  "$GH" auth login -h github.com -p https -w
fi

REPO_NAME="${1:-snapball-shop}"
"$GH" repo create "$REPO_NAME" --public --source=. --remote=origin --push

echo ""
echo "Done! View your repo:"
"$GH" repo view --web
