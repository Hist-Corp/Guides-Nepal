import re
d = open('src/pages/pokhara/annapurnaContent.ts').read()
m = re.search(r"export const abcGalleryHtml =\n  '(.*?)';\n", d, re.S)
g = m.group(1)
for pat in ['tg-mixmore"><span class="tg-mixmore__n">+90', 'tg-mixmore"><span class="tg-mixmore__n">+87']:
    j = g.find(pat)
    s = g.rfind('<button', 0, j)
    e = g.find('</button>', j) + len('</button>')
    print(repr(g[s:e]))
    print('======')
print('is-capped count:', g.count('is-capped'))
