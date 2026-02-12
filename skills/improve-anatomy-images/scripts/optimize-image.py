#!/usr/bin/env python3
"""
解剖学画像の最適化スクリプト

Wikimedia Commonsからダウンロードした画像をWeb表示用に最適化する。
- リサイズ（デフォルト最大幅1200px）
- JPEG/PNG品質調整
- メタデータ除去

Usage:
    python3 optimize-image.py <input> <output> [--max-width 1200] [--quality 85]

Examples:
    python3 optimize-image.py raw/bone.png public/images/anatomy/bone.png
    python3 optimize-image.py raw/spine.jpg public/images/anatomy/spine.jpg --max-width 800
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow が必要です: pip install Pillow")
    sys.exit(1)


def optimize_image(input_path: str, output_path: str, max_width: int = 1200, quality: int = 85):
    src = Path(input_path)
    dst = Path(output_path)

    if not src.exists():
        print(f"❌ ファイルが見つかりません: {src}")
        return False

    # SVGはコピーのみ
    if src.suffix.lower() == ".svg":
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(src.read_bytes())
        print(f"✅ SVGをコピー: {dst}")
        return True

    img = Image.open(src)
    original_size = src.stat().st_size

    # EXIF回転を適用
    from PIL import ImageOps
    img = ImageOps.exif_transpose(img)

    # リサイズ
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.LANCZOS)
        print(f"  リサイズ: {img.width}x{img.height}")

    dst.parent.mkdir(parents=True, exist_ok=True)

    # 形式に応じた保存
    suffix = dst.suffix.lower()
    if suffix in (".jpg", ".jpeg"):
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(dst, "JPEG", quality=quality, optimize=True)
    elif suffix == ".png":
        img.save(dst, "PNG", optimize=True)
    elif suffix == ".webp":
        img.save(dst, "WEBP", quality=quality, method=6)
    else:
        img.save(dst)

    new_size = dst.stat().st_size
    ratio = (1 - new_size / original_size) * 100 if original_size > 0 else 0
    print(f"✅ 最適化完了: {dst}")
    print(f"   {original_size:,} → {new_size:,} bytes ({ratio:.1f}% 削減)")
    print(f"   サイズ: {img.width}x{img.height}")
    return True


def main():
    parser = argparse.ArgumentParser(description="解剖学画像の最適化")
    parser.add_argument("input", help="入力画像パス")
    parser.add_argument("output", help="出力画像パス")
    parser.add_argument("--max-width", type=int, default=1200, help="最大幅 (default: 1200)")
    parser.add_argument("--quality", type=int, default=85, help="JPEG/WebP品質 (default: 85)")
    args = parser.parse_args()

    success = optimize_image(args.input, args.output, args.max_width, args.quality)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
