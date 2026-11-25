# docs-version-deploy

GitHub Action for publishing static documentation into Semantic Versioned directories in a GitHub repository.

The action maintains a version manifest, can publish shared static content for a documentation landing page, and can retain a limited number of previous versions per retention scope.

> [!IMPORTANT]
> v6 is a breaking release. It is not backward compatible with v2 manifests
> or arbitrary version directory names. Read
> [Migrating from v2](./CHANGELOG.md#migrating-from-v2) before upgrading to
> `yukiakai212/docs-version-deploy@v6`.

## Quick start

```yaml
name: Deploy documentation

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest

    concurrency:
      group: docs-version-deploy
      cancel-in-progress: false

    steps:
      - uses: actions/checkout@v7

      - name: Build documentation
        run: npm run build:docs

      - name: Deploy documentation
        uses: yukiakai212/docs-version-deploy@v6
        with:
          source-directory: dist/docs
          target-repository: your-org/your-docs
          target-directory: .
          branch: gh-pages
          token: ${{ secrets.DOCS_DEPLOY_TOKEN }}
          version: 2.4.0
          retention-scope: stable
          previous-versions-to-keep: '2'
          mark-as-latest: 'true'
```

target-repository accepts an owner/repository reference or a GitHub.com repository URL.

## Deployment layout

For target-directory: docs, publishing version 2.4.0 produces this layout:

```text
docs/
  docs-version-deploy.json
  index.html
  latest/
    index.html
  assets/
    styles.css
    scripts/
      ...
  2.3.0/
    ...
  2.4.0/
    ...
```

The action copies the contents of source-directory into target-directory/version.

docs-version-deploy.json, index.html, latest/, and assets/ belong directly to the deployment directory; they do not belong to an individual version folder.

latest/ is a redirect alias, not a documentation version directory. It reads latestVersion from the manifest, redirects to that version when present, and redirects to the root index when latestVersion is null.

## Inputs

| Input                     | Required    | Default                              | Description                                                                                  |
| ------------------------- | ----------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| source-directory          | Yes         | -                                    | Built documentation directory, relative to the GitHub workspace.                             |
| target-repository         | Yes         | -                                    | GitHub.com repository reference or URL that receives the deployment.                         |
| target-directory          | No          | .                                    | Directory inside the target repository that contains this documentation deployment.          |
| branch                    | Yes         | -                                    | Target repository branch to prepare and push.                                                |
| token                     | Yes         | -                                    | Token with write access to the target repository.                                            |
| commit-message            | No          | docs: deploy versioned documentation | Commit message used when the target repository changes.                                      |
| version                   | Yes         | -                                    | Strict Semantic Version to publish, for example 2.4.0 or 2.4.0-rc.1.                         |
| retention-scope           | No          | -                                    | Retention partition for the publication. Omit it to disable automatic retention.             |
| previous-versions-to-keep | Conditional | -                                    | Number of prior versions to retain in retention-scope. Required when retention-scope is set. |
| mark-as-latest            | No          | false                                | Mark the published version as the manifest's latest version.                                 |
| deploy-static-content     | No          | true                                 | Replace the shared index.html, latest/, and assets/ content in the deployment directory.     |

## Manifest

The action stores deployment metadata in target-directory/docs-version-deploy.json.

```json
{
  "formatVersion": 2,
  "latestVersion": "2.4.0",
  "versions": [
    {
      "version": "2.4.0",
      "retentionScope": "stable",
      "publishedAt": 1770000000000
    }
  ]
}
```

Entries are ordered by descending Semantic Version. The action reconciles the manifest with existing Semantic Version directory names before publishing: folders missing from the manifest are imported, while manifest entries whose folders no longer exist are removed.

## Retention

Retention is opt-in and is partitioned by retention-scope.

```yaml
with:
  version: 2.4.0
  retention-scope: stable
  previous-versions-to-keep: '2'
```

This retains the two highest previous Semantic Versions in the stable scope beside the version being published. Each scope is independent, so a project can use scopes such as stable-v1, stable-v2, beta, or next when it needs separate retention policies.

When retention-scope is omitted, the publication receives null metadata for that field and is not managed by automatic retention.

## Shared static content

By default, the action replaces these paths in target-directory from its bundled distribution:

- index.html
- latest/
- assets/

These are action-owned paths. latest/ is the redirect alias for the manifest's latestVersion; assets/ contains the landing-page stylesheet and browser bundles.

Before copying, the action removes each owned destination. In particular, it replaces the complete latest/ and assets/ directories, so files removed from a later action release cannot remain in the target repository.

Set deploy-static-content: "false" when the target repository owns those paths itself. In that mode, the calling repository is responsible for maintaining any landing page, latest redirect, and browser assets it needs:

```yaml
with:
  deploy-static-content: 'false'
```

## Safety rules

Every deployment root owns exactly one manifest. The action rejects a target directory when another entry named docs-version-deploy.json exists above or below it. This prevents nested versioned-documentation deployments from corrupting each other's metadata.

Version directory names are strict Semantic Versions. Use 2.4.0, not arbitrary labels such as beta or v2.

## Authentication

Provide a token that can push to target-repository.

- For the current repository, github.token can be sufficient when the job grants it repository write access.
- For a different repository, especially a private one, use a fine-grained PAT or GitHub App token that has write access to that target repository.

Do not print the token or the authenticated Git remote in workflow logs.

## Concurrency

The action does not create a concurrency group itself. Configure one in the calling workflow so deployments to the same target branch are serialized:

```yaml
concurrency:
  group: docs-version-deploy
  cancel-in-progress: false
```

Use a group specific to the target repository and branch when one workflow deploys to multiple documentation targets.

## How deployment runs

1. Prepare the target repository and branch.
2. Validate that the deployment directory is not nested with another manifest.
3. Optionally replace shared static content.
4. Synchronize manifest metadata with Semantic Version directories.
5. Apply retention, when configured.
6. Publish the source documentation into the requested version directory.
7. Persist the manifest.
8. Commit and push only when staged changes exist.

## License

MIT (c) Yuki Akai
