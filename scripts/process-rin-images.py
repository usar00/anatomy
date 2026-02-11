#!/usr/bin/env python3
"""
リンのキャラクター画像を処理するスクリプト
白背景を透過処理してWebPに変換し、public/images/rin/ に配置します。

使い方:
  1. tmp/ フォルダに以下のファイル名で画像を配置:
     - idle.png       (通常 - 腰に手ポーズ)
     - happy.png      (正解 - 拍手ポーズ)
     - thinking.png   (考え中 - 顎に手ポーズ)
     - celebrating.png (祝福 - 両手上げポーズ)
     - comforting.png  (慰め - サムズアップポーズ)

  2. スクリプトを実行:
     python3 scripts/process-rin-images.py

  ※ encouraging.webp は idle.webp のコピーとして自動生成されます
"""

from PIL import Image
import os
import shutil

SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "tmp")
DST_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "rin")

# Map: source filename -> destination filename(s)
IMAGE_MAP = {
    "idle.png": ["idle.webp", "encouraging.webp"],  # encouraging = idle のコピー
    "happy.png": ["happy.webp"],
    "thinking.png": ["thinking.webp"],
    "celebrating.png": ["celebrating.webp"],
    "comforting.png": ["comforting.webp"],
}

TOLERANCE = 30  # White threshold tolerance


def remove_white_background(img: Image.Image, tolerance: int = TOLERANCE) -> Image.Image:
    """Remove white/near-white background and make it transparent."""
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for pixel in data:
        r, g, b, a = pixel
        # If pixel is near-white, make it transparent
        if r > (255 - tolerance) and g > (255 - tolerance) and b > (255 - tolerance):
            new_data.append((r, g, b, 0))
        else:
            new_data.append(pixel)
    img.putdata(new_data)
    return img


def process_images():
    os.makedirs(DST_DIR, exist_ok=True)

    processed = 0
    errors = []

    for src_name, dst_names in IMAGE_MAP.items():
        src_path = os.path.join(SRC_DIR, src_name)

        if not os.path.exists(src_path):
            errors.append(f"  Missing: {src_name}")
            continue

        print(f"Processing {src_name}...")
        img = Image.open(src_path)
        img_transparent = remove_white_background(img)

        for dst_name in dst_names:
            dst_path = os.path.join(DST_DIR, dst_name)
            img_transparent.save(dst_path, "WEBP", quality=90)
            print(f"  -> {dst_name} ({os.path.getsize(dst_path) // 1024}KB)")

        processed += 1

    print(f"\nDone: {processed}/{len(IMAGE_MAP)} images processed")

    if errors:
        print("Errors:")
        for e in errors:
            print(e)
        print(f"\nPlease place the missing files in: {os.path.abspath(SRC_DIR)}")
    else:
        print("All images processed successfully!")


if __name__ == "__main__":
    process_images()
