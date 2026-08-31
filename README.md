# APC Calm Companion

APC Calm Companion is a parent-facing web app for ordinary, non-emergency moments. It helps a parent choose one observable situation, try one small action and use an optional visual tool.

## Product boundaries

- General educational support only
- Not therapy, diagnosis, assessment, medical advice or emergency support
- No claim that an action will calm every child
- No account, analytics or app-origin data submission
- No persistence of child names, notes, routines or behaviour information

## Local development

```bash
npm ci
npm run dev
```

## Release checks

```bash
npm run check
```

The static host must honour `public/_headers`. Test the generated `dist` folder on representative iPhone, Android and desktop browsers before public promotion.

`npm run check` runs lint, content tests, the production build, safety and privacy verification, and production-asset verification. It does not replace deployed-device, assistive-technology or parent usability testing.
