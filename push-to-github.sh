#!/bin/bash
# Push to GitHub

cd /Users/mnd/.openclaw/workspace/second-brain

# Set your GitHub username
GITHUB_USER="bmobymnd"

# If you have a GitHub token, uncomment and set it:
# export GITHUB_TOKEN="your_token_here"

git remote set-url origin https://${GITHUB_USER}@github.com/${GITHUB_USER}/second-brain.git

# If using token authentication:
# git remote set-url origin https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/second-brain.git

git push -u origin main
