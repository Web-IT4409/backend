const morgan = require('morgan');

morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('headers', (req) => JSON.stringify(req.headers));

const requestLogger = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        'Headers:', tokens.headers(req),
        'Body:', tokens.body(req)
    ].join(' ');
});

module.exports = requestLogger;