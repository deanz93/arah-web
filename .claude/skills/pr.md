---
name: pr
description: Pre-PR checklist for arah-web
---

# Pre-PR Checklist — arah-web

```bash
npm run typecheck   # Zero TypeScript errors
npm run lint        # Zero ESLint errors
npm run test:run    # All Vitest tests pass
npm run build       # Production build succeeds
```

## Review checklist

### Styling
- [ ] No custom `.css` files added
- [ ] No `style={{ }}` inline props
- [ ] Used shadcn/ui component where one exists
- [ ] Dark mode variants added (`dark:`)
- [ ] Mobile layout tested at 375px

### Testing
- [ ] New component has a test file
- [ ] Loading, empty, and error states tested
- [ ] All existing tests pass

### UX
- [ ] Destructive actions have a confirmation Dialog
- [ ] Async actions show toast on success and error
- [ ] Tables have empty state with CTA
- [ ] Forms show inline field-level errors

### Story
- [ ] PR title: `feat(web): WEB-NNN description`
- [ ] Story updated to 🔄 In Progress in `docs/bmad/04-stories.md`
