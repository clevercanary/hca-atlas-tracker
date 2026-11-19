#!/bin/bash

if ! gitleaks version | awk -F. '
    /^[0-9]+\.[0-9]+\.[0-9]+$/ && ($1 > 8 || ($1 == 8 && $2 >= 20)) { supported = 1 }
    END { exit !supported }
'; then
    echo '🔑 Gitleaks 8.20.0 or newer is required (brew install gitleaks).'
    exit 1
fi

gitleaks git --pre-commit --redact --staged --verbose ||
(
    echo '🔑 gitleaks found a secret in the staged changes, or was unable to run.';
    false;
)
