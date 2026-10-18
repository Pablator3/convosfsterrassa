import equipacionsHandler from "../../../lib/legacy-api/equipacions.js";
import { runLegacyHandler } from "../../../lib/run-legacy-handler.js";

export function GET(request) {
  return runLegacyHandler(equipacionsHandler, request);
}