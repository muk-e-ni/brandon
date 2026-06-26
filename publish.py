"""
publish.py

usage:
    python publish.py path/posts/post.md
    
what it does:
1. generates markdown file ( with optional frontmatter)
2. Generates a styled HTML
3. Copies any images referenced in the post to /images/blog/
4. Adds the post to posts.json
5. Commists everything and pushes to Github
"""

import os 
import sys
import re
import json
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
import markdown

REPO_ROOT = Path(".")

BLOGS_DIR = REPO_ROOT / "blogs" 
IMAGES_DIR = REPO_ROOT / "images" / "blog"
POSTS_JSON = REPO_ROOT / "posts.json"


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """
    Splits YAML-style frontmatter from markdown body.
    Returns (meta_dict, body_text).
    Handles missing frontmatter"""

    meta = {}

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            for line in parts[1].strip().splitlines():
                if ":" in line:
                    key, _, val = line.partition(":")
                    meta[key.strip()] = val.strip()

            return meta, parts[2].strip()
        
    return meta, text.strip()
    
 
def extract_title_from_body(body: str) -> str:
    """Pull the first H1 from markdown as a fallback title."""
    for line in body.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return "Untitled Post"


def slugify(title: str) -> str:
    """Turn a title into a URL-safe filename slug."""
    slug = title.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug[:60]  # keep filenames short
 
def md_to_html_body(md_text: str) -> str:
    """Convert markdown to HTML, with syntax highlighting extension if available."""
    extensions = ["extra", "nl2br"]
    try:
        importlib.import_module("pygments")
        extensions.append("codehilite")
    except Exception:
        pass
    return markdown.markdown(md_text, extensions=extensions)


def build_post_html(meta: dict, html_body: str, slug: str) -> str:
    """
    Wrap the post body in the site's full HTML shell
    (matching the nav, footer, fonts, and CSS from the repo).
    """
    title    = meta.get("title", "Post")
    date_raw = meta.get("date", datetime.now().strftime("%Y-%m-%d"))
    excerpt  = meta.get("excerpt", "")
    post_type = meta.get("type", "blog").upper()
 
    # Format date nicely: accepts YYYY-MM-DD or DD/MM/YYYY
    try:
        if "-" in str(date_raw):
            dt = datetime.strptime(str(date_raw), "%Y-%m-%d")
        else:
            dt = datetime.strptime(str(date_raw), "%d/%m/%Y")
        date_display = dt.strftime("%B %d, %Y")
        date_iso     = dt.strftime("%Y-%m-%d")
    except ValueError:
        date_display = str(date_raw)
        date_iso     = str(date_raw)
 
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — Brandon Mukeni</title>
  <meta name="description" content="{excerpt}">
 
  <link rel="icon" href="/favicon-package/favicon.svg" type="image/svg+xml" sizes="any">
  <link rel="icon" href="/favicon-package/favicon.ico">
  <link rel="apple-touch-icon" href="/favicon-package/apple-touch-icon.png">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
 
  <link rel="stylesheet" href="/assets/css/csscopy.css">
  <link rel="stylesheet" href="/assets/css/post.css">
  <link rel="stylesheet" href="/assets/css/mobile_fixes.css">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
 
<body id="top">
 
  <!-- NAV (matches index.html exactly) -->
  <div class="extended-nav">
    <div class="logo-nav">
      <a href="/templates/bcreative_page.html" class="logo">
        <img src="/images/logo/logo_white.png" width="100" height="20" alt="Brandon Logo" class="logo-light">
        <img src="/images/logo/logo_teal.png"  width="100" height="20" alt="Brandon Logo" class="logo-dark">
      </a>
    </div>
    <button class="header-action-btn theme-toggle" aria-label="Toggle theme" data-theme-toggler>
      <ion-icon name="moon-outline" class="moon-icon"></ion-icon>
      <ion-icon name="sunny-outline" class="sun-icon"></ion-icon>
    </button>
  </div>
 
  <header class="header" data-header>
    <div class="container">
      <nav class="navbar" data-navbar>
        <div class="navbar-top">
          <a href="/templates/bcreative_page.html" class="logo">
            <img src="/images/logo/logo_white.png" width="100" height="25" alt="Brandon Logo">
          </a>
          <button class="nav-close-btn" aria-label="close menu" data-nav-toggler>
            <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
          </button>
        </div>
        <ul class="navbar-list">
          <li class="navbar-item"><a href="/index.html"              class="navbar-link" data-nav-link>Home</a></li>
          <li class="navbar-item"><a href="/templates/aboutme.html"  class="navbar-link" data-nav-link>About Me</a></li>
          <li class="navbar-item"><a href="/templates/projects.html" class="navbar-link" data-nav-link>Projects</a></li>
          <li class="navbar-item"><a href="/templates/writeups.html" class="navbar-link" data-nav-link>Write-ups</a></li>
          <li class="navbar-item"><a href="/templates/contacts.html" class="navbar-link" data-nav-link>Contact</a></li>
        </ul>
      </nav>
      <div class="header-action">
        <button class="header-action-btn nav-open-btn" aria-label="menu" data-nav-toggler>
          <ion-icon name="menu-outline" aria-hidden="true"></ion-icon>
        </button>
      </div>
      <div class="overlay" data-nav-toggler data-overlay></div>
    </div>
  </header>
 
  <main>
    <article class="post-article">
      <div class="container">
 
        <!-- Post header -->
        <header class="post-header">
          <div class="post-meta">
            <span class="post-type-badge">{post_type}</span>
            <time datetime="{date_iso}" class="post-date">{date_display}</time>
          </div>
          <h1 class="post-title">{title}</h1>
          {f'<p class="post-excerpt">{excerpt}</p>' if excerpt else ''}
          <div class="post-divider"></div>
        </header>
 
        <!-- Post body (converted from the markdown) -->
        <div class="post-content">
          {html_body}
        </div>
 
        <!-- Back link -->
        <div class="post-footer">
          <a href="/templates/writeups.html" class="btn btn-secondary">
            ← Back to all writeups
          </a>
        </div>
 
      </div>
    </article>
  </main>
 
  <!-- FOOTER (matches index.html) -->
  <footer class="footer">
    <div class="container">
      <div class="footer-top section grid-list">
        <div class="footer-brand">
          <a href="/templates/bcreative_page.html" class="logo">
            <img src="/images/logo/logo_teal.png" width="100" height="48" alt="Brandon Logo">
          </a>
          <p class="footer-text">Cybersecurity student passionate about technology, security, and innovation.</p>
        </div>
        <ul class="footer-list">
          <p class="footer-list-title">Connect</p>
          <li><a href="https://github.com/muk-e-ni/"          class="footer-link"><ion-icon name="logo-github"></ion-icon> Github</a></li>
          <li><a href="https://www.linkedin.com/in/brandon-mukeni-46276236b/" class="footer-link"><ion-icon name="logo-linkedin"></ion-icon> LinkedIn</a></li>
          <li><a href="https://discord.com/users/1130262077957746739"         class="footer-link"><ion-icon name="logo-discord"></ion-icon> Discord</a></li>
        </ul>
        <ul class="footer-list">
          <li><p class="footer-list-title">Explore</p></li>
          <li><a href="/templates/projects.html" class="footer-link">Projects</a></li>
          <li><a href="/templates/writeups.html" class="footer-link">Writeups</a></li>
          <li><a href="/templates/about.html"    class="footer-link">About</a></li>
        </ul>
        <ul class="footer-list">
          <li><p class="footer-list-title">Contact</p></li>
          <li class="footer-list-item">
            <ion-icon name="mail" aria-hidden="true"></ion-icon>
            <a href="mailto:contact@brandonmukeni.com" class="footer-link">Email Me</a>
          </li>
          <li class="footer-list-item">
            <ion-icon name="location" aria-hidden="true"></ion-icon>
            <address class="address">Nairobi, Kenya</address>
          </li>
        </ul>
      </div>
      <div class="footer-bottom">
        <p>&copy; {datetime.now().year} Brandon Mukeni. All rights reserved.</p>
        <p class="footer-credit">Made with love and bugs</p>
      </div>
    </div>
  </footer>
 
  <a href="#top" class="back-top-btn" aria-label="back to top" data-back-top-btn>
    <ion-icon name="arrow-up-outline" aria-hidden="true"></ion-icon>
  </a>
 
  <script src="/assets/js/jscopy.js" defer></script>
  <script src="/assets/js/theme.js"  defer></script>
  <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule    src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
</body>
</html>"""
 
 
def update_posts_json(meta: dict, slug: str, posts_json_path: Path):
    """Prepend the new post to posts.json so it appears first in the listing."""
    posts = []
    if posts_json_path.exists():
        try:
            posts = json.loads(posts_json_path.read_text())
        except json.JSONDecodeError:
            posts = []
 
    date_raw = meta.get("date", datetime.now().strftime("%d/%m/%Y"))
    # Normalise to DD/MM/YYYY for consistency with  existing entries
    try:
        if "-" in str(date_raw):
            dt = datetime.strptime(str(date_raw), "%Y-%m-%d")
            date_display = dt.strftime("%d/%m/%Y")
        else:
            date_display = str(date_raw)
    except ValueError:
        date_display = str(date_raw)
 
    new_entry = {
        "title":   meta.get("title", "Untitled Post"),
        "image":   meta.get("image", "/images/blog/default.png"),
        "excerpt": meta.get("excerpt", ""),
        "date":    date_display,
        "url":     f"blogs/{slug}.html",
        "preview": meta.get("preview", meta.get("type", "POST").upper()),
    }
 
    # Don't add duplicates (re-running publish on same file is safe)
    existing_urls = {p.get("url") for p in posts}
    if new_entry["url"] not in existing_urls:
        posts.insert(0, new_entry)
        posts_json_path.write_text(json.dumps(posts, indent=2))
        print(f"  ✓ Added to posts.json")
    else:
        # Update in place if it already exists (e.g. you re-ran after edits)
        for i, p in enumerate(posts):
            if p.get("url") == new_entry["url"]:
                posts[i] = new_entry
                break
        posts_json_path.write_text(json.dumps(posts, indent=2))
        print(f"  ✓ Updated existing entry in posts.json")
 
 
def git_push(repo_root: Path, files: list[Path], commit_msg: str):
    """Stage the given files, commit, and push."""
    try:
        for f in files:
            subprocess.run(["git", "add", str(f)], cwd=repo_root, check=True)
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=repo_root, check=True)
        subprocess.run(["git", "push"],                     cwd=repo_root, check=True)
        print(f"  ✓ Pushed to GitHub — Netlify will deploy in ~30 seconds")
    except subprocess.CalledProcessError as e:
        print(f"  ✗ Git error: {e}")
        print("    Make sure you've cloned the repo and git is configured.")
 
 
def publish(md_path_str: str):
    md_path = Path(md_path_str).resolve()
    if not md_path.exists():
        print(f"File not found: {md_path}")
        sys.exit(1)
 
    print(f"\n📝 Publishing: {md_path.name}")
    print("─" * 50)
 
    # 1. Parse
    raw       = md_path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)
    if "title" not in meta:
        meta["title"] = extract_title_from_body(body)
    if "date" not in meta:
        meta["date"] = datetime.now().strftime("%Y-%m-%d")
 
    slug = slugify(meta["title"])
    print(f"  Title : {meta['title']}")
    print(f"  Slug  : {slug}")
    print(f"  Date  : {meta['date']}")
 
    # 2. Convert markdown → HTML
    html_body = md_to_html_body(body)
    full_html = build_post_html(meta, html_body, slug)
 
    # 3. Write HTML post to blogs/
    BLOGS_DIR.mkdir(exist_ok=True)
    post_path = BLOGS_DIR / f"{slug}.html"
    post_path.write_text(full_html, encoding="utf-8")
    print(f"  ✓ Generated {post_path.relative_to(REPO_ROOT)}")
 
    # 4. Copy images referenced in the markdown into images/blog/
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    image_refs = re.findall(r"!\[.*?\]\((.+?)\)", body)
    copied_images = []
    for img_ref in image_refs:
        img_src = Path(img_ref)
        if not img_src.is_absolute():
            img_src = md_path.parent / img_src
        if img_src.exists():
            dest = IMAGES_DIR / img_src.name
            shutil.copy2(img_src, dest)
            copied_images.append(dest)
            print(f"  ✓ Copied image → images/blog/{img_src.name}")
 
    # 5. Update posts.json
    update_posts_json(meta, slug, POSTS_JSON)
 
    # 6. Git commit + push
    files_to_commit = [post_path, POSTS_JSON] + copied_images
    commit_msg = f"post: {meta['title']} ({meta['date']})"
    print(f"\n  Pushing to GitHub...")
    git_push(REPO_ROOT, files_to_commit, commit_msg)
 
    print(f"\n✅ Done! Your post will be live at:")
    print(f"   https://brandon-web.netlify.app/blogs/{slug}.html")


 
def publish_with_notify(md_path_str: str):
    """
    Full publish + subscriber notification.
    """
    from dotenv import load_dotenv
    load_dotenv()


 
    publish(md_path_str)
 
    # notify subscribers
    from notify_subscribers import notify_subscribers
 
    md_path = Path(md_path_str).resolve()
    raw     = md_path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)
    if "title" not in meta:
        meta["title"] = extract_title_from_body(body)
 
    slug     = slugify(meta["title"])
    post_url = f"https://brandon-web.netlify.app/blogs/{slug}.html"
 
    print("\n  Notifying subscribers...")
    notify_subscribers(
        title     = meta.get("title", "New post"),
        excerpt   = meta.get("excerpt", ""),
        post_url  = post_url,
        post_type = meta.get("type", "post"),
    )
 
 
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
 
    if len(sys.argv) < 2:
        print("Usage: python publish.py path/to/your-post.md")
        sys.exit(1)
 
    # Use publish_with_notify if RESEND_API_KEY is set, otherwise plain publish
    if os.getenv("RESEND_API_KEY"):
        publish_with_notify(sys.argv[1])
    else:
        publish(sys.argv[1])