#!/usr/bin/env node
const os = require("os");
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const program = new Command();

program.option(
  "-c, --config <type>",
  "config file. suport both ts and js. default rogo.config.[js|ts]",
  ""
);
program.option("-w, --watch", "watch");
program.parse(process.argv);
const options = program.opts();

let configFile = options.config;
if (!configFile) {
  const defaults = ["rogo.config.js", "rogo.config.ts"];
  for (const f of defaults) {
    let t = path.join(process.cwd(), f);
    if (fs.existsSync(t)) {
      configFile = t;
      break;
    }
  }
}
if (!configFile) {
  throw "--config option not specified and default config not found.";
}
if (!fs.existsSync(configFile)) {
  throw "Specified config file does not exits.";
}
const isTS = configFile.toLowerCase().endsWith(".ts");
let realConfigFile = "";
if (isTS) {
  realConfigFile = configFile;
  configFile = path.join(__dirname, "ts-config-wrapper.js");
}
const spawn = require("child_process").spawn;
const rollupBin =
  path.join(__dirname, "node_modules/.bin/rollup") +
  (os.platform() === "win32" ? ".cmd" : "");
const args = ["-c", configFile];
if (options.watch) {
  args.push("--watch");
}
const rollup = spawn(rollupBin, args, {
  env: { ...process.env, REAL_CONFIG: realConfigFile },
});

rollup.stdout.on("data", function (data) {
  console.log(data.toString());
});

rollup.stderr.on("data", function (data) {
  console.error(data.toString());
});

rollup.on("exit", function (code) {
  console.log("DONE");
});
