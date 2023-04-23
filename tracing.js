const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
//Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
//Exporter
module.exports = (serviceName) => {
   const exporter = new ConsoleSpanExporter();
   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });
   provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
   provider.register();
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });
   return trace.getTracer(serviceName);
};

const opentelemetry = require("@opentelemetry/exporter-jaeger");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-proto");
const {
  OTLPMetricExporter
} = require("@opentelemetry/exporter-metrics-otlp-proto");

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      headers: {}, // an optional object containing custom headers to be sent with each request
      concurrencyLimit: 1, // an optional limit on pending requests
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();