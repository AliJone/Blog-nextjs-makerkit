// @ts-check
import { createRequire } from 'module';

import baseConfig from '@kit/eslint-config/apps.js';

const require = createRequire(import.meta.url);

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: './tsconfig.json',
      },
    },
  },
];