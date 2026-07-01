import os
import re

def minify_css(css):
    # Remove comments
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    # Remove whitespace
    css = re.sub(r'\s+', ' ', css)
    # Remove spaces around punctuation
    css = re.sub(r'\s*([\{\}\:\;\,\>])\s*', r'\1', css)
    return css.strip()

def minify_js(js):
    # Basic minifier just removes single line and block comments, then leading/trailing whitespace
    # A true JS minifier is complex, but this is safe for simple files
    js = re.sub(r'//.*', '', js)
    js = re.sub(r'/\*.*?\*/', '', js, flags=re.DOTALL)
    js = "\n".join([line.strip() for line in js.split('\n') if line.strip()])
    return js

def build():
    print("Minifying assets for Production...")
    
    # CSS
    css_files = ['css/design-system.css', 'css/home.css']
    for f in css_files:
        if os.path.exists(f):
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
            min_content = minify_css(content)
            min_path = f.replace('.css', '.min.css')
            with open(min_path, 'w', encoding='utf-8') as out:
                out.write(min_content)
            print(f"Minified {f} -> {min_path}")

    # JS
    js_files = ['js/common.js', 'js/checkout.js']
    for f in js_files:
        if os.path.exists(f):
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
            min_content = minify_js(content)
            min_path = f.replace('.js', '.min.js')
            with open(min_path, 'w', encoding='utf-8') as out:
                out.write(min_content)
            print(f"Minified {f} -> {min_path}")

    print("Production build complete!")

if __name__ == '__main__':
    build()
