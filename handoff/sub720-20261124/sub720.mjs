// F4-only 720 candidate rules; never use raw distances as world metres.
const profiles=Object.freeze(Object.fromEntries(Object.entries({
  "pulse-bomb": {
    "inkPercent": 70,
    "recoveryF": 60,
    "repeatF": 30,
    "fuseF": 60,
    "mode": "GROUND_FUSE",
    "nearDamage": 180,
    "farDamage": 30,
    "directDamage": 0,
    "nearRadiusRaw": 3.6,
    "farRadiusRaw": 7,
    "paintRadiusRaw": null,
    "splashCount": 15
  },
  "snap-bomb": {
    "inkPercent": 45,
    "recoveryF": 60,
    "repeatF": 30,
    "fuseF": 0,
    "mode": "IMPACT",
    "nearDamage": 35,
    "farDamage": 25,
    "directDamage": 25,
    "nearRadiusRaw": 2.8,
    "farRadiusRaw": 4,
    "paintRadiusRaw": 4,
    "splashCount": 10
  },
  "anchor-bomb": {
    "inkPercent": 70,
    "recoveryF": 60,
    "repeatF": 30,
    "fuseF": 120,
    "mode": "ATTACHED_FUSE",
    "nearDamage": 180,
    "farDamage": 30,
    "directDamage": 0,
    "nearRadiusRaw": 4.6,
    "farRadiusRaw": 8,
    "paintRadiusRaw": 5,
    "splashCount": 15
  }
}).map(([id,p])=>[id,Object.freeze(p)])));
export function sub720Profile(id){if(!Object.prototype.hasOwnProperty.call(profiles,id))throw new RangeError("unknown F4 sub");return profiles[id];}
export function sub720BlastDamage(id,nearOverlap,farOverlap){const p=sub720Profile(id);if(typeof nearOverlap!=="boolean"||typeof farOverlap!=="boolean"||nearOverlap&&!farOverlap)throw new RangeError("invalid physical overlap");return nearOverlap?p.nearDamage:farOverlap?p.farDamage:0;}
export function sub720DirectDamage(id,contactKind,guarded){const p=sub720Profile(id);if(!["ACTOR_BODY","SHIELD","STAGE","NONE"].includes(contactKind)||typeof guarded!=="boolean")throw new RangeError("invalid physical contact");return contactKind==="ACTOR_BODY"&&!guarded?p.directDamage:0;}
export function sub720StepFuse(id,elapsedF,contact){const p=sub720Profile(id);if(!Number.isSafeInteger(elapsedF)||elapsedF<0||!["GROUND_SUPPORTED","ATTACHED_STAGE","AIRBORNE","WALL_TOUCH","ACTOR_TOUCH","NONE"].includes(contact))throw new RangeError("invalid fuse state");if(p.mode==="IMPACT")return {elapsedF:0,detonate:contact!=="NONE"&&contact!=="AIRBORNE"};const advances=p.mode==="GROUND_FUSE"?contact==="GROUND_SUPPORTED":contact==="ATTACHED_STAGE";const n=Math.min(p.fuseF,elapsedF+(advances?1:0));return {elapsedF:n,detonate:n>=p.fuseF};}
