# Removed From Web - 2026-06-17

These files were moved out of the active Next.js app during cleanup.

- `src/app/health/` - old Health AI route. Current scope uses Lost & Found instead.
- `src/components/shell/chip.tsx` - duplicate/unused shell chip; `src/components/ui/chip.tsx` remains active.
- `src/components/shell/image-placeholder.tsx` - unused shell image placeholder; `src/components/ui/img.tsx` remains available.
- `public/*.svg` - default Next.js starter assets with no references in current source.

Keeping them here makes the cleanup reversible without leaving stale routes/assets active.
