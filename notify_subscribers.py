
import os
import time
import requests
from datetime import datetime
 
 
RESEND_API = "https://api.resend.com"
 
 
def _headers():
    return {
        "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
        "Content-Type": "application/json",
    }
 
 
def _build_email_html(title: str, excerpt: str, post_url: str, post_type: str) -> str:
    """Build the notification email HTML."""
    date_str = datetime.now().strftime("%B %d, %Y")
    type_color = {
        "writeup": "#0d9488",
        "blog":    "#4f46e5",
        "ctf":     "#d97706",
    }.get(post_type.lower(), "#0d9488")
 
    return f"""
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                max-width:540px;margin:0 auto;padding:32px 20px;color:#1f2937;">
 
      <!-- Header -->
      <div style="margin-bottom:28px;">
        <a href="https://bcreative.com" style="text-decoration:none;">
          <span style="font-size:15px;font-weight:700;color:#0d9488;">brandonmukeni.com</span>
        </a>
        <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">{date_str}</p>
      </div>
 
      <!-- Badge -->
      <span style="display:inline-block;background:{type_color};color:#fff;
                   font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
                   padding:3px 10px;border-radius:4px;margin-bottom:16px;">
        New {post_type}
      </span>
 
      <!-- Title -->
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;line-height:1.3;color:#111827;">
        {title}
      </h1>
 
      <!-- Excerpt -->
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;">
        {excerpt if excerpt else "I just published something new. Click below to check it out."}
      </p>
 
      <!-- CTA -->
      <a href="{post_url}"
         style="display:inline-block;background:{type_color};color:#fff;
                padding:13px 28px;border-radius:6px;text-decoration:none;
                font-weight:600;font-size:14px;">
        Read it →
      </a>
 
      <!-- Footer -->
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          You're getting this because you subscribed at brandonmukeni.com.<br>
          <a href="{{{{RESEND_UNSUBSCRIBE_URL}}}}" style="color:#9ca3af;">Unsubscribe</a>
        </p>
      </div>
    </div>
    """
 
 
def notify_subscribers(title: str, excerpt: str, post_url: str, post_type: str = "post") -> bool:
    """
    Creates a Resend broadcast and sends it to all contacts immediately.
    Returns True on success.
 
    Called from publish.py after a successful git push.
    """
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        print("  ✗ Notify skipped: RESEND_API_KEY not set in .env")
        return False
 
    subject_prefix = {
        "writeup": "New writeup",
        "blog":    "New post",
        "ctf":     "New CTF writeup",
    }.get(post_type.lower(), "New post")
 
    html = _build_email_html(title, excerpt, post_url, post_type)
 
    # ── Step 1: Create the broadcast ─────────────────────────────────────────
    try:
        res = requests.post(
            f"{RESEND_API}/broadcasts",
            headers=_headers(),
            json={
                "from":    "Brandon Mukeni <updates@bcreative.com>",
                "subject": f"{subject_prefix}: {title}",
                "html":    html,
            },
            timeout=15,
        )
        res.raise_for_status()
        broadcast_id = res.json().get("id")
        if not broadcast_id:
            print(f"  ✗ Broadcast creation failed: {res.json()}")
            return False
        print(f"  ✓ Broadcast created (id: {broadcast_id})")
    except requests.RequestException as e:
        print(f"  ✗ Broadcast creation error: {e}")
        return False
 
    # ── Step 2: Send it immediately ───────────────────────────────────────────
    # Small delay to let Resend register the broadcast
    time.sleep(1)
 
    try:
        res = requests.post(
            f"{RESEND_API}/broadcasts/{broadcast_id}/send",
            headers=_headers(),
            json={},
            timeout=15,
        )
        res.raise_for_status()
        print(f"  ✓ Notification sent to all subscribers")
        print(f"    Track opens/clicks at: https://resend.com/broadcasts")
        return True
    except requests.RequestException as e:
        print(f"  ✗ Broadcast send error: {e}")
        print(f"    You can send it manually at: https://resend.com/broadcasts/{broadcast_id}")
        return False