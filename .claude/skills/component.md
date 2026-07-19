---
name: component
description: Create a new Next.js/React component with Tailwind + shadcn/ui and Vitest tests
---

# Create Web Component

## Component template (Server Component default)

```tsx
// src/components/[ComponentName]/index.tsx
import { cn } from '@/lib/utils';

interface [ComponentName]Props {
  className?: string;
  // add props
}

export function [ComponentName]({ className, ...props }: [ComponentName]Props) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Tailwind classes only — no custom CSS */}
    </div>
  );
}
```

## If you need a shadcn primitive, install it first:
```bash
npx shadcn-ui@latest add button dialog form table badge card
```

## Test template

```tsx
// src/components/[ComponentName]/__tests__/[ComponentName].test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [ComponentName] } from '../index';

describe('[ComponentName]', () => {
  it('renders without crash', () => {
    render(<[ComponentName] />);
  });

  it('handles primary action', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<[ComponentName] onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: /action/i }));
    expect(onAction).toHaveBeenCalled();
  });

  it('shows empty state when no data', () => {
    render(<[ComponentName] data={[]} />);
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });
});
```

## Rules
- Tailwind className only — no style prop, no CSS files
- shadcn/ui for interactive primitives (Button, Dialog, Form, etc.)
- Dark mode: add `dark:` variants for background, text, border
- Mobile-first: design for 375px, then scale up
