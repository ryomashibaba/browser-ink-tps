// F4 only. A lead is an aim proposal, never a hit or an authorization to fire.
const kits=Object.freeze({
  "pulse-sprayer": [
    "Shooter_Normal_00",
    "Bomb_Suction",
    "SpUltraShot",
    210,
    "anchor-bomb"
  ],
  "needle-smg": [
    "Shooter_Precision_00",
    "Bomb_Quick",
    "SpChariot",
    200,
    "snap-bomb"
  ],
  "twin-comets": [
    "Maneuver_Normal_00",
    "Bomb_Suction",
    "SpChariot",
    190,
    "anchor-bomb"
  ],
  "rail-charger": [
    "Charger_Normal_00",
    "Bomb_Splash",
    "SpBlower",
    190,
    "pulse-bomb"
  ],
  "arc-blaster": [
    "Blaster_Short_00",
    "Bomb_Splash",
    "SpSuperHook",
    170,
    "pulse-bomb"
  ],
  "metro-roller": [
    "Roller_Normal_00",
    "Bomb_Curling",
    "SpGreatBarrier",
    180,
    null
  ],
  "dash-brush": [
    "Brush_Mini_00",
    "Bomb_Splash",
    "SpMicroLaser",
    180,
    "pulse-bomb"
  ],
  "wave-slosher": [
    "Slosher_Strong_00",
    "Bomb_Splash",
    "SpTripleTornado",
    200,
    "pulse-bomb"
  ],
  "rotor-splatling": [
    "Spinner_Standard_00",
    "Sprinkler",
    "SpShockSonar",
    200,
    null
  ],
  "canopy-guard": [
    "Shelter_Normal_00",
    "Sprinkler",
    "SpTripleTornado",
    200,
    null
  ],
  "chord-stringer": [
    "Stringer_Normal_00",
    "PoisonMist",
    "SpMicroLaser",
    190,
    null
  ],
  "ink-saber": [
    "Saber_Lite_00",
    "Bomb_Torpedo",
    "SpUltraStamp",
    190,
    null
  ]
});
export function kit720(id){if(!Object.prototype.hasOwnProperty.call(kits,id))return null;const [row,sub,special,points,existingSub]=kits[id];return {row,sub,special,points,existingSub};}

export function resolveF4Sub720(id,enabled){const k=kit720(id);return k&&k.existingSub&&enabled.includes(k.existingSub)?k.existingSub:null;}

export function predictF4Lead(input, solveFlightTicks, isClear){
 const {muzzle,body,previousBody,deltaTicks,maxRangeMeters,sameLife,grounded}=input;
 const valid=p=>p&&[p.x,p.y,p.z].every(Number.isFinite);
 if(!sameLife||!grounded||!valid(muzzle)||!valid(body)||!valid(previousBody)||!Number.isSafeInteger(deltaTicks)||deltaTicks<1||deltaTicks>3||!Number.isFinite(maxRangeMeters)||maxRangeMeters<=0)return null;
 if(typeof solveFlightTicks!=="function"||typeof isClear!=="function")return null;
 const vx=(body.x-previousBody.x)/deltaTicks,vz=(body.z-previousBody.z)/deltaTicks,vy=(body.y-previousBody.y)/deltaTicks;
 const speed=Math.hypot(vx,vz)*60;
 if(speed<.2||speed>12||Math.abs(vy)>.12)return null;
 const inRange=p=>Math.hypot(p.x-muzzle.x,p.z-muzzle.z)<=maxRangeMeters;
 if(!inRange(body)||!isClear(muzzle,body))return null;
 let aim={x:body.x,y:body.y,z:body.z},ticks;
 for(let i=0;i<4;i++){
   ticks=solveFlightTicks(aim);
   if(!Number.isFinite(ticks)||ticks<=0||ticks>45)return null;
   const dx=vx*ticks,dz=vz*ticks;
   if(Math.hypot(dx,dz)>2.5)return null;
   const next={x:body.x+dx,y:body.y,z:body.z+dz};
   if(!inRange(next))return null;
   if(Math.hypot(next.x-aim.x,next.z-aim.z)<=.025){
     if(!isClear(muzzle,next))return null;
     return {aim:next,flightTicks:ticks,leadMeters:Math.hypot(dx,dz)};
   }
   aim=next;
 }
 return null;
}
