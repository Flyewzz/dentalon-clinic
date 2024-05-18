const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
const { trace, diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Enable diagnostic logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const traceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
});

const sdk = new NodeSDK({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'dentalon-backend',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version ?? '0.0.0',
        env: process.env.NODE_ENV || '',
    }),
    instrumentations: [
        getNodeAutoInstrumentations(),
        new HttpInstrumentation({
            requestHook: (span, request) => {
                span.setAttribute('http.request.body', JSON.stringify(request.body));
            },
            responseHook: (span, response) => {
                span.setAttribute('http.response.body', JSON.stringify(response.body));
            },
        }),
        new MongoDBInstrumentation({
            responseHook: (span, result) => {
                span.setAttribute('db.mongodb.response', JSON.stringify(result));
            },
            requestHook: (span, info) => {
                span.setAttribute('db.mongodb.query', JSON.stringify(info.query));
            },
        }),
    ],
    spanProcessor: new BatchSpanProcessor(traceExporter),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: 'http://localhost:4318/v1/metrics',
        }),
    }),
});

sdk.start();

console.log('Tracing initialized');

// Логирование создания трассировок
const tracer = trace.getTracer('default');

const span = tracer.startSpan('test-span');
span.setAttribute('test-attribute', 'test-value');
span.end();

console.log('Test span created');

process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.error('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
