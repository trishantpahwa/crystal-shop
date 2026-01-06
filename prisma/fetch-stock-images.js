#!/usr/bin/env node
/*
Fetch 3-4 stock images for a list of spiritual crystal jewelry items and
create stock-images/<slug>/<slug>.json compatible with prisma/seed.ts.

Usage:
  PEXELS_API_KEY=... node services/fetch-stock-images.js "Amethyst,Rose Quartz,Citrine"
  UNSPLASH_ACCESS_KEY=... node services/fetch-stock-images.js

Env vars:
  - PEXELS_API_KEY or UNSPLASH_ACCESS_KEY (one required)
  - IMAGES_PER_PRODUCT (default 3; max 4)
  - JEWELRY_TYPE (default "Bracelet")
*/
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '4ZNMpZ6FeEqV2v3d51b80nPyIb3gUNBNJnFMRmggIYiMpX9IEHrhXywu';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const IMAGES_PER_PRODUCT = Math.max(1, Math.min(4, parseInt(process.env.IMAGES_PER_PRODUCT || '3', 10)));
const JEWELRY_TYPE = process.env.JEWELRY_TYPE || 'Bracelet';

const DEFAULT_CRYSTALS = [
  'Amethyst',
  'Rose Quartz',
  'Clear Quartz',
  'Black Tourmaline',
  'Citrine',
  "Tiger's Eye",
  'Lapis Lazuli',
  'Moonstone',
  'Aquamarine',
  'Carnelian',
  'Green Aventurine',
  'Labradorite',
];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function searchPexels(query, limit) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=square`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!res.ok) throw new Error(`Pexels error ${res.status}`);
  const json = await res.json();
  return (json.photos || []).map((p) => p.src.large2x || p.src.large || p.src.medium).filter(Boolean);
}

async function searchUnsplash(query, limit) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&content_filter=high&orientation=squarish`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } });
  if (!res.ok) throw new Error(`Unsplash error ${res.status}`);
  const json = await res.json();
  return (json.results || []).map((p) => p.urls.regular || p.urls.full || p.urls.small).filter(Boolean);
}

async function downloadTo(url, filePath) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download failed ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await fsp.writeFile(filePath, buf);
}

(async function main() {
  try {
    const provider = PEXELS_API_KEY ? 'pexels' : (UNSPLASH_ACCESS_KEY ? 'unsplash' : '');
    if (!provider) {
      console.error('Missing PEXELS_API_KEY or UNSPLASH_ACCESS_KEY');
      process.exit(1);
    }

    const arg = (process.argv[2] || '').trim();
    const names = arg
      ? arg.split(',').map((s) => s.trim()).filter(Boolean)
      : DEFAULT_CRYSTALS;

    const root = process.cwd();
    const stockRoot = path.join(root, 'stock-images');
    ensureDirSync(stockRoot);

    for (const name of names) {
      const slug = slugify(name);
      const dir = path.join(stockRoot, slug);
      const jsonPath = path.join(dir, `${slug}.json`);

      ensureDirSync(dir);

      if (fs.existsSync(jsonPath)) {
        console.log(`Skipping ${name} (already exists)`);
        continue;
      }

      const query = `${name} crystal ${JEWELRY_TYPE.toLowerCase()}`;
      const limit = IMAGES_PER_PRODUCT;

      let urls = [];
      try {
        urls = provider === 'pexels' ? await searchPexels(query, limit) : await searchUnsplash(query, limit);
      } catch (e) {
        console.error(`Search failed for ${name}:`, e.message);
        continue;
      }

      if (!urls.length) {
        console.warn(`No images found for ${name}`);
        continue;
      }

      const saved = [];
      for (let i = 0; i < Math.min(limit, urls.length); i++) {
        const url = urls[i];
        const u = new URL(url);
        const ext = (path.extname(u.pathname) || '.jpg').split('?')[0] || '.jpg';
        const filename = `${slug}-${i + 1}${ext}`;
        const filePath = path.join(dir, filename);
        try {
          await downloadTo(url, filePath);
          saved.push(filename);
        } catch (e) {
          console.error(`Failed to download image ${i + 1} for ${name}:`, e.message);
        }
      }

      if (!saved.length) {
        console.warn(`No images saved for ${name}`);
        continue;
      }

      const json = {
        name: `${name} ${JEWELRY_TYPE}`,
        subtitle: name,
        price: '100',
        images: saved.map((fn) => `../${slug}/${fn}`),
      };

      await fsp.writeFile(jsonPath, JSON.stringify(json, null, 4));
      console.log(`Created: ${path.relative(root, jsonPath)} (${saved.length} images)`);
    }

    console.log('Done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
