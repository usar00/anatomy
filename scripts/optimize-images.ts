/**
 * 画像最適化スクリプト
 *
 * 使い方:
 *   npx tsx scripts/optimize-images.ts <input-dir> [output-dir]
 *
 * - 解剖図を WebP に変換し、ファイルサイズを削減
 * - 解像度を維持しつつ、600px幅に最適化
 * - 出力: WebP 品質80
 */

import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const MAX_WIDTH = 600;
const QUALITY = 80;

async function optimizeImage(
  inputPath: string,
  outputPath: string
): Promise<{ originalSize: number; optimizedSize: number }> {
  const inputBuffer = fs.readFileSync(inputPath);
  const originalSize = inputBuffer.length;

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  let pipeline = image;

  // Resize if wider than MAX_WIDTH
  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  // Convert to WebP
  const outputBuffer = await pipeline
    .webp({ quality: QUALITY })
    .toBuffer();

  const ext = path.extname(outputPath);
  const webpPath = outputPath.replace(ext, ".webp");
  fs.writeFileSync(webpPath, outputBuffer);

  return { originalSize, optimizedSize: outputBuffer.length };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: npx tsx scripts/optimize-images.ts <input-dir> [output-dir]");
    console.log("\nOptimizes images for web delivery:");
    console.log("  - Resizes to max 600px width");
    console.log("  - Converts to WebP (quality 80)");
    console.log("  - Supports png, jpg, jpeg, gif, webp");
    process.exit(1);
  }

  const inputDir = path.resolve(args[0]);
  const outputDir = args[1] ? path.resolve(args[1]) : path.join(inputDir, "optimized");

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const supportedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  const files = fs.readdirSync(inputDir).filter((f) =>
    supportedExtensions.includes(path.extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log("No image files found in input directory");
    process.exit(0);
  }

  console.log(`🖼️  Optimizing ${files.length} images...\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      const result = await optimizeImage(inputPath, outputPath);
      totalOriginal += result.originalSize;
      totalOptimized += result.optimizedSize;

      const savings = ((1 - result.optimizedSize / result.originalSize) * 100).toFixed(1);
      const ext = path.extname(file);
      const outputName = file.replace(ext, ".webp");
      console.log(
        `  ✅ ${file} → ${outputName} (${formatSize(result.originalSize)} → ${formatSize(result.optimizedSize)}, -${savings}%)`
      );
    } catch (e) {
      console.error(`  ❌ ${file}: ${e}`);
    }
  }

  const totalSavings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);
  console.log(`\n📊 Total: ${formatSize(totalOriginal)} → ${formatSize(totalOptimized)} (-${totalSavings}%)`);
  console.log(`📁 Output: ${outputDir}`);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

main();
