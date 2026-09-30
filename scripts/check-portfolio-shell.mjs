import assert from "node:assert/strict";
import fs from "node:fs/promises";

const pages = await (await fetch("http://127.0.0.1:9226/json")).json();
const page = pages.find(item => item.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
const pending = new Map();
const errors = [];
let nextId = 0;
ws.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (message.error) request?.reject(message.error);
    else request?.resolve(message.result);
    pending.delete(message.id);
  }
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const output = "docs/site-shell";
await fs.mkdir(output, { recursive: true });
async function ready() {
  for (let index = 0; index < 90; index++) {
    if (await evaluate("!!document.querySelector('#contact') && !!document.querySelector('[data-hero-identity]')")) return;
    await pause(250);
  }
  throw new Error("Homepage did not render all sections");
}
const metrics = () => evaluate(`(() => ({
  width: document.documentElement.clientWidth,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  h1Count: document.querySelectorAll('h1').length,
  sectionIds: [...document.querySelectorAll('main section[id]')].map(el => el.id),
  hasWork: !!document.getElementById('work'),
  missingNavTargets: [...document.querySelectorAll('nav a[href^="#"]')].map(a => a.getAttribute('href')).filter(href => href !== '#' && !document.querySelector(href)),
  pins: document.querySelectorAll('.pin-spacer').length,
  canvasCount: document.querySelectorAll('canvas').length,
  githubEmpty: document.querySelector('#github')?.textContent.includes('GITHUB USERNAME PENDING'),
  contactPending: document.querySelector('#contact')?.textContent.includes('EMAIL PENDING'),
  projectCount: document.querySelectorAll('#projects article').length,
  experienceCount: document.querySelectorAll('#experience li').length,
  focusId: document.activeElement?.id,
  selectedTab: document.querySelector('[role="tab"][aria-selected="true"]')?.id
}))()`);
async function screenshot(name) {
  const shot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await fs.writeFile(`${output}/${name}.png`, Buffer.from(shot.data, "base64"));
}
async function scrollToSection(id) {
  await evaluate(`document.getElementById(${JSON.stringify(id)}).scrollIntoView({block:'start',behavior:'instant'})`);
  await pause(700);
}
const result = { desktop: [], mobile: null, reduced: null, noJavaScript: null, keyboard: null, errors };
try {
  await call("Page.enable");
  await call("Page.navigate", { url: "about:blank" });
  await pause(300);
  await call("Runtime.discardConsoleEntries");
  await call("Runtime.enable");

  for (const width of [1280, 1440, 1728, 768, 390]) {
    const height = width === 390 ? 844 : 900;
    await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width === 390 });
    await call("Page.navigate", { url: "http://localhost:3100/" });
    await ready();
    await pause(950);
    const start = await metrics();
    assert.equal(start.overflow, 0, `Horizontal overflow at ${width}`);
    assert.equal(start.h1Count, 1);
    assert.deepEqual(start.missingNavTargets, []);
    assert.deepEqual(start.sectionIds, ["projects", "about", "stack", "experience", "github", "contact"]);
    assert.equal(start.hasWork, true);
    assert.equal(start.githubEmpty, true);
    assert.equal(start.contactPending, true);
    assert.equal(start.projectCount, 2);
    assert.equal(start.experienceCount, 2);
    if (width >= 1024) assert.equal(start.pins, 1);
    else { assert.equal(start.pins, 0); assert.equal(start.canvasCount, 0); }
    if (width === 1440) {
      for (const id of ["projects", "about", "stack", "experience", "github", "contact"]) {
        await scrollToSection(id);
        await screenshot(`desktop-${id}`);
      }
      await evaluate("document.getElementById('stack-tab-0').focus()");
      await call("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
      await call("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
      await pause(350);
      result.keyboard = await metrics();
      assert.equal(result.keyboard.selectedTab, "stack-tab-1");
      assert.equal(result.keyboard.focusId, "stack-tab-1");
    }
    if (width === 390) {
      for (const id of ["projects", "about", "stack", "experience", "github", "contact"]) {
        await scrollToSection(id);
        await screenshot(`mobile-${id}`);
      }
      result.mobile = await metrics();
    } else result.desktop.push(start);
  }

  await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await call("Page.navigate", { url: "http://localhost:3100/" });
  await ready();
  await pause(600);
  result.reduced = await metrics();
  assert.equal(result.reduced.canvasCount, 0);
  assert.equal(result.reduced.pins, 0);
  assert.equal(result.reduced.overflow, 0);

  await call("Emulation.setScriptExecutionDisabled", { value: true });
  await call("Page.navigate", { url: "http://localhost:3100/" });
  for (let index = 0; index < 30; index++) {
    await pause(250);
    const doc = await call("DOM.getDocument");
    const matches = await call("DOM.querySelectorAll", { nodeId: doc.root.nodeId, selector: "main section[id]" });
    result.noJavaScript = { sectionCount: matches.nodeIds.length };
    if (result.noJavaScript.sectionCount === 6) break;
  }
  assert.equal(result.noJavaScript.sectionCount, 6);
  const noScriptDocument = await call("DOM.getDocument");
  const noScriptGitHub = await call("DOM.querySelector", { nodeId: noScriptDocument.root.nodeId, selector: "#github" });
  const noScriptMarkup = await call("DOM.getOuterHTML", { nodeId: noScriptGitHub.nodeId });
  result.noJavaScript.githubPending = noScriptMarkup.outerHTML.includes("GITHUB USERNAME PENDING");
  assert.equal(result.noJavaScript.githubPending, true);
  assert.equal(errors.length, 0);
} finally {
  await call("Emulation.setScriptExecutionDisabled", { value: false }).catch(() => {});
  await fs.writeFile(`${output}/runtime.json`, JSON.stringify(result, null, 2));
  ws.close();
}
console.log(JSON.stringify({ widths: result.desktop.map(item => item.width), mobile: result.mobile?.width, keyboard: result.keyboard?.selectedTab, reducedCanvas: result.reduced?.canvasCount, noJavaScript: result.noJavaScript?.sectionCount, errors }, null, 2));
