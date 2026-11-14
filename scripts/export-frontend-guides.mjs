/**
 * Export the single frontend guide catalog into the backend account manifest.
 *
 * The frontend catalog is the source of truth for who travellers can see, so
 * backend guide accounts must be generated from it rather than maintained as a
 * second hand-written list.  Run from the repository root:
 *
 *   node scripts/export-frontend-guides.mjs
 *
 * Output: backend/data/guide_accounts.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'frontend/src/data/guidesData.ts');

// Accounts that already exist in local/dev databases and in the README.  Reuse
// them instead of creating a second login for the same person.
const EMAIL_OVERRIDES = new Map([
  [1, 'guide@guides-nepal.com'],
  [2, 'sujal@guides-nepal.com'],
  [3, 'priya@guides-nepal.com'],
  [4, 'guide6@guides-nepal.com'],
  [156, 'guide7@guides-nepal.com'],
  [445, 'guide2@guides-nepal.com'],
  [1006, 'anita@guides-nepal.com'],
]);

const PROVINCE_BY_CITY = new Map(
  Object.entries({
    kathmandu: 'Bagmati Province',
    lalitpur: 'Bagmati Province',
    patan: 'Bagmati Province',
    bhaktapur: 'Bagmati Province',
    nagarkot: 'Bagmati Province',
    chandragiri: 'Bagmati Province',
    thamel: 'Bagmati Province',
    asan: 'Bagmati Province',
    chitwan: 'Bagmati Province',
    bharatpur: 'Bagmati Province',
    sauraha: 'Bagmati Province',
    trishuli: 'Bagmati Province',
    pokhara: 'Gandaki Province',
    sarangkot: 'Gandaki Province',
    ghorepani: 'Gandaki Province',
    jomsom: 'Gandaki Province',
    lamjung: 'Gandaki Province',
    lukla: 'Koshi Province',
    namche: 'Koshi Province',
    solukhumbu: 'Koshi Province',
    bardia: 'Lumbini Province',
  })
);

const REGIONAL_HEAD_BY_PROVINCE = new Map([
  ['Koshi Province', 'regional-1@guides-nepal.com'],
  ['Madhesh Province', 'regional-2@guides-nepal.com'],
  ['Bagmati Province', 'regional-3@guides-nepal.com'],
  ['Gandaki Province', 'regional-4@guides-nepal.com'],
  ['Lumbini Province', 'regional-5@guides-nepal.com'],
  ['Karnali Province', 'regional-6@guides-nepal.com'],
  ['Sudurpashchim Province', 'regional-7@guides-nepal.com'],
]);

const slugify = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'guide';

const provinceFor = (guide) => {
  const places = [guide.livesIn, ...(guide.cities || [])].filter(Boolean);
  for (const place of places) {
    const province = PROVINCE_BY_CITY.get(String(place).trim().toLowerCase());
    if (province) return province;
  }
  return 'Bagmati Province';
};

const loadCatalog = () => {
  const source = fs.readFileSync(catalogPath, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  new Function('exports', 'require', 'module', '__filename', '__dirname', js)(
    module.exports,
    require,
    module,
    catalogPath,
    path.dirname(catalogPath)
  );
  return module.exports.allGuides;
};

const guides = loadCatalog();
const nameCounts = new Map();
for (const guide of guides) {
  nameCounts.set(guide.name, (nameCounts.get(guide.name) || 0) + 1);
}

const accounts = guides.map((guide) => {
  const duplicateName = nameCounts.get(guide.name) > 1;
  const baseEmail = `${slugify(guide.name)}${duplicateName && !EMAIL_OVERRIDES.has(guide.id) ? `-${guide.id}` : ''}@guides-nepal.com`;
  const region = provinceFor(guide);
  return {
    catalog_guide_id: guide.id,
    name: guide.name,
    email: EMAIL_OVERRIDES.get(guide.id) || baseEmail,
    password: 'Guide@2024',
    role: guide.role,
    region,
    city: guide.livesIn || guide.cities?.[0] || null,
    cities: guide.cities || [],
    languages: guide.languages || [],
    bio: guide.bio || '',
    image: guide.image || '',
    rating: guide.rating ?? 0,
    reviews: guide.reviews ?? 0,
    verified: guide.verified ?? false,
    catalog_name_is_unique: !duplicateName,
    reviewed_by: REGIONAL_HEAD_BY_PROVINCE.get(region) || null,
  };
});

const emailOwners = new Map();
for (const account of accounts) {
  const key = account.email.toLowerCase();
  if (emailOwners.has(key)) {
    throw new Error(
      `Duplicate guide account email ${account.email} for catalog ids ${emailOwners.get(key)} and ${account.catalog_guide_id}`
    );
  }
  emailOwners.set(key, account.catalog_guide_id);
}

const outputPath = path.join(root, 'backend/data/guide_accounts.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(accounts, null, 2)}\n`, 'utf8');
console.log(`Wrote ${accounts.length} guide accounts to ${path.relative(root, outputPath)}`);
