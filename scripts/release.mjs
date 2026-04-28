#!/usr/bin/env node
/**
 * Release automation script.
 *
 * Commands:
 *   npm run release:pr  -- v1.2.3   Create a release PR from develop → main
 *   npm run release:tag -- v1.2.3   Tag main after the PR is merged (triggers GitHub Release)
 */

import { execSync } from "node:child_process";

const [, , command, version] = process.argv;

if (!version || !/^v\d+\.\d+\.\d+$/.test(version)) {
  console.error("Error: version must be in the format v1.2.3");
  console.error("");
  console.error("  npm run release:pr  -- v1.2.3");
  console.error("  npm run release:tag -- v1.2.3");
  process.exit(1);
}

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", ...opts });
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

if (command === "pr") {
  if (currentBranch() !== "develop") {
    console.error("Error: must be on the develop branch to open a release PR.");
    process.exit(1);
  }
  if (isDirty()) {
    console.error("Error: working tree has uncommitted changes. Commit or stash them first.");
    process.exit(1);
  }

  console.log(`Creating release PR for ${version}…`);
  run("git push origin develop");
  run(
    `gh pr create \
      --base main \
      --head develop \
      --title "release: ${version}" \
      --body "$(cat <<'EOF'
## Release ${version}

Merges \`develop\` into \`main\` for the **${version}** production release.

### Post-merge steps
After this PR is merged, run the following to tag \`main\` and trigger the automated GitHub Release:

\`\`\`bash
git checkout main && git pull
npm run release:tag -- ${version}
\`\`\`
EOF
)"`,
  );
} else if (command === "tag") {
  if (currentBranch() !== "main") {
    console.error("Error: must be on the main branch to tag a release.");
    console.error("  git checkout main && git pull");
    process.exit(1);
  }

  run("git pull origin main");

  const existing = capture("git tag -l").split("\n");
  if (existing.includes(version)) {
    console.error(`Error: tag ${version} already exists.`);
    process.exit(1);
  }

  console.log(`Tagging ${version} on main…`);
  run(`git tag ${version}`);
  run(`git push origin ${version}`);
  console.log(`\nDone. GitHub Actions will create the ${version} release automatically.`);
} else {
  console.error(`Error: unknown command "${command}". Use "pr" or "tag".`);
  process.exit(1);
}
