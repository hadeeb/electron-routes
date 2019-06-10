import { UploadData } from "electron";
import { Key as RegexKey } from "path-to-regexp";

import { MiniRouter } from "./MiniRouter";
import { ElectronResponse } from "./Response";

export type PathHandler = (
  request: ElectronRequest,
  response: ElectronResponse,
  next: () => void
) => void | Promise<void>;

export interface RequestHandler {
  params: {};
  fn: PathHandler;
}

export interface ElectronRequest {
  params: {};
  method: string;
  referrer: string;
  body: {};
  uploadData: EnhancedUploadData[];
  url: string;
  headers: {};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EnhancedUploadData<T = any> extends UploadData {
  stringContent: () => string;
  json: () => T;
}

export interface RouteHandler {
  pathComponent: string;
  pathRegexp: RegExp;
  pathKeys: RegexKey[];
  callback?: PathHandler;
  router?: MiniRouter;
}

export interface Methods {
  get: RouteHandler[];
  post: RouteHandler[];
  put: RouteHandler[];
  delete: RouteHandler[];
  use: RouteHandler[];
}
