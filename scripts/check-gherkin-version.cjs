const cucumberPackage = require('@cucumber/cucumber/package.json');
const projectPackage = require('../package.json');

const dependencies = ['@cucumber/gherkin', '@cucumber/messages'];
const mismatches = dependencies.flatMap((dependency) => {
  const cucumberVersion = cucumberPackage.dependencies?.[dependency];
  const projectVersion = projectPackage.devDependencies?.[dependency];
  if (!cucumberVersion || !projectVersion) {
    return [`${dependency} must be declared by both Cucumber and this project.`];
  }
  if (projectVersion !== cucumberVersion) {
    return [
      `${dependency} is ${projectVersion} in this project but ${cucumberVersion} in Cucumber.`,
    ];
  }
  return [];
});

if (mismatches.length) {
  console.error(`Gherkin parser dependencies are out of sync:\n${mismatches.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Gherkin parser dependencies match the versions used by @cucumber/cucumber.');
}
