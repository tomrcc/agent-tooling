import { readFile } from "fs/promises";
import { resolve, join } from "path";
import { parse as parseYaml } from "yaml";
import * as configGeneration from "./graders/config-generation.js";
import type { CheckResult } from "./graders/config-generation.js";

const graders: Record<
  string,
  {
    name: string;
    grade: (
      targetDir: string,
      expectations: Record<string, unknown>,
    ) => Promise<CheckResult[]>;
  }
> = {
  "config-generation": configGeneration,
};

function printUsage() {
  console.log("Usage: npx tsx run-grader.ts <task> <target-dir> [template]");
  console.log("");
  console.log("Arguments:");
  console.log("  task         Grader to run. Available:", Object.keys(graders).join(", "));
  console.log("  target-dir   Path to the directory to grade");
  console.log("  template     Template key in expectations.yaml (default: inferred from target-dir basename)");
  console.log("");
  console.log("Example:");
  console.log("  npx tsx run-grader.ts config-generation ../templates/astroplate");
}

function computeScore(results: CheckResult[]): number {
  const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return 0;
  const earned = results.reduce(
    (sum, r) => sum + (r.passed ? r.weight : 0),
    0,
  );
  return earned / totalWeight;
}

function printResults(results: CheckResult[], score: number) {
  const nameWidth = Math.max(...results.map((r) => r.name.length), 4);
  const detailWidth = Math.max(...results.map((r) => r.detail.length), 6);

  console.log("");
  console.log(
    "  " +
      "Check".padEnd(nameWidth + 2) +
      "Result".padEnd(8) +
      "Weight".padEnd(8) +
      "Detail",
  );
  console.log("  " + "-".repeat(nameWidth + 2 + 8 + 8 + detailWidth));

  for (const r of results) {
    const status = r.passed ? "PASS" : "FAIL";
    console.log(
      "  " +
        r.name.padEnd(nameWidth + 2) +
        status.padEnd(8) +
        String(r.weight).padEnd(8) +
        r.detail,
    );
  }

  const passed = results.filter((r) => r.passed).length;
  console.log("");
  console.log(
    `  Score: ${(score * 100).toFixed(1)}%  (${passed}/${results.length} checks passed)`,
  );
  console.log("");
}

async function main() {
  const [taskName, targetDirArg, templateArg] = process.argv.slice(2);

  if (!taskName || !targetDirArg) {
    printUsage();
    process.exit(1);
  }

  const grader = graders[taskName];
  if (!grader) {
    console.error(`Unknown task: ${taskName}`);
    console.error(`Available tasks: ${Object.keys(graders).join(", ")}`);
    process.exit(1);
  }

  const targetDir = resolve(targetDirArg);
  const templateKey =
    templateArg || targetDir.split("/").filter(Boolean).pop() || "default";

  const expectationsPath = join(
    import.meta.dirname,
    "tasks",
    taskName,
    "expectations.yaml",
  );

  let allExpectations: Record<string, Record<string, unknown>>;
  try {
    const raw = await readFile(expectationsPath, "utf-8");
    allExpectations = parseYaml(raw) as Record<
      string,
      Record<string, unknown>
    >;
  } catch {
    console.error(`Could not read expectations: ${expectationsPath}`);
    process.exit(1);
  }

  const expectations = allExpectations[templateKey];
  if (!expectations) {
    console.error(
      `No expectations found for template "${templateKey}" in ${expectationsPath}`,
    );
    console.error(
      `Available templates: ${Object.keys(allExpectations).join(", ")}`,
    );
    process.exit(1);
  }

  console.log(`Grading: ${grader.name}`);
  console.log(`Target:  ${targetDir}`);
  console.log(`Template: ${templateKey}`);

  const results = await grader.grade(targetDir, expectations);
  const score = computeScore(results);

  printResults(results, score);

  process.exit(score === 1 ? 0 : 1);
}

main();
