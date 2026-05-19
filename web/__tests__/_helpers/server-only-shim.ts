// Vitest unit tests run in node, not in an RSC context, so the real
// `server-only` package throws on import. This shim is wired via
// vitest.config.ts resolve.alias and is never bundled into Next builds.
export {}
