import { z } from 'zod';

interface StaticFilesOptions {
    targetDir: string;
    indexHtmlContent: string;
    indexFileName: string;
    assetsFolderName: string;
    assets: Record<string, string>;
}
interface DocsPublisherOptions {
    rootDir: string;
    latestFolderName: string;
}
interface VersionsScannerOptions {
    exclude: string[];
}
interface GitOptions {
    cwd: string;
    repo: string;
    branch: string;
    token: string;
}
interface ModeDetectorOptions {
    markers: string[];
}
interface ModeValidatorOptions {
    force: boolean;
}
interface ModeContext {
    targetDir: string;
    isRootTarget: boolean;
    hasRootDocs: boolean;
    hasScopedDocs: boolean;
}
type ModeRule = (ctx: ModeContext) => void;
interface DocsDeployerOptions {
    targetDir: string;
    sourceDir: string;
    version: string;
    isLatest: boolean;
    writeStaticFile: boolean;
}
interface DeployOptions {
    token: string;
    branch: string;
    version: string;
    workingDir: string;
    targetRepo: string;
    rootDocsDir: string;
    docsSrcDir: string;
    targetDir: string;
    commitMessage: string;
    isLatest: boolean;
    writeStaticFile: boolean;
}

declare class GitClient {
    private options;
    private FAILURE_THRESHOLD;
    constructor(options: GitOptions);
    private get repoUrl();
    clone(): Promise<void>;
    setup(): Promise<void>;
    checkout(): Promise<void>;
    commit(message: string): Promise<void>;
    add(pattern: string): Promise<void>;
    pushWithRetry(): Promise<void>;
    private branchExists;
}

declare class VersionsManager {
    private filePath;
    private data?;
    constructor(filePath: string);
    load(): void;
    update(folders: string[], latest?: string): void;
    save(): void;
    private read;
    private getNow;
}

declare class VersionsScanner {
    private rootDir;
    private options;
    private excludeSet;
    constructor(rootDir: string, options: VersionsScannerOptions);
    scan(): string[];
    private shouldSkip;
    private isDirectory;
    private sortVersions;
    private isValidVersion;
}

declare class StaticFilesWriter {
    private options;
    constructor(options: StaticFilesOptions);
    writeAll(): void;
    private writeIndex;
    private writeAssets;
    private writeFile;
    private ensureDir;
}

declare class DocsPublisher {
    private options;
    constructor(options: DocsPublisherOptions);
    publishVersion(sourceDir: string, version: string): void;
    updateLatest(sourceDir: string): void;
    private copyDir;
    private removeDir;
}

declare class ModeDetector {
    private workingDir;
    private options;
    constructor(workingDir: string, options: ModeDetectorOptions);
    isRootTarget(targetDir: string): boolean;
    hasRootDocs(): boolean;
    hasScopedDocs(): boolean;
    private isDocsRoot;
}

declare class ModeValidator {
    private detector;
    private options;
    private rules;
    constructor(detector: ModeDetector, options: ModeValidatorOptions);
    validate(targetDir: string): void;
    addRule(rule: ModeRule): void;
    private buildContext;
    private ruleRootToScoped;
    private ruleScopedToRoot;
}

declare class CommitMessageBuilder {
    private template;
    constructor(template: string);
    build(context: Record<string, string>): string;
}

declare class DocsDeployer {
    private git;
    private versions;
    private scanner;
    private publisher;
    private writer;
    private validator;
    private messageBuilder;
    private options;
    constructor(git: GitClient, versions: VersionsManager, scanner: VersionsScanner, publisher: DocsPublisher, writer: StaticFilesWriter, validator: ModeValidator, messageBuilder: CommitMessageBuilder, options: DocsDeployerOptions);
    run(): Promise<void>;
}

declare function createDocsDeployer(options: DeployOptions): Promise<DocsDeployer>;

declare const INDEX_HTML_CONTENT: string;
declare const MAIN_JS_CONTENT: string;
declare const STYLES_CSS_CONTENT: string;
declare const LATEST_FOLDER_NAME = "latest";
declare const ASSETS_FOLDER_NAME = "assets";
declare const VERSIONS_FILE_NAME = "versions.json";
declare const INDEX_HTML_FILE_NAME = "index.html";
declare const MAIN_JS_FILE_NAME = "scripts.js";
declare const CSS_FILE_NAME = "styles.css";
declare const DEFAULT_COMMIT_MESSAGE = "deploy({target}): release {version}";

declare function resolveSafeTargetDir(baseDir: string, targetDir: string): string;

declare const VersionSchema: z.ZodObject<{
    version: z.ZodString;
    title: z.ZodString;
    date: z.ZodString;
}, z.core.$strip>;
declare const DocsVersionsSchema: z.ZodObject<{
    latest: z.ZodString;
    versions: z.ZodRecord<z.ZodString, z.ZodObject<{
        version: z.ZodString;
        title: z.ZodString;
        date: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;

declare function validateVersion(version: string): string;
declare function sleep(ms: number): Promise<unknown>;

export { ASSETS_FOLDER_NAME, CSS_FILE_NAME, CommitMessageBuilder, DEFAULT_COMMIT_MESSAGE, DocsDeployer, DocsPublisher, DocsVersionsSchema, GitClient, INDEX_HTML_CONTENT, INDEX_HTML_FILE_NAME, LATEST_FOLDER_NAME, MAIN_JS_CONTENT, MAIN_JS_FILE_NAME, ModeDetector, ModeValidator, STYLES_CSS_CONTENT, StaticFilesWriter, VERSIONS_FILE_NAME, VersionSchema, VersionsManager, VersionsScanner, createDocsDeployer, resolveSafeTargetDir, sleep, validateVersion };
