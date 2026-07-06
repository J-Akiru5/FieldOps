const fs = require("fs");
const path = require("path");
const dir = "docs/project-tracker";

for (const file of fs.readdirSync(dir).filter((f) => /^phase-\d+\.html$/.test(f))) {
  let html = fs.readFileSync(path.join(dir, file), "utf-8");
  html = html.replace(/<input type="checkbox"/g, '<input type="checkbox" checked');
  fs.writeFileSync(path.join(dir, file), html, "utf-8");
}

let js = fs.readFileSync(path.join(dir, "script.js"), "utf-8");
const initCode = `
  if (!localStorage.getItem("fieldops-tracker-initialized")) {
    var state = {};
    document.querySelectorAll("input[data-task-key]").forEach(function(cb) { state[cb.dataset.taskKey] = true; });
    localStorage.setItem("fieldops-tracker", JSON.stringify(state));
    localStorage.setItem("fieldops-tracker-initialized", "1");
    updateUI();
  }`;
js = js.replace("updateUI();", "updateUI();" + initCode);
fs.writeFileSync(path.join(dir, "script.js"), js, "utf-8");

console.log("Tracker updated: all phases pre-completed");
