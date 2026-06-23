import os
import re

blog_path = r"E:\Antigravity project\LumenForge\blog.html"
articles_dir = r"E:\Antigravity project\LumenForge\articles"

def main():
    if not os.path.exists(blog_path):
        print("blog.html not found!")
        return
        
    with open(blog_path, "r", encoding="utf-8") as f:
        blog_content = f.read()

    # Find all href="articles/..." or href="recipe-..." in blog.html
    # Links look like: href="articles/focal-length-distortion.html"
    links_in_blog = set(re.findall(r'href=["\']articles/([^"\']+\.html)["\']', blog_content))
    
    # Find all HTML files in E:\Antigravity project\LumenForge\articles
    files_in_dir = set([f for f in os.listdir(articles_dir) if f.endswith(".html")])
    
    print(f"Total articles in directory: {len(files_in_dir)}")
    print(f"Total article links in blog.html: {len(links_in_blog)}")
    
    missing_in_blog = files_in_dir - links_in_blog
    extra_in_blog = links_in_blog - files_in_dir
    
    if missing_in_blog:
        print("\n[!] Found articles in directory that are MISSING in blog.html:")
        for m in sorted(missing_in_blog):
            print(f"  - {m}")
    else:
        print("\n[+] No missing articles in blog.html.")
        
    if extra_in_blog:
        print("\n[!] Found links in blog.html that do not exist in directory:")
        for e in sorted(extra_in_blog):
            print(f"  - {e}")
            
if __name__ == "__main__":
    main()
