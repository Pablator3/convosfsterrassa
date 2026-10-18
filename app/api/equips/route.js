import equipsHandler from "../../../lib/legacy-api/equips.js";
import { runLegacyHandler } from "../../../lib/run-legacy-handler.js";

export function GET(request) {
  return runLegacyHandler(equipsHandler, request);
}