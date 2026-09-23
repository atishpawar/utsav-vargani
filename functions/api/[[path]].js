import app from '../../src/server/index.js';

export const onRequest = (context) => {
  return app.fetch(context.request, context.env, context.executionContext);
};
