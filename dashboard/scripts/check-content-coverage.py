#!/usr/bin/env python3
"""Checks that every slug in frontendPages.ts has an entry in frontendContent.ts."""
import re
import sys

pages = open('src/config/frontendPages.ts', encoding='utf-8').read()
content = open('src/config/frontendContent.ts', encoding='utf-8').read()
pslugs = re.findall(r'slug:\s*"([^"]+)"', pages)
cslugs = re.findall(r'(?m)^\s{2}(?:\'?)([a-z0-9-]+)(?:\'?)?:\s*\[', content)
print(f'PAGES: {len(pslugs)}')
print(f'MAP: {len(cslugs)}')
missing = [s for s in pslugs if s not in cslugs]
extra = [s for s in cslugs if s not in pslugs]
print('missing from map:', missing)
print('extra in map:', extra)
sys.exit(1 if missing else 0)
