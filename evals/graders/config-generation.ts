import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";

export interface CheckResult {
  name: string;
  passed: boolean;
  weight: number;
  detail: string;
}

export interface Expectations {
  ssg: string;
  collections: string[];
  build_command_contains?: string;
  output_path?: string;
}

export const name = "config-generation";

export async function grade(
  targetDir: string,
  expectations: Expectations,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const configPath = join(targetDir, "cloudcannon.config.yml");
  const settingsPath = join(
    targetDir,
    ".cloudcannon",
    "initial-site-settings.json",
  );

  const configExists = existsSync(configPath);
  results.push({
    name: "cloudcannon.config.yml exists",
    passed: configExists,
    weight: 1,
    detail: configExists ? configPath : "File not found",
  });

  const settingsExists = existsSync(settingsPath);
  results.push({
    name: "initial-site-settings.json exists",
    passed: settingsExists,
    weight: 1,
    detail: settingsExists ? settingsPath : "File not found",
  });

  let config: Record<string, unknown> | null = null;
  if (configExists) {
    try {
      const raw = await readFile(configPath, "utf-8");
      config = parseYaml(raw) as Record<string, unknown>;
      results.push({
        name: "cloudcannon.config.yml is valid YAML",
        passed: true,
        weight: 1,
        detail: "Parsed successfully",
      });
    } catch (err) {
      results.push({
        name: "cloudcannon.config.yml is valid YAML",
        passed: false,
        weight: 1,
        detail: String(err),
      });
    }
  }

  let settings: Record<string, unknown> | null = null;
  if (settingsExists) {
    try {
      const raw = await readFile(settingsPath, "utf-8");
      settings = JSON.parse(raw) as Record<string, unknown>;
      results.push({
        name: "initial-site-settings.json is valid JSON",
        passed: true,
        weight: 1,
        detail: "Parsed successfully",
      });
    } catch (err) {
      results.push({
        name: "initial-site-settings.json is valid JSON",
        passed: false,
        weight: 1,
        detail: String(err),
      });
    }
  }

  if (config) {
    const collectionsConfig = config.collections_config as
      | Record<string, unknown>
      | undefined;
    const hasCollections =
      collectionsConfig != null &&
      typeof collectionsConfig === "object" &&
      Object.keys(collectionsConfig).length > 0;
    results.push({
      name: "Has collections_config with entries",
      passed: hasCollections,
      weight: 1,
      detail: hasCollections
        ? `Found: ${Object.keys(collectionsConfig!).join(", ")}`
        : "collections_config missing or empty",
    });

    if (hasCollections && expectations.collections.length > 0) {
      const actualCollections = Object.keys(collectionsConfig!);
      const missing = expectations.collections.filter(
        (c) => !actualCollections.includes(c),
      );
      const allPresent = missing.length === 0;
      results.push({
        name: "Expected collections present",
        passed: allPresent,
        weight: 1,
        detail: allPresent
          ? `All expected collections found: ${expectations.collections.join(", ")}`
          : `Missing: ${missing.join(", ")}`,
      });
    }
  }

  if (settings) {
    const ssg = (settings as Record<string, unknown>).ssg;
    const correctSsg =
      typeof ssg === "string" &&
      ssg.toLowerCase() === expectations.ssg.toLowerCase();
    results.push({
      name: "Correct SSG detected",
      passed: correctSsg,
      weight: 1,
      detail: correctSsg
        ? `SSG: ${ssg}`
        : `Expected "${expectations.ssg}", got "${ssg ?? "undefined"}"`,
    });

    const build = (settings as Record<string, unknown>).build as
      | Record<string, unknown>
      | undefined;
    const buildCommand = build?.build_command;
    const hasBuildCommand =
      typeof buildCommand === "string" && buildCommand.length > 0;
    results.push({
      name: "Build command present",
      passed: hasBuildCommand,
      weight: 1,
      detail: hasBuildCommand
        ? `build_command: ${buildCommand}`
        : "build.build_command missing or empty",
    });

    if (
      hasBuildCommand &&
      expectations.build_command_contains
    ) {
      const contains = (buildCommand as string).includes(
        expectations.build_command_contains,
      );
      results.push({
        name: "Build command contains expected string",
        passed: contains,
        weight: 0.5,
        detail: contains
          ? `Contains "${expectations.build_command_contains}"`
          : `"${buildCommand}" does not contain "${expectations.build_command_contains}"`,
      });
    }

    if (expectations.output_path) {
      const outputPath = build?.output_path;
      const correctOutput = outputPath === expectations.output_path;
      results.push({
        name: "Correct output path",
        passed: correctOutput,
        weight: 0.5,
        detail: correctOutput
          ? `output_path: ${outputPath}`
          : `Expected "${expectations.output_path}", got "${outputPath ?? "undefined"}"`,
      });
    }
  }

  return results;
}
