#!/usr/bin/env node
/**
 * MacFlow — экспорт всей текстовой части сайта в один файл.
 *
 * Источники:
 *   src/messages/ru.json, src/messages/en.json
 *   src/data/legal/{privacy,terms,offer,consent}.ts
 *
 * Запуск:
 *   npm run copy:export
 *   npm run copy:export -- /путь/к/файлу.txt
 *
 * По умолчанию файл сохраняется на Рабочий стол:
 *   ~/Desktop/MacFlow-тексты.txt
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const outPath = process.argv[2] ?? path.join(os.homedir(), 'Desktop', 'MacFlow-тексты.txt');

const MESSAGE_LOCALES = ['ru', 'en'];
const MESSAGE_GROUPS = [
  {
    title: 'ОБЩИЕ ЭЛЕМЕНТЫ САЙТА',
    note: 'Мета-теги, навигация, подвал, ошибки, онбординг и всплывающие уведомления.',
    roots: ['meta', 'common', 'nav', 'footer', 'errors', 'onboarding', 'toast'],
  },
  {
    title: 'ГЛАВНАЯ СТРАНИЦА',
    note: 'Маршруты: /ru и /en. FAQ на главной использует тексты из раздела «СТРАНИЦА FAQ».',
    roots: ['landing', 'home'],
  },
  {
    title: 'СТРАНИЦА ЦЕН',
    note: 'Маршрут: /pricing',
    roots: ['pricing'],
  },
  {
    title: 'СТРАНИЦА «О ПРИЛОЖЕНИИ»',
    note: 'Маршрут: /about',
    roots: ['about'],
  },
  {
    title: 'СТРАНИЦА FAQ',
    note: 'Маршрут: /faq. Эти же вопросы и ответы показываются в блоке FAQ на главной.',
    roots: ['faq'],
  },
  {
    title: 'СТРАНИЦА ПОДДЕРЖКИ',
    note: 'Маршрут: /support',
    roots: ['support'],
  },
  {
    title: 'ЛИЧНЫЙ КАБИНЕТ',
    note: 'Маршрут: /account',
    roots: ['account'],
  },
  {
    title: 'АДМИНКА',
    note: 'Маршрут: /admin',
    roots: ['admin'],
  },
  {
    title: 'СТРАНИЦА СКАЧИВАНИЯ',
    note: 'Маршрут: /download',
    roots: ['download'],
  },
  {
    title: 'КАТАЛОГ И КАРТОЧКА ОБОЕВ',
    note: 'Тексты интерфейса каталога и карточки обоев. Маршруты могут быть не подключены в текущей сборке.',
    roots: ['catalog', 'wallpaper'],
  },
  {
    title: 'ЮРИДИЧЕСКИЕ ДОКУМЕНТЫ — ИНТЕРФЕЙС',
    note: 'Общие подписи на страницах /legal/privacy, /legal/terms, /legal/offer, /legal/consent.',
    roots: ['legal'],
  },
];

const LEGAL_DOCUMENTS = [
  { slug: 'privacy', file: 'privacy.ts', exportName: 'privacyPolicy', label: 'Политика ПДн' },
  { slug: 'terms', file: 'terms.ts', exportName: 'termsOfUse', label: 'Условия использования' },
  { slug: 'offer', file: 'offer.ts', exportName: 'publicOffer', label: 'Публичная оферта' },
  {
    slug: 'consent',
    file: 'consent.ts',
    exportName: 'personalDataConsent',
    label: 'Согласие на обработку ПДн',
  },
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function getByPath(object, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value?.[key], object);
}

/** Превращает вложенный объект в список `путь = значение`. */
function flatten(value, prefix, out) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      flatten(item, prefix ? `${prefix}.${key}` : key, out);
    }
    return;
  }
  const text = String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n');
  out.push([prefix, text]);
}

/** Загружает TS-файл с legal-документами и возвращает его экспорты. */
function loadLegalModule(fileName) {
  const file = path.join(root, 'src/data/legal', fileName);
  const source = fs.readFileSync(file, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: file,
  });

  const moduleShim = { exports: {} };
  const requireStub = () => ({});
  new Function('exports', 'require', 'module', '__filename', '__dirname', outputText)(
    moduleShim.exports,
    requireStub,
    moduleShim,
    file,
    path.dirname(file),
  );
  return moduleShim.exports;
}

function formatValues(entries) {
  return entries.map(([key, value]) => `${key} = ${value}`).join('\n');
}

const lines = [];
const now = new Date().toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' });

lines.push('MacFlow — тексты сайта');
lines.push('='.repeat(80));
lines.push('');
lines.push(`Дата экспорта: ${now}`);
lines.push('');
lines.push('КАК РЕДАКТИРОВАТЬ:');
lines.push('1. Меняйте только текст после знака « = ». Ключи слева не трогайте.');
lines.push('2. Не меняйте подстановки в фигурных скобках: {email}, {count}, {date} и т. п.');
lines.push('3. Блоки [RU] и [EN] редактируются независимо.');
lines.push('4. Значения с переносами строк записаны как \\n — это нормально.');
lines.push('5. Когда закончите, пришлите этот файл обратно.');
lines.push('');
lines.push('='.repeat(80));
lines.push('');

for (const locale of MESSAGE_LOCALES) {
  const messages = readJson(path.join(root, 'src/messages', `${locale}.json`));

  for (const group of MESSAGE_GROUPS) {
    const entries = [];
    for (const rootKey of group.roots) {
      const value = getByPath(messages, rootKey);
      if (value !== undefined) flatten(value, rootKey, entries);
    }
    if (entries.length === 0) continue;

    lines.push('-'.repeat(80));
    lines.push(`${group.title} — ${locale.toUpperCase()}`);
    lines.push(group.note);
    lines.push('-'.repeat(80));
    lines.push('');
    lines.push(formatValues(entries));
    lines.push('');
  }
}

// ─────────────────────────────────────────────────────────────
// Юридические документы
// ─────────────────────────────────────────────────────────────

for (const doc of LEGAL_DOCUMENTS) {
  const moduleExports = loadLegalModule(doc.file);
  const bundle = moduleExports[doc.exportName];
  if (!bundle) continue;

  for (const locale of MESSAGE_LOCALES) {
    const document = bundle[locale] ?? bundle.ru;
    if (!document) continue;
    const entries = [];
    flatten(document, `legal.${doc.slug}.${locale}`, entries);

    lines.push('='.repeat(80));
    lines.push(`ЮРИДИЧЕСКИЙ ДОКУМЕНТ: ${doc.label} — ${locale.toUpperCase()}`);
    lines.push(`Маршрут: /legal/${doc.slug}`);
    lines.push('='.repeat(80));
    lines.push('');
    lines.push(formatValues(entries));
    lines.push('');
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`✓ Тексты MacFlow сохранены: ${outPath}`);
