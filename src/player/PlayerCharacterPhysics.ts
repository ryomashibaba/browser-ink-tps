import type {
  KinematicCharacterController,
  World
} from '@dimforge/rapier3d-compat';
import { GAME_CONFIG } from '../config/game/gameConfig';

const humanRadiusMeters = GAME_CONFIG.player.humanColliderRadiusMeters;
const humanHalfHeightMeters = GAME_CONFIG.player.humanColliderHalfHeightMeters;
const humanFootOffsetMeters = humanHalfHeightMeters + humanRadiusMeters;
const squidRadiusMeters = GAME_CONFIG.player.squidColliderRadiusMeters;
const squidCenterOffsetYMeters =
  -(humanFootOffsetMeters - squidRadiusMeters);

/**
 * Shared PlayerController/Rapier geometry and KCC setup.
 *
 * Pass 15C imports this same profile for inert QA so the Undertow glass test
 * cannot silently drift away from the production player controller.
 */
export const PLAYER_CHARACTER_PHYSICS = Object.freeze({
  humanRadiusMeters,
  humanHalfHeightMeters,
  humanFootOffsetMeters,
  squidRadiusMeters,
  squidCenterOffsetYMeters,
  squidTopOffsetFromBodyMeters:
    squidCenterOffsetYMeters + squidRadiusMeters,
  controllerOffsetMeters: 0.025,
  autostepMaxHeightMeters: 0.34,
  autostepMinWidthMeters: 0.14,
  autostepIncludeDynamicBodies: false,
  snapToGroundMeters: 0.24,
  maxSlopeClimbAngleRadians: 50 * Math.PI / 180,
  minSlopeSlideAngleRadians: 55 * Math.PI / 180
});

export function createConfiguredPlayerCharacterController(
  world: World
): KinematicCharacterController {
  const character = world.createCharacterController(
    PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters
  );
  character.enableAutostep(
    PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters,
    PLAYER_CHARACTER_PHYSICS.autostepMinWidthMeters,
    PLAYER_CHARACTER_PHYSICS.autostepIncludeDynamicBodies
  );
  character.enableSnapToGround(
    PLAYER_CHARACTER_PHYSICS.snapToGroundMeters
  );
  character.setMaxSlopeClimbAngle(
    PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians
  );
  character.setMinSlopeSlideAngle(
    PLAYER_CHARACTER_PHYSICS.minSlopeSlideAngleRadians
  );
  return character;
}
