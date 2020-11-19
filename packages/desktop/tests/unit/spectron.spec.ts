import { Application } from "spectron";
import assert from "assert";
import electron from "electron";
import path from "path";
import { describe, it, beforeEach, afterEach } from "@jest/globals";

describe("Application launch", function() {
  let app: Application;
  beforeEach(async function() {
    app = new Application({
      path: path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        ".bin",
        "electron" + (process.platform === "win32" ? ".cmd" : "")
      ),
      args: [path.join(__dirname, "..", "..", "src", "background.ts")],
      chromeDriverArgs: [
        "--no-sandbox",
        "--whitelisted-ips=",
        "--disable-dev-shm-usage",
      ],
    });
    return await app.start();
  });

  afterEach(function() {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it("shows an initial window", function() {
    return app.client.getWindowCount().then(function(count) {
      assert.strictEqual(count, 1);
    });
  });
});
