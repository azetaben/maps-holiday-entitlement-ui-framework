export const COOKIE_UI = {
  bannerHeading: 'Cookies on GOV.UK',
  essentialCopy: 'We use some essential cookies to make this website work.',
  optionalCopy:
    'We’d like to set additional cookies to understand how you use GOV.UK, remember your settings and improve government services.',
  thirdPartyCopy: 'We also use cookies set by other sites to help us deliver content from their services.',
  accept: 'Accept additional cookies',
  reject: 'Reject additional cookies',
  view: 'View cookies',
  save: 'Save changes',
  hide: 'Hide cookie message',
  confirmation: 'You have rejected additional cookies.',
  settingsLink: 'change your cookie settings',
  settingsHref: '/help/cookies',
  settingsPath: /\/help\/cookies\/?(?:\?.*)?$/,
  settingsTitle: /Cookies on GOV\.UK/i,
  rememberHeading: 'Cookies that remember your settings',
  marketingHeading: 'Cookies that help with our communications and marketing',
  necessaryHeading: 'Strictly necessary cookies',
  savedHeading: 'Your cookie settings were saved',
  categories: {
    measure: 'Do you allow cookies that measure website use?',
    settings: 'Do you allow cookies that remember your settings?',
    marketing: 'Do you allow cookies that help with communications and marketing?',
  },
  choices: {
    measure: {
      allow: 'Use cookies that measure my website use',
      reject: 'Do not use cookies that measure my website use',
    },
    settings: {
      allow: 'Use cookies that remember my settings on the site',
      reject: 'Do not use cookies that remember my settings on the site',
    },
    marketing: {
      allow: 'Use cookies that help with communications and marketing',
      reject: 'Do not use cookies that help with communications and marketing',
    },
  },
} as const;

