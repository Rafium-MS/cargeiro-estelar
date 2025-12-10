export { renderState, renderMap, renderReputation, renderHistory } from "./renderState";
export { renderJobs } from "./renderJobs";
export { renderCrew, renderCrewCandidates } from "./renderCrew";
export { renderUpgrades, renderShipyard } from "./renderUpgrades";

import { renderCrew, renderCrewCandidates } from "./renderCrew";
import { renderHistory, renderMap, renderReputation, renderState } from "./renderState";
import { renderJobs } from "./renderJobs";
import { renderShipyard } from "./renderUpgrades";

export function renderAll() {
  renderState();
  renderCrew();
  renderCrewCandidates();
  renderJobs();
  renderShipyard();
  renderHistory();
}
