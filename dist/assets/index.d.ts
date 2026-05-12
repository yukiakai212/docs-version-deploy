declare enum CleanupStrategy {
    NONE = "none",
    GROUP_REPLACE = "group-replace"
}
interface Version {
    version: string;
    title: string;
    date: string;
    group: string | null;
    cleanupStrategy: CleanupStrategy;
}
type VersionMap = Record<string, Version>;
interface DocsVersions {
    latest: string | null;
    versions: VersionMap;
}

declare function fetchDocsVersions(baseDir: string): Promise<DocsVersions>;

declare function bootstrapDocsIndexPage(): Promise<void>;

declare function bootstrapLatestVersionPage(): Promise<void>;

declare function createBadge(text: string, className?: string): HTMLElement;

declare function createEmptyState(): HTMLElement;

declare function createGroupOption(label: string, value: string): HTMLOptionElement;

declare function createVersionItem(version: Version, latest: string | null): HTMLAnchorElement;

declare function renderGroupSelect(select: HTMLSelectElement, groups: string[]): void;

declare function renderVersionList(container: HTMLElement, versions: Version[], latest: string | null): void;

declare function collectGroups(versions: Version[]): string[];

declare function filterVersions(versions: Version[], group: string): Version[];

declare function resolveAutoRedirectVersion(versions: Version[]): Version | null;

declare function sortVersions(versions: Version[], latest: string | null): Version[];

export { bootstrapDocsIndexPage, bootstrapLatestVersionPage, collectGroups, createBadge, createEmptyState, createGroupOption, createVersionItem, fetchDocsVersions, filterVersions, renderGroupSelect, renderVersionList, resolveAutoRedirectVersion, sortVersions };
