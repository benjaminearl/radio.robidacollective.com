import os
import requests
import json
from datetime import datetime, timezone, timedelta

# CEST timezone (UTC+2)
CEST = timezone(timedelta(hours=2))

BOT_TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID = os.environ.get("CHAT_ID")

if not BOT_TOKEN or not CHAT_ID:
    print("❌ BOT_TOKEN or CHAT_ID is not set in environment variables.")
    exit(1)

print(f"✅ BOT_TOKEN: {'*' * len(BOT_TOKEN[:-5]) + BOT_TOKEN[-5:]}")
print(f"✅ CHAT_ID: {CHAT_ID}")

CAPTION_TO_ID = {
    "1": "one",
    "2": "two",
    "3": "three"
}

API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"
FILE_URL = f"https://api.telegram.org/file/bot{BOT_TOKEN}"

DATA_DIR = "telegram/telegram_data"
IMAGE_DIR = "telegram/telegram_images"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

# Load last processed update ID to avoid duplicate processing
last_update_id_path = os.path.join(DATA_DIR, "last_update_id.txt")
try:
    with open(last_update_id_path, "r") as f:
        last_update_id = int(f.read().strip())
except:
    last_update_id = 0

print(f"🔄 Fetching updates after update_id: {last_update_id}")

# Fetch updates
try:
    response = requests.get(f"{API_URL}/getUpdates", params={"offset": last_update_id + 1, "timeout": 10})
    response.raise_for_status()
    data = response.json()
except Exception as e:
    print(f"❌ Failed to fetch updates: {e}")
    exit(1)

if not data.get("ok"):
    print(f"❌ Telegram API error: {data}")
    exit(1)

updates = data.get("result", [])
print(f"📬 Received {len(updates)} updates")

announcements = []
channel_images = {}

max_update_id = last_update_id

for i, upd in enumerate(updates):
    update_id = upd["update_id"]
    if update_id > max_update_id:
        max_update_id = update_id

    msg = upd.get("message") or upd.get("channel_post")
    if not msg:
        print(f"⚠️ Update #{update_id} has no message or channel_post, skipping")
        continue

    chat_id = str(msg.get("chat", {}).get("id"))
    if chat_id != CHAT_ID:
        print(f"⛔ Update #{update_id} skipped: chat ID {chat_id} does not match expected {CHAT_ID}")
        continue

    # --- Handle Announcements (text messages) ---
    if "text" in msg:
        username = msg.get("from", {}).get("username", "channel")

        # Convert Telegram timestamp to UTC then CEST
        dt_utc = datetime.utcfromtimestamp(msg["date"]).replace(tzinfo=timezone.utc)
        dt_cest = dt_utc.astimezone(CEST)

        ann = {
            "user": username,
            "text": msg["text"],
            "date": dt_cest.strftime("%Y-%m-%d %H:%M")  # Store in CEST
        }
        announcements.append(ann)
        print(f"✅ Update #{update_id} announcement saved: {ann}")

    # --- Handle Images ---
    if "photo" in msg and "caption" in msg:
        caption = msg["caption"].strip()
        div_id = CAPTION_TO_ID.get(caption)
        if not div_id:
            print(f"⚠️ Update #{update_id} skipped: caption '{caption}' not mapped")
            continue

        file_id = msg["photo"][-1]["file_id"]
        print(f"📦 Update #{update_id} fetching file info for file_id: {file_id}")

        try:
            file_info_resp = requests.get(f"{API_URL}/getFile", params={"file_id": file_id})
            file_info_resp.raise_for_status()
            file_path = file_info_resp.json()["result"]["file_path"]
            print(f"📁 File path: {file_path}")
        except Exception as e:
            print(f"❌ Error retrieving file path for update #{update_id}: {e}")
            continue

        image_url = f"{FILE_URL}/{file_path}"
        image_name = file_path.split("/")[-1]
        local_path = os.path.join(IMAGE_DIR, image_name)

        print(f"⬇️ Downloading image from: {image_url}")
        try:
            image_data = requests.get(image_url).content
            with open(local_path, "wb") as img_file:
                img_file.write(image_data)
            print(f"✅ Image saved to: {local_path}")
            channel_images[div_id] = f"{IMAGE_DIR}/{image_name}"
        except Exception as e:
            print(f"❌ Error saving image for update #{update_id}: {e}")

# Save announcements JSON
if announcements:
    with open(os.path.join(DATA_DIR, "announcements.json"), "w", encoding="utf-8") as f:
        json.dump(announcements, f, indent=2)
    print(f"\n💾 Saved {len(announcements)} announcements to {DATA_DIR}/announcements.json")
else:
    print("\n📭 No new announcements to save.")

# Save channel images JSON
if channel_images:
    with open(os.path.join(DATA_DIR, "channel_images.json"), "w", encoding="utf-8") as f:
        json.dump(channel_images, f, indent=2)
    print(f"\n💾 Saved {len(channel_images)} channel images to {DATA_DIR}/channel_images.json")
else:
    print("\n📭 No new channel images to save.")

# Save max update_id for next run
with open(last_update_id_path, "w") as f:
    f.write(str(max_update_id))
print(f"\n🔖 Saved last_update_id = {max_update_id}")
