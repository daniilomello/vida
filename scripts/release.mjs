#!/usr/bin/env node
/**
 * Release automation script.
 *
 * Commands:
 *   npm run release     -- v1.2.3   Full automated release (PR → merge → tag → sync develop)
 *   npm run release:pr  -- v1.2.3   Create release PR only (manual merge workflow)
 *   npm run release:tag -- v1.2.3   Tag main after PR is merged (manual merge workflow)
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , command, version] = process.argv;

if (!version || !/^v\d+\.\d+\.\d+$/.test(version)) {
  console.error("Error: version must be in the format v1.2.3\n");
  console.error("  npm run release     -- v1.2.3   # full automated flow");
  console.error("  npm run release:pr  -- v1.2.3   # create PR only");
  console.error("  npm run release:tag -- v1.2.3   # tag main only");
  process.exit(1);
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function capture(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function currentBranch() {
  return capture("git rev-parse --abbrev-ref HEAD");
}

function isDirty() {
  return capture("git status --porcelain") !== "";
}

function tagExists(tag) {
  return capture("git tag -l").split("\n").includes(tag);
}

function bumpVersions() {
  const semver = version.replace(/^v/, "");
  const root = import.meta.dirname ? resolve(import.meta.dirname, "..") : ".";
  const manifests = [
    resolve(root, "package.json"),
    resolve(root, "frontend/package.json"),
    resolve(root, "backend/package.json"),
  ];

  for (const file of manifests) {
    const pkg = JSON.parse(readFileSync(file, "utf8"));
    pkg.version = semver;
    writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  }

  run(`git add ${manifests.map((f) => `"${f}"`).join(" ")}`);
  run(`git commit -m "chore(release): bump version to ${semver}"`);
  console.log(`  Updated package.json versions to ${semver}`);
}

// ─── release:pr ──────────────────────────────────────────────────────────────

function createReleasePR() {
  if (currentBranch() !== "develop") {
    console.error("Error: must be on develop to open a release PR.");
    process.exit(1);
  }
  if (isDirty()) {
    console.error("Error: working tree has uncommitted changes.");
    process.exit(1);
  }

  console.log(`\nBumping package.json versions to ${version}…`);
  bumpVersions();

  console.log("\nPushing develop…");
  run("git push origin develop");

  console.log(`Creating release PR for ${version}…`);
  run(
    `gh pr create \
      --base main \
      --head develop \
      --title "release: ${version}" \
      --body "## Release ${version}\n\nMerges \`develop\` into \`main\` for the **${version}** production release.\n\nAfter this PR is merged, run \`npm run release:tag -- ${version}\` to tag \`main\` and trigger the automated GitHub Release."`,
  );
}

// ─── release:tag ─────────────────────────────────────────────────────────────

function tagRelease() {
  if (currentBranch() !== "main") {
    console.error("Error: must be on main to tag a release.");
    console.error("  git checkout main && git pull");
    process.exit(1);
  }
  if (tagExists(version)) {
    console.error(`Error: tag ${version} already exists.`);
    process.exit(1);
  }

  run("git pull origin main");

  console.log(`\nTagging ${version} on main…`);
  run(`git tag ${version}`);
  run(`git push origin ${version}`);

  console.log("\nSyncing develop with main…");
  run("git checkout develop");
  run("git merge origin/main");
  run("git push origin develop");

  console.log(`\nDone. GitHub Actions will create the ${version} release automatically.`);
}

// ─── release (full automated flow) ───────────────────────────────────────────

function fullRelease() {
  if (currentBranch() !== "develop") {
    console.error("Error: must be on develop to run a full release.");
    process.exit(1);
  }
  if (isDirty()) {
    console.error("Error: working tree has uncommitted changes.");
    process.exit(1);
  }
  if (tagExists(version)) {
    console.error(`Error: tag ${version} already exists.`);
    process.exit(1);
  }

  // 1. Bump versions + push develop
  console.log(`\n[1/5] Bumping package.json versions to ${version} and pushing develop…`);
  bumpVersions();
  run("git push origin develop");

  // 2. Open and immediately merge the release PR
  console.log(`\n[2/5] Creating and merging release PR for ${version}…`);
  run(
    `gh pr create \
      --base main \
      --head develop \
      --title "release: ${version}" \
      --body "## Release ${version}\n\nMerges \`develop\` into \`main\` for the **${version}** production release."`,
  );
  const prNumber = capture("gh pr view --json number -q .number");
  run(`gh pr merge ${prNumber} --merge`);

  // 3. Checkout main, pull, tag
  console.log("\n[3/5] Switching to main and pulling…");
  run("git checkout main");
  run("git pull origin main");

  console.log(`\n[4/5] Tagging ${version}…`);
  run(`git tag ${version}`);
  run(`git push origin ${version}`);

  // 4. Sync develop with main
  console.log("\n[5/5] Syncing develop with main…");
  run("git checkout develop");
  run("git merge origin/main");
  run("git push origin develop");

  console.log(`\n✓ Released ${version}.`);
  console.log(
    "  GitHub Actions will deploy to production and create the GitHub Release automatically.",
  );
}

// ─── dispatch ────────────────────────────────────────────────────────────────

if (command === "release") {
  fullRelease();
} else if (command === "pr") {
  createReleasePR();
} else if (command === "tag") {
  tagRelease();
} else {
  console.error(`Error: unknown command "${command}". Use "release", "pr", or "tag".`);
  process.exit(1);
}
