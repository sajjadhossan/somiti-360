import handler from '../_handlers/health.js';

export default function directHealthHandler(req, res) {
  return handler(req, res);
}
