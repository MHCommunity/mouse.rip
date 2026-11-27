import { mock } from 'bun:test';

// Server modules import 'server-only' to stop them reaching a client bundle. Outside Next it throws on import,
// and the tests run them on the server's side anyway.
mock.module('server-only', () => ({}));
