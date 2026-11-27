// F4 provisional natural Zipcaster reticle geometry. No physical authority.
export function f4ZipReticleWitnessMatches(expected,actual,tolerance=.15){
 if(!expected||!actual||![expected.x,expected.y,expected.z,actual.x,actual.y,actual.z,tolerance].every(Number.isFinite)||tolerance<0)return false;
 return Math.hypot(expected.x-actual.x,expected.y-actual.y,expected.z-actual.z)<=tolerance;
}

export function f4ZipReticleDirection(out,origin,target,maxRange=18){
 if(![origin.x,origin.y,origin.z,target.x,target.y,target.z,maxRange].every(Number.isFinite)||maxRange<1)return false;
 const x=target.x-origin.x,y=target.y-origin.y,z=target.z-origin.z,d=Math.hypot(x,y,z);
 if(d<1||d>maxRange)return false;
 out.set(x/d,y/d,z/d);return true;
}
