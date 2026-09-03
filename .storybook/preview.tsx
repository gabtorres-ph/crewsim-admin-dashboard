import type { Preview } from '@storybook/react-vite'
import { mswLoader } from 'msw-storybook-addon/csf3'

import '../src/index.css'
import { handlers } from '../src/mocks/handlers'
import { resetMockAccounts } from '../src/features/accounts/mocks'
import { resetMockEsims } from '../src/mocks/handlers/esims'
import { resetMockUsers } from '../src/features/users/mocks'

const preview: Preview = {
  loaders: [mswLoader()],
  beforeEach: () => {
    resetMockAccounts()
    resetMockUsers()
    resetMockEsims()
  },
  parameters: {
    msw: handlers,
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
