import plantillaHandler from "../../../lib/legacy-api/plantilla.js";
import { runLegacyHandler } from "../../../lib/run-legacy-handler.js";

export function GET(request) {
  return runLegacyHandler(plantillaHandler, request);
}