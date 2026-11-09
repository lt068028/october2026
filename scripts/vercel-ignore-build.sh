#!/usr/bin/env bash
# Vercel Ignored Build Step script
# Evaluates whether the current commit should trigger a build.
# Exit code 0: Skip build (no relevant changes)
# Exit code 1: Proceed with build (changes found, missing commits, or error)

PREV="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"
CURR="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

# Verify that both commit objects exist in git history (resilient to shallow clones)
if git cat-file -e "$PREV^{commit}" 2>/dev/null && git cat-file -e "$CURR^{commit}" 2>/dev/null; then
    # Both commits exist. Run git diff excluding docs, tests, scripts, and markdown.
    if git diff --quiet "$PREV" "$CURR" -- . ":(exclude)docs" ":(exclude)tests" ":(exclude)scripts" ":(exclude)*.md"; then
        # Exit code 0 from git diff: No changes detected outside excluded paths -> Skip build
        exit 0
    else
        # Non-zero from git diff: Changes detected or diff error -> Proceed with build
        exit 1
    fi
else
    # One or both commits do not exist in the clone -> Safely proceed with build
    exit 1
fi
