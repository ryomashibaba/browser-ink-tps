interface Point { readonly x:number;readonly y:number;readonly z:number }
export function f4ZipReticleWitnessMatches(expected:Point|null|undefined,actual:Point|null|undefined,tolerance?:number):boolean;
export function f4ZipReticleDirection(out:{set(x:number,y:number,z:number):unknown},origin:Point,target:Point,maxRange?:number):boolean;
