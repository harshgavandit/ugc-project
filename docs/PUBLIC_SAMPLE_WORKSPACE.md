# Public sample workspace

The frontend serves `/demo` independently of Clerk and API configuration. The route is public and read-only: controls only select bundled sample states in React memory. It does not upload files, call generation providers, fetch private projects, consume credits, publish, or persist data. Reloading or resetting returns to the initial walkthrough.

## Walkthrough

1. Open `/demo` and select **Use sample references**.
2. Select **View saved sample** to inspect the existing image asset in the same `GenerationPreview` component used by the authenticated result page.
3. Select **Explore provider error**, then **Retry sample scenario**. The simulated rate-limit message comes from the existing server `toGenerationErrorResponse` behavior. Retry reveals the bundled saved example; it does not retry a real request.

The reference cards use the existing `UploadZone` component with explicit sample previews. Real file inputs and generation submissions remain available only through the existing authenticated generator.

## Public sample record and assets

`client/src/features/demo/sampleProject.ts` defines fictional record `sample-travel-001`, a travel campaign brief with a fixed illustrative date of January 1, 2026. It contains no real user, account, credit, database or provider identifiers.

All three assets were already committed in this repository:

- `client/src/assets/product7.png`: sample product reference (blue suitcase).
- `client/src/assets/model1.png`: sample model reference.
- `client/src/assets/generated1.png`: existing gallery output example.

Their grouping illustrates the UI; no verified generation request or exact reference-to-output provenance is asserted. These are public repository examples, not a grant of commercial rights.

## Routing and deployment

The existing frontend host is `https://ugc-project-harsh.vercel.app`; after deploying this change, the intended URL is `https://ugc-project-harsh.vercel.app/demo`. This documentation does not assert that deployment has occurred.

For a Vercel project rooted in `client`, `client/vercel.json` serves SPA paths, including direct `/demo` visits and refreshes, from `index.html`. The sample entry runs before the existing Clerk-key requirement and does not alter authentication or API authorization for the rest of the application.

Local preview, without any `.env` file:

```sh
npm --prefix client ci
npm --prefix client run build
npm --prefix client run preview -- --host 127.0.0.1 --port 5193
```

Visit `http://127.0.0.1:5193/demo`. Live application routes continue to require their documented configuration.
