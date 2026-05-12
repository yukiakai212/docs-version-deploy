# docs-version-deploy

> Deploy versioned static documentation to any GitHub repository.

A lightweight GitHub Action for deploying static documentation into versioned folders (`/v1`, `/v2`, `/beta`, ...), managing a `latest` alias, and generating a `.docs-version-deploy.json` file for building custom version selectors or landing pages.

---

## Features

- Deploy docs to **any GitHub repository**
- Versioned structure (`/v1`, `/v2`, `/beta`, ...)
- Optional `latest` alias
- Automatic deployment manifest generation
- Stateless design (filesystem = source of truth)
- Safe git workflow (no force push)
- Scoped deployments via `targetDir`
- Built-in static runtime (`index.html`, assets, latest redirect)
- Nested deployment protection
- Runtime-safe structure reconciliation

---

## Output Structure

Example deployment:

```text
/
  index.html
  .docs-version-deploy.json

  /assets/
    main.js
    styles.css

  /v1/
  /v2/
  /latest/
```

Scoped deployment example (`targetDir=docs`):

```text
/docs/
  index.html
  .docs-version-deploy.json

  /assets/
  /v1/
  /v2/
  /latest/
```

---

## Usage

```yaml
name: Deploy Docs

on:
  push:
    tags:
      - "v*"

jobs:
  deploy:
    runs-on: ubuntu-latest

    concurrency:
      group: deploy-docs
      cancel-in-progress: false

    steps:
      - uses: actions/checkout@v4

      - name: Build docs
        run: npm run build-docs

      - name: Deploy docs
        uses: yukiakai212/docs-version-deploy@v1
        with:
          docsDir: dist/docs
          targetRepository: your-org/your-docs-repo
          targetDir: .
          branch: gh-pages
          version: ${{ github.ref_name }}
          markAsLatest: true
          writeStaticFiles: true
          commitMessage: docs: release {version}
          token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Inputs

| Name | Required | Description |
|---|---|---|
| `docsDir` | ✅ | Path to built docs directory |
| `targetRepository` | ✅ | Target repository (`owner/repo`) |
| `branch` | ✅ | Deployment branch |
| `version` | ✅ | Version name |
| `targetDir` | ❌ | Target directory inside deployment repo (`.` by default) |
| `markAsLatest` | ❌ | Mark deployed version as latest |
| `writeStaticFiles` | ❌ | Write shared static runtime files |
| `commitMessage` | ❌ | Custom commit message |
| `group` | ❌ | Optional version group |
| `cleanupStrategy` | ❌ | Cleanup strategy used before publishing |
| `token` | ✅ | GitHub token with push access |

---

## How It Works

1. Clone the target repository
2. Validate deployment structure
3. Copy docs into `/version/`
4. Optionally update `/latest/`
5. Rebuild deployment manifest
6. Reconcile static runtime files
7. Commit and push changes

---

## Scoped Deployments

You can deploy multiple independent documentation projects into the same repository using `targetDir`.

Example:

```yaml
- uses: yukiakai212/docs-version-deploy@v1
  with:
    docsDir: dist/app1-docs
    targetRepository: your-org/docs
    branch: gh-pages
    targetDir: app1
    version: v1
```

Result:

```text
/app1/
  index.html
  .docs-version-deploy.json

  /assets/
  /v1/
  /latest/
```

---

## Nested Deployment Protection

The action prevents invalid nested deployments such as:

```text
/v1/v2
/docs/v1/v2
```

This avoids corrupting the documentation structure.

---

## Runtime Pages

The generated runtime includes:

### Versions Page

Displays all available versions from `.docs-version-deploy.json`.

### Latest Page

Automatically redirects to the latest version.

If no latest version exists, it falls back to the versions page.

---

## Concurrency

This action does **not** enforce concurrency automatically.

Recommended:

```yaml
concurrency:
  group: deploy-docs
  cancel-in-progress: false
```

Without concurrency protection, parallel deployments may overwrite each other.

---

## Permissions

For cross-repository deployment:

```yaml
token: ${{ secrets.PAT_TOKEN }}
```

`GITHUB_TOKEN` may not have permission to push to external repositories.

---

## Version Format

Version names are fully user-defined:

```text
v1
v1.2.0
beta
nightly
2026-05-13
```

Reserved names such as `latest` may not be used as versions.

---

## Commit Message Variables

Example:

```yaml
commitMessage: docs: release {version}
```

Available variables:

- `{version}`
- `{target}`

---

## Disable Latest Alias

```yaml
markAsLatest: false
```

---

## Disable Static Runtime Files

```yaml
writeStaticFiles: false
```

Useful if you want to provide your own UI/runtime.

---

## License

MIT © Yuki Akai