import {
  RegisterStreamProtocolRequest,
  StreamProtocolResponse,
  UploadData,
  app,
  remote,
  session
} from "electron";

import { MiniRouter } from "./MiniRouter";
import { ElectronResponse } from "./Response";
import { ElectronRequest, EnhancedUploadData, RequestHandler } from "./types";

const electronApp = app || remote.app;
const electronSession = session || remote.session;

function enhanceUploadData(uploadData: UploadData[]): EnhancedUploadData[] {
  return uploadData.map((data: EnhancedUploadData) => {
    if (data.bytes && data.bytes.toString) {
      data.stringContent = () => data.bytes.toString();
      data.json = () => JSON.parse(data.stringContent());
    }

    return data;
  });
}

export class Router extends MiniRouter {
  public constructor() {
    super();

    if (electronApp.isReady()) {
      this.registerSchemes();
    } else {
      electronApp.on("ready", this.registerSchemes.bind(this));
    }
  }

  private registerSchemes(): void {
    const schemes: string[] = remote
      ? remote.getGlobal("__router_schemes__")
      : global["__router_schemes__"];

    schemes.forEach(schemeName => {
      electronSession.defaultSession.protocol.unregisterProtocol(schemeName);
      electronSession.defaultSession.protocol.registerStreamProtocol(
        schemeName,
        this._handle.bind(this),
        (error: Error) => {
          if (error) throw error;
        }
      );
    });
  }

  private _handle(
    request: RegisterStreamProtocolRequest,
    cb: (response?: StreamProtocolResponse) => void
  ): void {
    const { url, referrer, method, uploadData, headers } = request;

    const path = decodeURIComponent(new URL(url).pathname);

    const handlers: RequestHandler[] = this.processRequest(path, method);

    const res = new ElectronResponse(cb);

    if (handlers.length === 0) {
      res.sendStatus(404);
    } else {
      // Move out of scope so it can be mutated
      const uploadData_ = enhanceUploadData(uploadData || []);

      const req: ElectronRequest = {
        params: {},
        method,
        referrer,
        uploadData: uploadData_,
        body: uploadData_.length ? uploadData_[0].json() : {},
        url: path,
        headers
      };

      const attemptHandler = (index: number): void => {
        const tHandler = handlers[index];
        req.params = tHandler.params;

        const next = (): void => {
          if (res.called) {
            throw new Error(
              "Can't call next once data has already been sent as a response"
            );
          }

          if (index + 1 < handlers.length) {
            attemptHandler(index + 1);
          } else {
            res.sendStatus(404);
          }
        };

        tHandler.fn(req, res, next);
      };

      attemptHandler(0);
    }
  }
}
