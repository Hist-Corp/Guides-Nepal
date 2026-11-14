#!/usr/bin/env python3
"""Fix goBack/useGoBack function signatures in backNavigation.ts"""

filepath = "/Volumes/programming/Guides-Nepal/frontend/src/utils/backNavigation.ts"

with open(filepath, 'r') as f:
    content = f.read()

# 1. Update goBack function signature to accept fallback parameter
old_goback = """export const goBack = (navigate: NavigateFunction) => {"""
new_goback = """export const goBack = (navigate: NavigateFunction, fallback = '/') => {"""
content = content.replace(old_goback, new_goback)

# 2. Update the target resolution line to use fallback
old_target = """const target = previous && previous !== current ? previous : (resolveBackTarget(current) ?? '/');"""
new_target = """const target = previous && previous !== current ? previous : (resolveBackTarget(current) ?? fallback);"""
content = content.replace(old_target, new_target)

# 3. Update useGoBack function signature
old_usegoBack = """export const useGoBack = (): (() => void) => {"""
new_usegoBack = """export const useGoBack = (fallback = '/'): (() => void) => {"""
content = content.replace(old_usegoBack, new_usegoBack)

# 4. Update useGoBack body to pass fallback to goBack
old_callback = """return useCallback(() => goBack(navigate), [navigate]);"""
new_callback = """return useCallback(() => goBack(navigate, fallback), [navigate, fallback]);"""
content = content.replace(old_callback, new_callback)

with open(filepath, 'w') as f:
    f.write(content)

print("Done")
