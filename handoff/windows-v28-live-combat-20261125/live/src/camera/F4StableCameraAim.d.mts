interface Point { readonly x:number; readonly y:number; readonly z:number }
export function f4StableCameraLookPoint<T extends {set(x:number,y:number,z:number):T}>(
  out:T,eye:Point,nominalEye:Point,nominalTarget:Point
):T;
