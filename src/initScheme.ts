import { protocol } from "electron";

export function initScheme(schemeName = "app"): void {
  global["__router_schemes__"] = [schemeName];

  // @ts-ignore
  if (protocol.registerStandardSchemes) {
    // Electron <=4
    // @ts-ignore
    protocol.registerStandardSchemes([schemeName], { secure: true });
  } else {
    // Electron >=5
    protocol.registerSchemesAsPrivileged([
      {
        scheme: schemeName,
        privileges: {
          secure: true,
          standard: true,
          supportFetchAPI: true
        }
      }
    ]);
  }
}
