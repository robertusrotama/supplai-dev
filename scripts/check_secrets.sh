#!/usr/bin/env bash
# Fails if anything that looks like a credential is tracked by git.
#
# Exists because an SSH private key shipped in the initial commit: it was
# generated with `ssh-keygen -f id_ed25519.pub`, and -f names the PRIVATE key,
# so the secret landed in a file whose .pub name made it look public.
# A name-based check alone would have missed it — this greps content too.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 2
fail=0

note() { printf '  %s\n' "$1"; fail=1; }

echo "== tracked files named like credentials =="
git ls-files -z \
  | grep -zEi '(^|/)(id_(rsa|dsa|ecdsa|ed25519).*|.*\.(pem|ppk|p12|pfx|jks|keystore)|.*\.env(\..*)?|.*credentials.*|.*service[-_]?account.*\.json)$' \
  | tr '\0' '\n' | while read -r f; do [ -n "$f" ] && echo "  SUSPECT NAME: $f"; done
if git ls-files -z | grep -qzEi '(^|/)(id_(rsa|dsa|ecdsa|ed25519).*|.*\.(pem|ppk|p12|pfx|jks|keystore)|.*\.env(\..*)?|.*credentials.*|.*service[-_]?account.*\.json)$'; then
  fail=1
else
  echo "  none"
fi

echo "== tracked file CONTENT matching secret patterns =="
# package-lock is huge and full of base64-ish integrity hashes; skip it.
hits=$(git grep -nIaE \
  'BEGIN [A-Z ]*PRIVATE KEY|sk-ant-[A-Za-z0-9_-]{8}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20}|xox[baprs]-[A-Za-z0-9-]{10}|mongodb\+srv://[^ "]{5}|postgres(ql)?://[^ "/]{5}|SG\.[A-Za-z0-9_-]{16}' \
  -- ':!package-lock.json' ':!scripts/check_secrets.sh' 2>/dev/null)
if [ -n "$hits" ]; then
  echo "$hits" | while IFS= read -r l; do echo "  SECRET: ${l%%:*}"; done | sort -u
  fail=1
else
  echo "  none"
fi

echo
if [ "$fail" -ne 0 ]; then
  echo "FAIL: credential-like material is tracked by git. Remove it AND rotate it."
  exit 1
fi
echo "PASS: no credential-like material tracked."
