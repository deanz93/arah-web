---
name: test
description: Add or fix Vitest + RTL tests for arah-web components and pages
---

# Testing in arah-web

## Run tests
```bash
npm run test              # Vitest (watch mode)
npm run test:run          # Single pass
npm run test:e2e          # Playwright E2E
```

## Component test pattern
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('shows skeleton while loading', () => {
  render(<MyComponent isLoading />);
  expect(screen.getByTestId('skeleton')).toBeInTheDocument();
});

it('shows data after load', async () => {
  render(<MyComponent data={mockData} />);
  expect(await screen.findByText(mockData[0].name)).toBeInTheDocument();
});
```

## Page smoke test
```tsx
import { render } from '@testing-library/react';
import Page from '../app/dashboard/page';

it('renders dashboard page without crash', () => {
  expect(() => render(<Page />)).not.toThrow();
});
```

## Form validation test
```tsx
it('rejects empty required fields', async () => {
  const user = userEvent.setup();
  render(<ReportForm />);
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/required/i)).toBeInTheDocument();
});
```

## What every PR must include
- [ ] New component → test in `__tests__/ComponentName.test.tsx`
- [ ] Loading, empty, error states all tested
- [ ] `npm run test:run` passes
- [ ] `npm run build` passes (no TypeScript or import errors)
