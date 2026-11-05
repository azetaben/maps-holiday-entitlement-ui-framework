export interface DiagnosticEvidenceTarget {
  attach(data: string, mediaType: string): void;
}

export interface DiagnosticAssessment {
  failed: boolean;
  shouldThrow: boolean;
  message: string;
}

export function assessScenarioDiagnostics(
  target: DiagnosticEvidenceTarget,
  diagnostics: readonly string[],
  alreadyFailed: boolean,
): DiagnosticAssessment {
  if (diagnostics.length) {
    target.attach(JSON.stringify({ diagnostics }, null, 2), 'application/json');
  }
  return {
    failed: alreadyFailed || diagnostics.length > 0,
    shouldThrow: !alreadyFailed && diagnostics.length > 0,
    message: diagnostics.length ? `Unexpected browser diagnostics:\n${diagnostics.join('\n')}` : '',
  };
}

export function throwForUnexpectedDiagnostics(assessment: DiagnosticAssessment): void {
  if (assessment.shouldThrow) throw new Error(assessment.message);
}
