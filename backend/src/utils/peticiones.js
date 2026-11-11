// Indica si la respuesta debe ir en JSON (API o fetch) en vez de una vista
const esPeticionJSON = (req) =>
    req.originalUrl.startsWith('/api') || req.accepts(['html', 'json']) === 'json';

export { esPeticionJSON };
