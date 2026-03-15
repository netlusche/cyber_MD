# Release Plannings 1.4

## User Stories

### 1. Code View Direct Editing
Man soll nun auch im Code View direkt editieren können. Änderungen wirken sich direkt auch auf die WYSIWYG Sicht aus.

**Akzeptanzkriterien:**
- [ ] Text kann im CODE-Layout Modus (`.markdown-pane`) direkt geschrieben und bearbeitet werden.
- [ ] Die Änderungen im Code View werden beim Wechsel in den WYSIWYG Modus sofort (oder in Echtzeit) in den Tiptap-Editor synchronisiert.
- [ ] Es muss ein **automatisierter Test** (Vitest in `core.test.tsx` oder Playwright E2E) geschrieben werden, der diese Funktionalität abdeckt (Edit im Code -> Sync im Editor).
- [ ] Die `README.md` muss um diese neue Funktionalität ergänzt werden.
