import os
import requests
import json

BOT_TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID   = os.environ.get("CHAT_ID")

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
IMAGE_DIR = "telegram_images"
os.makedirs(IMAGE_DIR, exist_ok=True)

print("📡 Requesting updates from Telegram...")
try:
    response = requests.get(f"{API_URL}/getUpdates")
    response.raise_for_status()
    updates = response.json().get("result", [])
except Exception as e:
    print(f"❌ Failed to get updates: {e}")
    exit(1)

print(f"📬 Received {len(updates)} updates")

backgrounds = {}

for i, upd in enumerate(updates):
    msg = upd.get("message")
    if not msg:
        print(f"⚠️ Update #{i} has no message, skipping")
        continue

    chat_id = str(msg.get("chat", {}).get("id"))
    print(f"\n🔍 Message #{i}: Chat ID = {chat_id}")

    if chat_id != CHAT_ID:
        print("⛔ Skipped: Chat ID doesn't match expected value.")
        continue

    if "photo" not in msg or "caption" not in msg:
        print("⚠️ Skipped: Message has no photo or caption.")
        continue

    caption = msg["caption"].strip()
    print(f"📝 Found caption: '{caption}'")

    div_id = CAPTION_TO_ID.get(caption)
    if not div_id:
        print(f"⛔ Caption '{caption}' not mapped to any div. Valid options: {list(CAPTION_TO_ID.keys())}")
        continue

    file_id = msg["photo"][-1]["file_id"]
    print(f"📦 Fetching file info for file_id: {file_id}")

    try:
        file_info_resp = requests.get(f"{API_URL}/getFile", params={"file_id": file_id})
        file_info_resp.raise_for_status()
        file_path = file_info_resp.json()["result"]["file_path"]
        print(f"📁 File path from Telegram: {file_path}")
    except Exception as e:
        print(f"❌ Error retrieving file path: {e}")
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
    except Exception as e:
        print(f"❌ Error saving image: {e}")
        continue

    backgrounds[div_id] = f"{IMAGE_DIR}/{image_name}"
    print(f"🖼️ Mapped image to div '{div_id}'")

if backgrounds:
    with open("backgrounds.json", "w", encoding="utf-8") as f:
        json.dump(backgrounds, f, indent=2)
    print("\n💾 backgrounds.json updated successfully!")
else:
    print("📭 No valid images found. backgrounds.json not updated.")
