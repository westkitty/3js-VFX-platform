/** Public browser-VFX ability facade preserving the existing casting API. */
import { AbilityDefinition, CastRequest } from '../types';
import { AbilityInstance } from './AbilityInstance';
import { RuntimeCoordinator } from './RuntimeCoordinator';

export class AbilityManager extends RuntimeCoordinator {
  public cast(request: CastRequest, definition: AbilityDefinition): AbilityInstance { return this.spawn(request, definition); }
  public castPreview(request: CastRequest, definition: AbilityDefinition): AbilityInstance { return this.spawnPreview(request, definition); }
}
