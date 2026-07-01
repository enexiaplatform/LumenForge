import os
import glob
import re

html_files = glob.glob('e:/Antigravity project/LumenForge/*.html') + glob.glob('e:/Antigravity project/LumenForge/tools/*.html')

manifest_tag = '  <link rel="manifest" href="manifest.json">\n'

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if manifest is already linked
    if 'rel="manifest"' not in content:
        # Find the </head> tag and insert right before it
        # Try to find <head> if it's there
        if '</head>' in content:
            # If the file is in tools folder, the path is ../manifest.json
            if 'tools\\' in file_path or 'tools/' in file_path:
                tag = '  <link rel="manifest" href="../manifest.json">\n'
            else:
                tag = manifest_tag
            
            content = content.replace('</head>', f'{tag}</head>')
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Injected manifest into {file_path}")
        else:
            print(f"Skipped {file_path}, no </head> found")
    else:
        print(f"Skipped {file_path}, already has manifest")
