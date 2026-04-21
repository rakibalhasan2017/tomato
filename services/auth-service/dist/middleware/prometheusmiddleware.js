import { Counter, Histogram, Gauge, collectDefaultMetrics, register } from 'prom-client';
/* =========================
   DEFAULT METRICS
   (enabled once at module load)
========================= */
collectDefaultMetrics({
    prefix: 'node_',
});
/* =========================
   METRICS DEFINITIONS
========================= */
// Total requests
const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
// Request duration (latency)
const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});
// Error counter
const httpErrorCounter = new Counter({
    name: 'http_errors_total',
    help: 'Total failed HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
// In-flight requests (current load)
const inFlightRequests = new Gauge({
    name: 'http_in_flight_requests',
    help: 'Number of requests currently being processed',
});
/* =========================
   ROUTE NORMALIZATION
   (LOW CARDINALITY SAFE)
========================= */
const getRouteLabel = (req) => {
    const expressRoute = req.route && typeof req.route.path === 'string' ? req.route.path : null;
    if (expressRoute) {
        return `${req.baseUrl ?? ''}${expressRoute}`;
    }
    const path = req.originalUrl ?? '/';
    const [pathWithoutQuery = ''] = path.split('?');
    return (pathWithoutQuery.replace(/\/\d+/g, '/:id').replace(/\/[a-f0-9-]{24}/g, '/:id') ||
        'unknown_route');
};
/* =========================
   MAIN MIDDLEWARE
========================= */
export const requestMetricsMiddleware = (req, res, next) => {
    if (req.path === '/metrics')
        return next();
    const start = process.hrtime.bigint();
    let inFlightFinalized = false;
    const finalizeInFlight = () => {
        if (inFlightFinalized) {
            return;
        }
        inFlightFinalized = true;
        inFlightRequests.dec();
    };
    inFlightRequests.inc();
    res.on('finish', () => {
        const duration = Number(process.hrtime.bigint() - start) / 1e9;
        const route = getRouteLabel(req);
        // group status codes (2xx, 4xx, 5xx)
        const status = `${Math.floor(res.statusCode / 100)}xx`;
        const labels = {
            method: req.method,
            route,
            status,
        };
        httpRequestCounter.inc(labels);
        httpRequestDuration.observe(labels, duration);
        if (res.statusCode >= 400) {
            httpErrorCounter.inc(labels);
        }
        finalizeInFlight();
    });
    // safety: if request is aborted
    res.on('close', () => {
        finalizeInFlight();
    });
    next();
};
/* =========================
   SETUP FUNCTION
========================= */
export const setupPrometheus = (app) => {
    app.use(requestMetricsMiddleware);
    app.get('/metrics', async (_req, res) => {
        try {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
        }
        catch (err) {
            res.status(500).send('Error generating metrics');
        }
    });
};
