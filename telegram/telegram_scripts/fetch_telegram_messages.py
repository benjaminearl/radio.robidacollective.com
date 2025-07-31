import os
import requests
import json
from datetime import datetime

BOT_TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID   = os.environ.get("CHAT_ID")

if not BOT_TOKEN or not CHAT_ID:
    print("❌ Error: BOT_TOKEN and/or CHAT_ID environment variable not set.")
    exit(1)

print(f"✅ Using BOT_TOKEN: {'*' * len(BOT_TOKEN[:-5]) + BOT_TOKEN[-5:]}")
print(f"✅ Using CHAT_ID: {CHAT_ID}")

url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"

try:
    response = requests.get(url)
    response.raise_for_status()
except Exception as e:
    print(f"❌ Error fetching updates: {e}")
    exit(1)

data = response.json()

if not data.get("ok"):
    print(f"❌ Telegram API error: {data}")
    exit(1)

updates = data.get("result", [])
print(f"📬 Received {len(updates)} updates")

announcements = []

for i, upd in enumerate(updates):
    msg = upd.get("message")
    if not msg:
        print(f"⚠️ Skipping update #{i}: No message found")
        continue

    msg_chat_id = str(msg.get("chat", {}).get("id"))
    print(f"\n🔍 Processing message #{i}:")
    print(f"    From chat ID: {msg_chat_id} (expected: {CHAT_ID})")

    if msg_chat_id != CHAT_ID:
        print("    ⛔ Skipped: Chat ID does not match")
        continue

    if "text" not in msg:
        print("    ⚠️ Skipped: No text in message")
        continue

    username = msg.get("from", {}).get("username", "unknown")
    announcement_data = {
        "user": username,
        "announcement": msg["text"],
        "date": datetime.fromtimestamp(msg["date"]).isoformat()
    }
    print(f"    ✅ Saved announcement: {announcement_data}")
    announcements.append(announcement_data)

if not announcements:
    print("📭 No matching announcements found.")
else:
    os.makedirs("telegram/telegram_data", exist_ok=True)
    with open("telegram/telegram_data/announcements.json", "w", encoding="utf-8") as f:
        json.dump(announcements, f, indent=2)
    print(f"\n💾 Saved {len(announcements)} announcements to announcements.json")
