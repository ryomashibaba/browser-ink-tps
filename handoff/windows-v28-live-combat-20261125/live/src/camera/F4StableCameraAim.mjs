// F4 provisional human view only. Physical camera sweep still owns eye position.
// Translate the nominal look vector to the real clipped eye; no target acquisition.
export function f4StableCameraLookPoint(out,eye,nominalEye,nominalTarget) {
  return out.set(
    eye.x + (nominalTarget.x - nominalEye.x),
    eye.y + (nominalTarget.y - nominalEye.y),
    eye.z + (nominalTarget.z - nominalEye.z)
  );
}
