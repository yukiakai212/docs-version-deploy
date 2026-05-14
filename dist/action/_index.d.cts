import { GitClient } from '@yukiakai/actions-git';
import { z } from 'zod';

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
interface VersionPruneResult {
    kept: string[];
    removed: string[];
}
interface ReconcileResult {
    added: string[];
    removed: string[];
    existing: string[];
}
interface CreateVersionOptions {
    version: string;
    group: string | null;
    cleanupStrategy: CleanupStrategy;
}
interface StaticFile {
    content: string;
    fileName: string;
}
interface StaticFolder {
    folderName: string;
    files: StaticFile[];
    folders: StaticFolder[];
}
interface StaticOutputOptions {
    index: StaticFile;
    latest: StaticFolder;
    assets: StaticFolder;
}
interface DeployContextValidatorOptions {
    reservedVersionNames: string[];
    versionPattern: RegExp;
}
interface DocsPublisherOptions {
    targetDir: string;
}
interface DocsDeploySessionFactoryOptions {
    versionsFileName: string;
    scannerExclude: string[];
}
interface VersionsScannerOptions {
    exclude: string[];
}
interface DocsStructureDetectorOptions {
    markerFile: string;
}
interface DocsStructureValidatorOptions {
    force: boolean;
}
interface DocsDetection {
    ancestorRoot: string | null;
    selfRoot: boolean;
    hasDescendantRoot: boolean;
}
interface DocsStructureContext extends DocsDetection {
    targetDir: string;
}
type DocsStructureRule = (ctx: DocsStructureContext) => void;
interface DeployContext {
    relativeDeployDir: string;
    docsSourceDir: string;
    docsDestDir: string;
    version: string;
    markAsLatest: boolean;
    writeStaticFiles: boolean;
    group: string | null;
    cleanupStrategy: CleanupStrategy;
}
interface DeployOptions {
    token: string;
    branch: string;
    workspaceDir: string;
    targetRepository: string;
    commitMessage: string;
}
interface RunOptions {
    token: string;
    branch: string;
    version: string;
    targetRepository: string;
    docsDir: string;
    targetDir: string;
    commitMessage: string;
    markAsLatest: boolean;
    writeStaticFiles: boolean;
    group: string | null;
    cleanupStrategy: CleanupStrategy;
}

declare class VersionsReconciler {
    reconcile(scanned: string[], existing: VersionMap): ReconcileResult;
}

declare class VersionPruner {
    prune(versions: VersionMap, current: Version): VersionPruneResult;
}

declare class DocsVersionsStore {
    private data;
    constructor(data: DocsVersions);
    hydrate(data: DocsVersions): void;
    snapshot(): DocsVersions;
    getAll(): VersionMap;
    get(version: string): Version | undefined;
    getLatest(): string | null;
    set(version: string, v: Version): void;
    remove(version: string): void;
    removeMany(versions: string[]): void;
    setLatest(version: string | null): void;
    has(version: string): boolean;
}

declare class DocsPublisher {
    private options;
    constructor(options: DocsPublisherOptions);
    publishVersion(sourceDir: string, version: string): void;
    removeMany(versions: string[]): void;
    private resolveVersionDir;
    private copyDir;
    private removeDir;
}

declare class VersionsScanner {
    private targetDir;
    private options;
    private excludeSet;
    constructor(targetDir: string, options: VersionsScannerOptions);
    scan(): string[];
    private shouldSkip;
    private isDirectory;
    private sortVersions;
    private isValidVersion;
}

declare class VersionFactory {
    create(opts: CreateVersionOptions): Version;
    createDiscovered(version: string): Version;
    private getNow;
}

declare class DocsPipeline {
    private readonly reconciler;
    private readonly factory;
    private readonly pruner;
    private readonly store;
    private readonly scanner;
    private readonly publisher;
    constructor(reconciler: VersionsReconciler, factory: VersionFactory, pruner: VersionPruner, store: DocsVersionsStore, scanner: VersionsScanner, publisher: DocsPublisher);
    execute(ctx: DeployContext): void;
}

declare class DocsVersionsRepository {
    private filePath;
    constructor(filePath: string);
    load(): DocsVersions;
    save(data: DocsVersions): void;
    private createEmpty;
}

declare class DocsVersionsPersister {
    private readonly repo;
    private readonly store;
    constructor(repo: DocsVersionsRepository, store: DocsVersionsStore);
    flush(): void;
}

interface DocsDeploySession {
    pipeline: DocsPipeline;
    versionsPersister: DocsVersionsPersister;
}
declare class DocsDeploySessionFactory {
    private readonly reconciler;
    private readonly factory;
    private readonly pruner;
    private options;
    constructor(reconciler: VersionsReconciler, factory: VersionFactory, pruner: VersionPruner, options: DocsDeploySessionFactoryOptions);
    create(ctx: DeployContext): Promise<DocsDeploySession>;
}

declare class DeployContextValidator {
    private options;
    constructor(options: DeployContextValidatorOptions);
    validate(ctx: DeployContext): void;
    private validateVersion;
}

declare class DocsStructureDetector {
    private options;
    constructor(options: DocsStructureDetectorOptions);
    detect(targetDir: string): DocsDetection;
    findDocsRootUp(start: string): string | null;
    hasDocsRootDown(dir: string): boolean;
    private isDocsRoot;
}

declare class DocsStructureValidator {
    private detector;
    private options;
    private rules;
    constructor(detector: DocsStructureDetector, options: DocsStructureValidatorOptions);
    validate(targetDir: string): void;
    addRule(rule: DocsStructureRule): void;
    private buildContext;
    private ruleNoNestedDeploy;
}

declare class DeployPreflightValidator {
    private contextValidator;
    private structureValidator;
    constructor(contextValidator: DeployContextValidator, structureValidator: DocsStructureValidator);
    validate(ctx: DeployContext): Promise<void>;
}

declare class ManagedFolderReconciler {
    reconcileFolder(targetDir: string, folder: StaticFolder): void;
    /***
          Any entry not explicitly managed
          by the static folder definition
          will be removed.
     ***/
    private reconcileFolderAt;
}

declare class StaticFilesWriter {
    constructor();
    writeFolder(targetDir: string, folder: StaticFolder): void;
    writeFile(targetDir: string, file: StaticFile): void;
    private ensureParentDir;
    private ensureDir;
}

declare class ManagedFolderPublisher {
    private reconciler;
    private writer;
    private options;
    constructor(reconciler: ManagedFolderReconciler, writer: StaticFilesWriter, options: StaticOutputOptions);
    publishAll(targetDir: string): void;
    private publishIndex;
    private publishManagedFolder;
}

declare class CommitMessageBuilder {
    private template;
    constructor(template: string);
    build(context: Record<string, string>): string;
}

declare class DocsDeployer {
    private git;
    private factory;
    private validator;
    private staticPublisher;
    private messageBuilder;
    constructor(git: GitClient, factory: DocsDeploySessionFactory, validator: DeployPreflightValidator, staticPublisher: ManagedFolderPublisher, messageBuilder: CommitMessageBuilder);
    run(ctx: DeployContext): Promise<void>;
}

declare function createDocsDeployer(options: DeployOptions): Promise<DocsDeployer>;

declare const INDEX_HTML_CONTENT: string;
declare const LATEST_HTML_CONTENT: string;
declare const MAIN_JS_CONTENT: string;
declare const STYLES_CSS_CONTENT: string;
declare const LATEST_FOLDER_NAME = "latest";
declare const ASSETS_FOLDER_NAME = "assets";
declare const DOCS_DEPLOY_METADATA_FILE_NAME = ".docs-version-deploy.json";
declare const INDEX_HTML_FILE_NAME = "index.html";
declare const LATEST_HTML_FILE_NAME = "index.html";
declare const MAIN_JS_FILE_NAME = "scripts.js";
declare const CSS_FILE_NAME = "styles.css";
declare const GIT_FOLDER_NAME = ".git";
declare const DEFAULT_COMMIT_MESSAGE = "deploy({target}): release {version}";
declare const RESERVED_VERSION_NAMES: string[];
declare const VERSION_PATTERN: RegExp;

declare function runDocsDeploy(options: RunOptions): Promise<void>;

declare const VersionSchema: z.ZodObject<{
    version: z.ZodString;
    title: z.ZodString;
    date: z.ZodString;
    group: z.ZodPipe<z.ZodString, z.ZodPipe<z.ZodString, z.ZodTransform<string | null, string>>>;
    cleanupStrategy: z.ZodEnum<typeof CleanupStrategy>;
}, z.core.$strip>;
declare const VersionMapSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    version: z.ZodString;
    title: z.ZodString;
    date: z.ZodString;
    group: z.ZodPipe<z.ZodString, z.ZodPipe<z.ZodString, z.ZodTransform<string | null, string>>>;
    cleanupStrategy: z.ZodEnum<typeof CleanupStrategy>;
}, z.core.$strip>>;
declare const DocsVersionsSchema: z.ZodObject<{
    latest: z.ZodPipe<z.ZodString, z.ZodPipe<z.ZodString, z.ZodTransform<string | null, string>>>;
    versions: z.ZodRecord<z.ZodString, z.ZodObject<{
        version: z.ZodString;
        title: z.ZodString;
        date: z.ZodString;
        group: z.ZodPipe<z.ZodString, z.ZodPipe<z.ZodString, z.ZodTransform<string | null, string>>>;
        cleanupStrategy: z.ZodEnum<typeof CleanupStrategy>;
    }, z.core.$strip>>;
}, z.core.$strip>;

declare const RunOptionsSchema: z.ZodObject<{
    token: z.ZodString;
    branch: z.ZodString;
    version: z.ZodString;
    targetRepository: z.ZodString;
    docsDir: z.ZodString;
    targetDir: z.ZodString;
    commitMessage: z.ZodString;
    markAsLatest: z.ZodPipe<z.ZodString, z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    writeStaticFiles: z.ZodPipe<z.ZodString, z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    group: z.ZodPipe<z.ZodString, z.ZodPipe<z.ZodString, z.ZodTransform<string | null, string>>>;
    cleanupStrategy: z.ZodEnum<typeof CleanupStrategy>;
}, z.core.$strip>;

declare const CleanupStrategySchema: z.ZodEnum<typeof CleanupStrategy>;

declare function sleep(ms: number): Promise<unknown>;

export { ASSETS_FOLDER_NAME, CSS_FILE_NAME, CleanupStrategySchema, CommitMessageBuilder, DEFAULT_COMMIT_MESSAGE, DOCS_DEPLOY_METADATA_FILE_NAME, DeployContextValidator, DeployPreflightValidator, type DocsDeploySession, DocsDeploySessionFactory, DocsDeployer, DocsPipeline, DocsPublisher, DocsStructureDetector, DocsStructureValidator, DocsVersionsPersister, DocsVersionsRepository, DocsVersionsSchema, DocsVersionsStore, GIT_FOLDER_NAME, INDEX_HTML_CONTENT, INDEX_HTML_FILE_NAME, LATEST_FOLDER_NAME, LATEST_HTML_CONTENT, LATEST_HTML_FILE_NAME, MAIN_JS_CONTENT, MAIN_JS_FILE_NAME, ManagedFolderPublisher, ManagedFolderReconciler, RESERVED_VERSION_NAMES, RunOptionsSchema, STYLES_CSS_CONTENT, StaticFilesWriter, VERSION_PATTERN, VersionFactory, VersionMapSchema, VersionPruner, VersionSchema, VersionsReconciler, VersionsScanner, createDocsDeployer, runDocsDeploy, sleep };
