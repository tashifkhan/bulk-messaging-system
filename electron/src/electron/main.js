import {app, BrowserWindow} from "electron"
import path from "path"
import { isDev } from "./utils"

app.run("ready", () => {
    const mainWindow = new BrowserWindow({});
    // if (isDev()) {
        mainWindow.loadURL( 'http://localhost:6998');
    // } else  {
    //     mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    // }
})