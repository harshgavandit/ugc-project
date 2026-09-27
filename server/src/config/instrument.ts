import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: "https://b84e1ed306fc85f7989579811be4c862@o4510997605646336.ingest.us.sentry.io/4510997611020288",
    sendDefaultPii: true,
});
