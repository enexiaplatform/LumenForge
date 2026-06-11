import glob, re
import os

files = glob.glob('*.html') + glob.glob('articles/*.html')
missing = []
for f in files:
    c = open(f, encoding='utf-8').read()
    if not re.search(r'<meta name="description"', c):
        missing.append(f)
print('Total HTML files:', len(files))
print('Missing description:', len(missing))
if missing:
    print(missing[:10])
