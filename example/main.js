/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow } = require("electron");

const { initScheme, Router, MiniRouter, electronStatic } = require("../dist");

let mainWindow;

initScheme();

const router = new Router();

router.use(electronStatic(__dirname));

router.get("foo/:thing/:other", (req, res) => {
  res.json(Object.assign({ foo: "bar", thing: req.params.thing }, req));
});

router.post("send", (req, res) => {
  console.log(req.uploadData[0].json());
  res.json(Object.assign({ foo: "bar", thing: req.params.thing }, req));
});

const testUse = new MiniRouter();
router.use(testUse);
testUse.use("thing", (req, res, next) => {
  console.log("thing_route_use");
  setTimeout(next, 1000);
});
testUse.get("thing", (req, res, next) => {
  console.log("thing_route");
  setTimeout(next, 1000);
});
testUse.get("/:this", (req, res) => {
  console.log("this_route");
  res.json({ this: req.params.this });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {}
  });

  mainWindow.loadURL(`app://./`);

  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
