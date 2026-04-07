const fs = require('fs');
const path = require('path');

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

const files = walk(path.join(process.cwd(), 'content'));
let changedFiles = 0;
let removedEntries = 0;

for (const file of files) {
  const originalText = fs.readFileSync(file, 'utf8');
  const json = JSON.parse(originalText);
  let changed = false;

  for (const [tableId, value] of Object.entries(json)) {
    if (!Array.isArray(value)) continue;
    const seen = new Set();
    const deduped = [];
    for (const problem of value) {
      const key = JSON.stringify(problem);
      if (seen.has(key)) {
        removedEntries += 1;
        changed = true;
        continue;
      }
      seen.add(key);
      deduped.push(problem);
    }
    json[tableId] = deduped;
  }

  if (!changed) continue;
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
  changedFiles += 1;
  console.log(path.relative(process.cwd(), file));
}

console.log(`Changed files: ${changedFiles}`);
console.log(`Removed entries: ${removedEntries}`);
