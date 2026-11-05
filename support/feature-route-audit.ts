import {AstBuilder, GherkinClassicTokenMatcher, Parser} from '@cucumber/gherkin';
import {type GherkinDocument, IdGenerator, type Rule, type Scenario, type Step,} from '@cucumber/messages';

export type CalculatorPageNameOccurrence = { name: string; line: number };

const routeArgument = /"([^"]+)"\s+calculator page\b/gi;

function parseFeature(source: string): GherkinDocument {
  const parser = new Parser(
    new AstBuilder(IdGenerator.incrementing()),
    new GherkinClassicTokenMatcher(),
  );
  return parser.parse(source);
}

function routeNamesInSteps(
  steps: readonly Step[],
  substitutions: ReadonlyMap<string, string> = new Map(),
): CalculatorPageNameOccurrence[] {
  const occurrences: CalculatorPageNameOccurrence[] = [];
  for (const step of steps) {
    let text = step.text;
    for (const [placeholder, value] of substitutions) {
      text = text.replaceAll(`<${placeholder}>`, value);
    }
    routeArgument.lastIndex = 0;
    for (const match of text.matchAll(routeArgument)) {
      const name = match[1].trim();
      if (!name.startsWith('<')) occurrences.push({ name, line: step.location.line });
    }
  }
  return occurrences;
}

function scenarioRouteNames(scenario: Scenario): CalculatorPageNameOccurrence[] {
  const occurrences = routeNamesInSteps(scenario.steps);
  const outlineLines = new Set(
    scenario.steps
      .filter((step) => /"<[^>]+>"\s+calculator page\b/i.test(step.text))
      .map((step) => step.location.line),
  );
  for (const examples of scenario.examples) {
    const headers = examples.tableHeader?.cells.map(({ value }) => value) ?? [];
    for (const row of examples.tableBody) {
      const substitutions = new Map(
        headers.map((header, index) => [header, row.cells[index]?.value ?? '']),
      );
      occurrences.push(
        ...routeNamesInSteps(scenario.steps, substitutions).filter(({ line }) =>
          outlineLines.has(line),
        ),
      );
    }
  }
  return occurrences;
}

function ruleRouteNames(rule: Rule): CalculatorPageNameOccurrence[] {
  return rule.children.flatMap((child) =>
    child.scenario ? scenarioRouteNames(child.scenario) : [],
  );
}

export function extractCalculatorPageNames(source: string): CalculatorPageNameOccurrence[] {
  const document = parseFeature(source);
  return (document.feature?.children ?? []).flatMap((child) => {
    if (child.scenario) return scenarioRouteNames(child.scenario);
    if (child.rule) return ruleRouteNames(child.rule);
    return [];
  });
}

export function unsupportedCalculatorPageNames(
  source: string,
  isSupported: (name: string) => boolean,
): CalculatorPageNameOccurrence[] {
  return extractCalculatorPageNames(source).filter(({ name }) => !isSupported(name));
}
