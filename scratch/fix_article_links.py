import os

base_dir = r"E:\Antigravity project\LumenForge"

replacements = {
    'lens-character.html': 'focal-length-distortion.html',
    'light-physics-101.html': 'hard-vs-soft-light.html',
    '../tools/fov-calculator.html': '../tools/fov-simulator.html',
    'lens-focal-length-psychology.html': 'focal-length-explained.html',
    'lighting-ratios-mood.html': 'psychology-of-low-key.html',
    'focal-length-guide.html': 'focal-length-explained.html',
    '../tools/inverse-square-calculator.html': '../tools/exposure-reactor.html',
    'color-science-basics.html': 'color-harmony-theory.html',
    'understanding-micro-contrast.html': 'tone-curve-mastery.html',
    '../tools/3-point-lighting-simulator.html': '../tools/lighting-simulator.html',
    'color-science-bayer.html': 'ccd-vs-cmos.html',
    'dynamic-range-truth.html': 'histogram-ettr.html',
    '10-bit-vs-8-bit-color-depth.html': 'color-space-bitdepth.html',
    'color-space-gamut-science.html': 'color-spaces.html',
    'color-psychology-cinema.html': 'color-harmony-theory.html',
    '../tool-lab/lens-decoder.html': '../tools/lens-decoder.html',
    '../tool-lab/exposure-calculator.html': '../tools/exposure-reactor.html',
    'focal-length-compression.html': 'focal-length-distortion.html',
    'iso-invariance-myth.html': 'iso-noise-science.html',
    'color-science-log.html': 'log-profile-science.html',
    'lens-characteristics.html': 'optical-aberrations.html',
    'color-science.html': 'color-spaces.html',
    '../css/article.css': '../css/home.css',
    '../tool-lab/tone-curve-simulator.html': '../tools/tone-curve.html',
    'color-theory-in-practice.html': 'color-harmony-theory.html',
    'dynamic-range-limits.html': 'histogram-ettr.html'
}

def main():
    print("==================================================")
    print("STARTING HTML LINK REPAIR PROCESS")
    print("==================================================")
    
    articles_dir = os.path.join(base_dir, "articles")
    html_files = [os.path.join(articles_dir, f) for f in os.listdir(articles_dir) if f.endswith(".html")]
    
    repaired_count = 0
    
    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        modified = False
        for old, new in replacements.items():
            # Check for exact matches inside quotes
            # e.g., href="old" or href='old' or src="old" etc.
            # Simple replacement is fine if the strings are unique enough
            if f'"{old}"' in content:
                content = content.replace(f'"{old}"', f'"{new}"')
                print(f"  [+] Repaired in {os.path.basename(filepath)}: '{old}' -> '{new}'")
                modified = True
            if f"'{old}'" in content:
                content = content.replace(f"'{old}'", f"'{new}'")
                print(f"  [+] Repaired in {os.path.basename(filepath)}: '{old}' -> '{new}'")
                modified = True
                
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            repaired_count += 1
            
    print("==================================================")
    print(f"COMPLETED! Repaired links in {repaired_count} files.")
    print("==================================================")

if __name__ == '__main__':
    main()
