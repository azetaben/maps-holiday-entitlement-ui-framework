module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['support/world.ts', 'support/hooks.ts', 'tests/integration/diagnostics.steps.ts'],
    publishQuiet: true,
  },
};
