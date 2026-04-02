/** Returns the app version string, e.g. "v0.1.0 · 2026-04-03" */
export function getAppVersion(version: string, buildDate: string): string {
  return `v${version} · ${buildDate}`;
}

/** The version string baked in at build time */
export const APP_VERSION = getAppVersion(__APP_VERSION__, __BUILD_DATE__);
