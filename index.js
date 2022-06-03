#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const proc = require("child_process");
const { Console } = require("console");
let buildCmd;
try {
  buildCmd = require.main.require(process.cwd() + "\\package").scripts.build;
} catch {
  console.log("There Is No Build Script In Your Package Jason!");
}

if (buildCmd) {
  let folderToWatch = path.isAbsolute(process.argv[2])
    ? process.argv[2]
    : process.cwd() + "\\" + process.argv[2];

  if (!folderToWatch || folderToWatch.includes("--ignore"))
    folderToWatch = process.cwd();
  console.log(folderToWatch);
  if (!folderToWatch || !fs.existsSync(folderToWatch))
    console.log("Please Enter A Valid Directory Or File Path!");
  else {
    const ignore = process.argv.slice(process.argv.indexOf("--ignore") + 1);
    console.log(`Build Watcher Is Listening To Changes At ${folderToWatch}`);
    let modified;
    fs.watch(folderToWatch, { recursive: true }, (eventType, fileName) => {
      try {
        let stats = fs.statSync(folderToWatch + "\\" + fileName);
        let seconds = +stats.mtime;
        if (modified != seconds) {
          modified = seconds;
          if (eventType === "change" && !isIn(fileName, ignore)) {
            console.log("Building...");
            proc.exec("npm run build", (err) => {
              Console.log("Build Finished");
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
} else console.log("There Is No Build Script In Your Package Jason!");

function isIn(fileName, ignore) {
  for (let i = 0; i < ignore.length; i++)
    if (fileName.includes(ignore[i])) return true;

  return false;
}
