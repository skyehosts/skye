#!/bin/bash
# Vercel Ignored Build Step
# https://vercel.com/docs/projects/overview#ignored-build-step
# Exit 1 = proceed with build, Exit 0 = skip build

echo "Checking for changes in apps/book-skye-guest-website..."
git diff --quiet HEAD^ HEAD ./apps/book-skye-guest-website ./packages/ui ./packages/config

if [ $? -eq 0 ]; then
  echo "No changes detected in book-skye-guest-website or shared packages. Skipping build."
  exit 0
else
  echo "Changes detected. Proceeding with build."
  exit 1
fi
