const fs = require('fs');
const path = require('path');
const { slug } = require('github-slugger');

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (entry.isFile() && entry.name.endsWith('.problems.json')) {
      results.push(full);
    }
  }
  return results;
}

function getSlug(problem) {
  return `/problems/${slug(problem.source)}-${slug(
    String(problem.name || '').replace(' - ', ' ')
  )}`;
}

function collectProblems(json, filePath) {
  const records = [];
  for (const [tableId, value] of Object.entries(json)) {
    if (!Array.isArray(value)) continue;
    value.forEach((problem, index) => {
      if (!problem || typeof problem !== 'object') return;
      records.push({
        filePath,
        tableId,
        index,
        uniqueId: problem.uniqueId,
        name: problem.name,
        source: problem.source,
        url: problem.url,
        statement: problem.statement,
        problem,
        slug: getSlug(problem),
      });
    });
  }
  return records;
}

const root = path.join(process.cwd(), 'content');
const files = walk(root);
const all = [];
for (const file of files) {
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    all.push(...collectProblems(json, file));
  } catch (error) {
    console.error(`Failed parsing ${file}: ${error.message}`);
    process.exitCode = 1;
  }
}

function printGroup(title, map, keyLabel) {
  const groups = [...map.entries()].filter(([, entries]) => entries.length > 1);
  console.log(`\n## ${title}: ${groups.length}`);
  for (const [key, entries] of groups.sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`\n${keyLabel}: ${key}`);
    for (const entry of entries) {
      console.log(JSON.stringify({
        file: path.relative(process.cwd(), entry.filePath),
        tableId: entry.tableId,
        index: entry.index,
        uniqueId: entry.uniqueId,
        name: entry.name,
        source: entry.source,
        url: entry.url,
      }));
    }
  }
}

function toSummary(entry) {
  return {
    file: path.relative(process.cwd(), entry.filePath),
    tableId: entry.tableId,
    index: entry.index,
    uniqueId: entry.uniqueId,
    name: entry.name,
    source: entry.source,
    url: entry.url,
  };
}

const byUniqueId = new Map();
const bySlug = new Map();
for (const entry of all) {
  if (!byUniqueId.has(entry.uniqueId)) byUniqueId.set(entry.uniqueId, []);
  byUniqueId.get(entry.uniqueId).push(entry);
  if (!bySlug.has(entry.slug)) bySlug.set(entry.slug, []);
  bySlug.get(entry.slug).push(entry);
}

printGroup('Duplicate uniqueIds', byUniqueId, 'uniqueId');
printGroup('Duplicate slugs', bySlug, 'slug');

const exactSameFileDuplicates = [];
for (const file of files) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [tableId, value] of Object.entries(json)) {
    if (!Array.isArray(value)) continue;
    const seen = new Map();
    value.forEach((problem, index) => {
      const key = JSON.stringify(problem);
      if (!seen.has(key)) {
        seen.set(key, index);
        return;
      }
      exactSameFileDuplicates.push({
        file: path.relative(process.cwd(), file),
        tableId,
        firstIndex: seen.get(key),
        duplicateIndex: index,
        uniqueId: problem.uniqueId,
        name: problem.name,
      });
    });
  }
}

console.log(`\n## Exact same-file duplicates: ${exactSameFileDuplicates.length}`);
for (const duplicate of exactSameFileDuplicates) {
  console.log(JSON.stringify(duplicate));
}

const gatsbySlugConflicts = [];
for (const [slugValue, entries] of bySlug.entries()) {
  const uniqueIds = [...new Set(entries.map(entry => entry.uniqueId))];
  if (uniqueIds.length > 1) {
    gatsbySlugConflicts.push({
      slug: slugValue,
      entries: entries.map(toSummary),
    });
  }
}

const gatsbyMetadataConflicts = [];
for (const [uniqueId, entries] of byUniqueId.entries()) {
  if (entries.length < 2) continue;
  const signatures = new Set(
    entries.map(entry => JSON.stringify([entry.name, entry.url, entry.source]))
  );
  if (signatures.size > 1) {
    gatsbyMetadataConflicts.push({
      uniqueId,
      entries: entries.map(toSummary),
    });
  }
}

console.log(`\n## Gatsby slug conflicts: ${gatsbySlugConflicts.length}`);
for (const conflict of gatsbySlugConflicts) {
  console.log(JSON.stringify(conflict));
}

console.log(`\n## Gatsby metadata conflicts: ${gatsbyMetadataConflicts.length}`);
for (const conflict of gatsbyMetadataConflicts) {
  console.log(JSON.stringify(conflict));
}
