import { join } from "@std/path";
import { colors } from "@cliffy/ansi";
import { Command } from "@cliffy/command";
import {
  type GHRError,
  GithubReleasesProvider,
  GithubReleasesUpgradeCommand,
} from "@polyseam/cliffy-provider-gh-releases";

import deno_json from "./deno.json" with { type: "json" };

const destinationDir = join(Deno.cwd(), "dist");

function printError(error: GHRError) {
  console.log("\n");
  console.error("error:", colors.brightRed(error.message));
  console.error("code:", colors.brightRed(`${error.code}`));

  if (error.metadata) {
    for (const key in error.metadata) {
      console.error(`${key}:`, colors.brightRed(`${error.metadata[key]!}`));
    }
  }
  console.log("\n");
}

const DEMO_VERSION = deno_json.version;

const upgradeCommand = new GithubReleasesUpgradeCommand({
  provider: new GithubReleasesProvider({
    repository: "polyseam/cliffy-ghr-demo",
    destinationDir,
    osAssetMap: {
      darwin: "demo-mac.tar.gz",
      linux: "demo-linux.tar.gz",
      windows: "demo-windows.tar.gz",
    },
    onError: (error: GHRError) => {
      printError(error);
      const exit_code = parseInt(`8${error.code}`);
      Deno.exit(exit_code);
    },
    onComplete: (_meta, printSuccessMessage) => {
      printSuccessMessage();
      Deno.exit(0);
    },
  }),
});

const cli = new Command()
  .name("demo")
  .version(`v${DEMO_VERSION}`)
  .command(
    "hello",
    new Command().action(() => console.log("Hello World!")),
  )
  .command("upgrade", upgradeCommand);

if (import.meta.main) {
  await cli.parse(Deno.args);
}
