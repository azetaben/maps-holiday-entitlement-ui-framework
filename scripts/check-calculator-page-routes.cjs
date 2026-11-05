const fs = require('node:fs');
const path = require('node:path');
require('ts-node/register');
const { calculatorPageRoute } = require('../pages/base/page-manager');
const {
  extractCalculatorPageNames,
  unsupportedCalculatorPageNames,
} = require('../support/feature-route-audit');

const featureRoot = path.resolve(__dirname, '../features');

function featureFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return featureFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.feature') ? [entryPath] : [];
  });
}

const problems = [];
let checked = 0;
for (const filePath of featureFiles(featureRoot)) {
  const source = fs.readFileSync(filePath, 'utf8');
  const routes = unsupportedCalculatorPageNames(source, (name) => {
    try {
      calculatorPageRoute(name);
      return true;
    } catch {
      return false;
    }
  });
  checked += extractCalculatorPageNames(source).length;
  for (const route of routes) {
    problems.push(
      `${path.relative(process.cwd(), filePath)}:${route.line}: unknown page "${route.name}"`,
    );
  }
}

if (problems.length) {
  console.error(
    `Unsupported calculator page names found in feature files:\n${problems.join('\n')}`,
  );
  process.exitCode = 1;
} else {
  console.log(`Validated ${checked} calculator page name(s) used in feature files.`);
}
