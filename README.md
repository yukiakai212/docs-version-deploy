# docs-version-deploy

> Deploy versioned static documentation to any GitHub repository.

A lightweight GitHub Action to deploy your built docs into versioned folders (`/v1`, `/v2`, ...), manage a `latest` alias, and automatically generate a `versions.json` file for building a version selector UI.

---

## Features

* Deploy docs to **any repository** (not just current repo)
* Versioned structure: `/v1`, `/v2`, `/beta`, ...
* Optional `latest` alias (auto overwrite)
* Auto-generate `versions.json` from existing folders
* Stateless design (filesystem = source of truth)
* Safe git push with retry (no force push)
* Built-in minimal UI (`index.html` + assets)

---

## Output Structure

After deployment:

```
/
  index.html
  versions.json

  /assets/
    main.js
    styles.css

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

      - name: Deploy
        uses: yukiakai212/docs-version-deploy@v1
        with:
          docs_dir: dist/docs
          target_repo: your-org/your-docs-repo
          target_dir: .
          branch: gh-pages
          version: ${{ github.ref_name }}
          is_latest: true
          write_static: true,
          commit_message: docs: release {version}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Inputs

| Name            | Required  | Description                      |
| --------------- | --------- | -------------------------------- |
| `docs_dir`      | ✅        | Path to built docs directory     |
| `target_repo`   | ✅        | Target repo (`owner/repo`)       |
| `target_dir`    | ❌        | Target dir (`.`)                 |
| `branch`        | ✅        | Target branch (e.g. `gh-pages`)  |
| `version`       | ✅        | Version name (free format)       |
| `is_latest`     | ❌        | Mark this version as `latest`    |
| `write_static`  | ❌        | Write static html page file      |
| `commit_message`| ❌        | Commit Message                   |
| `github_token`  | ✅        | GitHub token with push access    |

---

## How It Works

1. Clone target repository
2. Copy docs → `/version/`
3. Optionally update `/latest/`
4. Scan all folders → rebuild `versions.json`
5. Write UI files (`index.html`, assets)
6. Commit & push (with retry)

---

## versions.json

Generated automatically:

```json
{
  "latest": "v2",
  "versions": ["v2", "v1"]
}
```

* `versions` is derived from existing folders
* `latest` is updated only when `is_latest=true`

---

## Concurrency Notice

This action does **not enforce concurrency control**.

To avoid race conditions, you should configure:

```yaml
concurrency:
  group: deploy-docs
  cancel-in-progress: false
```

Without this, multiple deployments may overwrite each other.

---

## Permissions

If deploying to a different repository:

* `GITHUB_TOKEN` may not have access
* Use a Personal Access Token (PAT):

```yaml
github_token: ${{ secrets.PAT_TOKEN }}
```

---

## Version Strategy

Version format is fully user-defined:

```
v1
v1.2.0
beta
2026-03-23
```

The action does **not enforce versioning rules**.

---

## Advanced

### Disable `latest`

```yaml
is_latest: false
```

---

### Custom version source

```yaml
version: ${{ github.ref_name }}
```

---

## Monorepo Support

You can deploy multiple docs into the same repository by using `target_dir`.

Example:

```yaml
- uses: your-org/docs-version-deploy@v1
  with:
    docs_dir: dist/app1-docs
    target_repo: your-org/docs
    branch: gh-pages
    target_dir: app1
    version: v1
````

This will produce:

```
/app1/
  index.html
  versions.json
  /v1/
```

---

### Commit Message

You can customize the commit message:

```yaml
commit_message: "docs: release {version}"
````

Available variables:

* `{version}`
* `{target}`

```

---

## License

Yuki Akai - MIT
