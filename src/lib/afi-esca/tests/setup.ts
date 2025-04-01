import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => {
  // Start MSW server
  server.listen();
});

afterEach(() => {
  // Reset handlers between tests
  server.resetHandlers();
});

afterAll(() => {
  // Clean up
  server.close();
});