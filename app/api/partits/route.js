import partitsHandler from "../../../lib/legacy-api/partits.js";
import { runLegacyHandler } from "../../../lib/run-legacy-handler.js";

export function GET(request) {
  return runLegacyHandler(partitsHandler, request);
}