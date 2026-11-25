# Changelog

All notable changes to this project are documented in this file.

## 6.0.0

### Breaking changes

- v6 replaces the v2 manifest format. It cannot read, reuse, or automatically
  migrate a v2 `docs-version-deploy.json` file.
- Version directory names must now be strict Semantic Versions, such as
  `2.4.0` or `2.4.0-rc.1`. Previously supported arbitrary names, including
  `v1`, `beta`, `nightly`, and date-based names, are not managed by v6.
- The manifest changed from a version-keyed object with `title`, `date`,
  `group`, and `cleanupStrategy` fields to a descending-SemVer array of
  entries with `version`, `retentionScope`, and `publishedAt` fields.
- `group` and `cleanupStrategy` were removed. v6 retention uses
  `retention-scope` and `previous-versions-to-keep`; it is a different policy
  model and is not a direct replacement for `group-replace`.
- Action inputs use kebab-case. `commit-message` is now literal: the v2
  `{version}` and `{target}` placeholders are no longer expanded.
- `deploy-static-content` replaces `writeStaticFiles`. When enabled, v6 owns
  and replaces the deployment root's `index.html`, `latest/`, and `assets/`.

### Input migration

| v2 input                   | v6 input                                       | Notes                                         |
| -------------------------- | ---------------------------------------------- | --------------------------------------------- |
| `docsDir`                  | `source-directory`                             | Same purpose.                                 |
| `targetRepository`         | `target-repository`                            | Same purpose.                                 |
| `targetDir`                | `target-directory`                             | Same purpose.                                 |
| `commitMessage`            | `commit-message`                               | Use a complete literal message.               |
| `markAsLatest`             | `mark-as-latest`                               | Same purpose.                                 |
| `writeStaticFiles`         | `deploy-static-content`                        | See static-content ownership above.           |
| `group`, `cleanupStrategy` | `retention-scope`, `previous-versions-to-keep` | Requires a policy decision; semantics differ. |

`branch`, `token`, and `version` keep their names, but `version` now requires
strict Semantic Version syntax.

### Migrating from v2

1. Update the workflow to use `yukiakai212/docs-version-deploy@v6` and rename
   its inputs as shown above.
2. Rename each existing version directory that v6 should manage to a strict
   Semantic Version. Directories with arbitrary v2 names can remain on disk,
   but v6 will ignore them.
3. Delete the v2 `docs-version-deploy.json` file from the deployment
   directory.
4. Deploy with v6. It scans the compatible version directories and creates a
   fresh v6 manifest automatically. Imported directories receive
   `retentionScope: null` and `publishedAt: null`; `latestVersion` remains
   `null` unless the deployment sets `mark-as-latest: "true"`.
5. Configure a new retention policy explicitly, if needed.

If the previous latest version, dates, or cleanup metadata must be preserved,
create a valid v6 manifest manually instead of deleting it. An LLM can help
transform the v2 data, but review the resulting manifest before deploying it.
