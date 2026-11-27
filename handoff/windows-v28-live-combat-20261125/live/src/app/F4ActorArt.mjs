// F4 provisional render-only artwork. No actor transform, collider, gameplay or asset authority.
const BODY = [
 {"name":"jacket","type":"capsule","tint":"SUIT","pos":[0,-0.06,0],"size":[0.7,0.7,0.49],"angle":[0,0,0]},
 {"name":"chest","type":"sphere","tint":"TEAM","pos":[0,0.065,-0.25],"size":[0.57,0.39,0.15],"angle":[0,0,0]},
 {"name":"head","type":"sphere","tint":"TEAM","pos":[0,0.55,0],"size":[0.66,0.56,0.6],"angle":[0,0,0]},
 {"name":"cap","type":"sphere","tint":"GEAR","pos":[0,0.77,0.055],"size":[0.65,0.18,0.56],"angle":[0,0,0]},
 {"name":"visor","type":"sphere","tint":"DARK","pos":[0,0.54,-0.28],"size":[0.53,0.22,0.17],"angle":[0,0,0]},
 {"name":"visor-glint","type":"sphere","tint":"VISOR","pos":[0,0.59,-0.355],"size":[0.39,0.048,0.045],"angle":[0,0,0]},
 {"name":"left-arm","type":"capsule","tint":"TEAM","pos":[-0.43,-0.13,-0.03],"size":[0.22,0.58,0.24],"angle":[0,0,-10]},
 {"name":"right-arm","type":"capsule","tint":"TEAM","pos":[0.44,-0.12,-0.1],"size":[0.22,0.52,0.25],"angle":[-25,0,12]},
 {"name":"left-leg","type":"capsule","tint":"DARK","pos":[-0.19,-0.57,0],"size":[0.27,0.55,0.29],"angle":[0,0,0]},
 {"name":"right-leg","type":"capsule","tint":"DARK","pos":[0.19,-0.57,0],"size":[0.27,0.55,0.29],"angle":[0,0,0]},
 {"name":"left-boot","type":"sphere","tint":"GEAR","pos":[-0.19,-0.85,-0.1],"size":[0.32,0.23,0.46],"angle":[0,0,0]},
 {"name":"right-boot","type":"sphere","tint":"GEAR","pos":[0.19,-0.85,-0.1],"size":[0.32,0.23,0.46],"angle":[0,0,0]},
 {"name":"tank","type":"cylinder","tint":"TEAM","pos":[0,-0.04,0.32],"size":[0.46,0.64,0.36],"angle":[0,0,0]},
 {"name":"tank-cap","type":"cylinder","tint":"GEAR","pos":[0,0.28,0.32],"size":[0.48,0.1,0.36],"angle":[0,0,0]},
 {"name":"tank-frame","type":"box","tint":"GEAR","pos":[0,-0.29,0.33],"size":[0.48,0.11,0.36],"angle":[0,0,0]},
 {"name":"rear-stripe","type":"box","tint":"VISOR","pos":[0,0.015,0.51],"size":[0.27,0.07,0.035],"angle":[0,0,0]}
];
const WEAPONS = {
 "pulse-sprayer": [
  {"name":"receiver","type":"box","tint":"GEAR","pos":[0.52,-0.3,-0.36],"size":[0.23,0.22,0.46],"angle":[0,0,0]},
  {"name":"barrel","type":"cylinder","tint":"DARK","pos":[0.52,-0.28,-0.65],"size":[0.13,0.28,0.13],"angle":[90,0,0]},
  {"name":"pigment","type":"box","tint":"TEAM","pos":[0.52,-0.17,-0.33],"size":[0.18,0.08,0.28],"angle":[0,0,0]},
  {"name":"grip","type":"box","tint":"DARK","pos":[0.52,-0.43,-0.23],"size":[0.12,0.2,0.14],"angle":[17,0,0]}
 ],
 "needle-smg": [
  {"name":"receiver","type":"box","tint":"GEAR","pos":[0.52,-0.28,-0.36],"size":[0.15,0.17,0.47],"angle":[0,0,0]},
  {"name":"needle","type":"cylinder","tint":"TEAM","pos":[0.52,-0.28,-0.68],"size":[0.085,0.27,0.085],"angle":[90,0,0]},
  {"name":"magazine","type":"box","tint":"DARK","pos":[0.52,-0.44,-0.34],"size":[0.11,0.27,0.18],"angle":[12,0,0]},
  {"name":"rail","type":"box","tint":"VISOR","pos":[0.52,-0.18,-0.39],"size":[0.09,0.04,0.3],"angle":[0,0,0]}
 ],
 "twin-comets": [
  {"name":"r-receiver","type":"box","tint":"GEAR","pos":[0.5,-0.3,-0.36],"size":[0.23,0.22,0.38],"angle":[0,0,0]},
  {"name":"r-barrel","type":"cylinder","tint":"DARK","pos":[0.5,-0.28,-0.59],"size":[0.13,0.19,0.13],"angle":[90,0,0]},
  {"name":"r-pigment","type":"box","tint":"TEAM","pos":[0.5,-0.17,-0.33],"size":[0.18,0.08,0.28],"angle":[0,0,0]},
  {"name":"l-receiver","type":"box","tint":"GEAR","pos":[-0.5,-0.3,-0.36],"size":[0.23,0.22,0.38],"angle":[0,0,0]},
  {"name":"l-barrel","type":"cylinder","tint":"DARK","pos":[-0.5,-0.28,-0.59],"size":[0.13,0.19,0.13],"angle":[90,0,0]},
  {"name":"l-pigment","type":"box","tint":"TEAM","pos":[-0.5,-0.17,-0.33],"size":[0.18,0.08,0.28],"angle":[0,0,0]}
 ],
 "rail-charger": [
  {"name":"stock","type":"box","tint":"DARK","pos":[0.49,-0.28,-0.17],"size":[0.16,0.18,0.42],"angle":[0,0,0]},
  {"name":"long-rail","type":"cylinder","tint":"GEAR","pos":[0.49,-0.28,-0.71],"size":[0.105,0.98,0.105],"angle":[90,0,0]},
  {"name":"reservoir","type":"box","tint":"TEAM","pos":[0.49,-0.16,-0.43],"size":[0.14,0.13,0.33],"angle":[0,0,0]},
  {"name":"scope","type":"box","tint":"VISOR","pos":[0.49,-0.07,-0.37],"size":[0.09,0.1,0.17],"angle":[0,0,0]}
 ],
 "arc-blaster": [
  {"name":"body","type":"capsule","tint":"GEAR","pos":[0.52,-0.29,-0.34],"size":[0.32,0.46,0.32],"angle":[90,0,0]},
  {"name":"wide-muzzle","type":"cylinder","tint":"TEAM","pos":[0.52,-0.29,-0.64],"size":[0.34,0.26,0.34],"angle":[90,0,0]},
  {"name":"muzzle-inset","type":"cylinder","tint":"DARK","pos":[0.52,-0.29,-0.79],"size":[0.22,0.07,0.22],"angle":[90,0,0]},
  {"name":"grip","type":"box","tint":"DARK","pos":[0.52,-0.45,-0.24],"size":[0.13,0.2,0.14],"angle":[0,0,0]}
 ],
 "metro-roller": [
  {"name":"shaft","type":"cylinder","tint":"GEAR","pos":[0.47,-0.33,-0.47],"size":[0.085,0.72,0.085],"angle":[90,0,0]},
  {"name":"axle","type":"cylinder","tint":"DARK","pos":[0,-0.33,-0.83],"size":[0.1,1.1,0.1],"angle":[0,0,90]},
  {"name":"roller","type":"cylinder","tint":"TEAM","pos":[0,-0.33,-0.83],"size":[0.34,0.98,0.34],"angle":[0,0,90]},
  {"name":"end-left","type":"cylinder","tint":"GEAR","pos":[-0.51,-0.33,-0.83],"size":[0.25,0.07,0.25],"angle":[0,0,90]},
  {"name":"end-right","type":"cylinder","tint":"GEAR","pos":[0.51,-0.33,-0.83],"size":[0.25,0.07,0.25],"angle":[0,0,90]}
 ],
 "dash-brush": [
  {"name":"handle","type":"cylinder","tint":"GEAR","pos":[0.5,-0.34,-0.44],"size":[0.09,0.71,0.09],"angle":[90,0,0]},
  {"name":"ferrule","type":"box","tint":"DARK","pos":[0.5,-0.34,-0.82],"size":[0.27,0.2,0.14],"angle":[0,0,0]},
  {"name":"bristles","type":"capsule","tint":"TEAM","pos":[0.5,-0.34,-1],"size":[0.35,0.34,0.21],"angle":[90,0,0]},
  {"name":"brush-tip","type":"box","tint":"TEAM","pos":[0.5,-0.34,-1.13],"size":[0.26,0.1,0.1],"angle":[0,0,0]}
 ],
 "wave-slosher": [
  {"name":"bucket","type":"cylinder","tint":"TEAM","pos":[0.48,-0.3,-0.45],"size":[0.46,0.43,0.44],"angle":[25,0,0]},
  {"name":"rim","type":"cylinder","tint":"GEAR","pos":[0.48,-0.1,-0.36],"size":[0.5,0.075,0.48],"angle":[25,0,0]},
  {"name":"inside","type":"cylinder","tint":"DARK","pos":[0.48,-0.055,-0.34],"size":[0.38,0.045,0.36],"angle":[25,0,0]},
  {"name":"handle","type":"box","tint":"GEAR","pos":[0.48,-0.25,-0.12],"size":[0.1,0.12,0.26],"angle":[0,0,0]}
 ],
 "rotor-splatling": [
  {"name":"motor","type":"capsule","tint":"GEAR","pos":[0.48,-0.25,-0.33],"size":[0.33,0.51,0.33],"angle":[90,0,0]},
  {"name":"rotor-housing","type":"cylinder","tint":"TEAM","pos":[0.48,-0.26,-0.68],"size":[0.34,0.22,0.34],"angle":[90,0,0]},
  {"name":"rotor-0","type":"cylinder","tint":"DARK","pos":[0.39999999999999997,-0.26,-0.91],"size":[0.095,0.42,0.095],"angle":[90,0,0]},
  {"name":"rotor-1","type":"cylinder","tint":"DARK","pos":[0.5599999999999999,-0.26,-0.91],"size":[0.095,0.42,0.095],"angle":[90,0,0]},
  {"name":"rotor-top","type":"cylinder","tint":"DARK","pos":[0.48,-0.16,-0.91],"size":[0.095,0.42,0.095],"angle":[90,0,0]},
  {"name":"grip","type":"box","tint":"GEAR","pos":[0.48,-0.43,-0.2],"size":[0.13,0.2,0.14],"angle":[0,0,0]}
 ],
 "canopy-guard": [
  {"name":"closed-canopy","type":"capsule","tint":"TEAM","pos":[0.48,-0.27,-0.6],"size":[0.31,0.69,0.3],"angle":[90,0,0]},
  {"name":"tip","type":"cylinder","tint":"GEAR","pos":[0.48,-0.27,-0.98],"size":[0.1,0.22,0.1],"angle":[90,0,0]},
  {"name":"handle","type":"cylinder","tint":"DARK","pos":[0.48,-0.27,-0.2],"size":[0.1,0.37,0.1],"angle":[90,0,0]},
  {"name":"rib","type":"box","tint":"GEAR","pos":[0.48,-0.11,-0.6],"size":[0.085,0.065,0.53],"angle":[0,0,0]}
 ],
 "chord-stringer": [
  {"name":"bow-core","type":"box","tint":"GEAR","pos":[0.48,-0.25,-0.48],"size":[0.16,0.16,0.41],"angle":[0,0,0]},
  {"name":"bow-top","type":"capsule","tint":"TEAM","pos":[0.48,0.01,-0.63],"size":[0.12,0.52,0.12],"angle":[-25,0,0]},
  {"name":"bow-bottom","type":"capsule","tint":"TEAM","pos":[0.48,-0.51,-0.63],"size":[0.12,0.52,0.12],"angle":[25,0,0]},
  {"name":"string","type":"box","tint":"VISOR","pos":[0.48,-0.25,-0.38],"size":[0.025,0.94,0.025],"angle":[0,0,0]},
  {"name":"central-rail","type":"cylinder","tint":"DARK","pos":[0.48,-0.25,-0.69],"size":[0.09,0.34,0.09],"angle":[90,0,0]}
 ],
 "ink-saber": [
  {"name":"grip","type":"capsule","tint":"DARK","pos":[0.49,-0.28,-0.25],"size":[0.14,0.32,0.14],"angle":[90,0,0]},
  {"name":"guard","type":"box","tint":"GEAR","pos":[0.49,-0.28,-0.43],"size":[0.31,0.16,0.085],"angle":[0,0,0]},
  {"name":"blade","type":"box","tint":"TEAM","pos":[0.49,-0.28,-0.81],"size":[0.23,0.105,0.73],"angle":[0,0,0]},
  {"name":"blade-edge","type":"box","tint":"VISOR","pos":[0.49,-0.22,-0.81],"size":[0.13,0.035,0.68],"angle":[0,0,0]}
 ]
};
export function createF4ActorArt(parent,colors,makeEntity,showOwnInkTank=false){
 const root=makeEntity("F4:ActorArt");
 root.enabled=false;
 const nodes=new Map();
 const add=(parent,p)=>{
  const e=makeEntity("F4:Art:"+p.name);
  try{
   parent.addChild(e);
   e.addComponent("render",{type:p.type,material:colors[p.tint],castShadows:false,receiveShadows:false});
   e.setLocalPosition(...p.pos);e.setLocalScale(...p.size);e.setLocalEulerAngles(...p.angle);
   return e;
  }catch(error){e.destroy();throw error;}
 };
 let weaponRoot=null,weaponId=null,disposed=false,lastInkRatio=NaN,lastStride=NaN,lastRecoil=NaN;
 try{
  for(const p of BODY){
   const style=showOwnInkTank?(p.name==='tank'?{...p,tint:'DARK'}:
    p.name==='tank-cap'?{...p,tint:'TEAM'}:
    p.name==='rear-stripe'?{...p,tint:'TEAM'}:p):p;
   nodes.set(p.name,add(root,style));
  }
  if(showOwnInkTank)nodes.get('rear-stripe').enabled=false;
  parent.addChild(root);
 }catch(e){root.destroy();throw e;}
 function setWeapon(id){
  if(disposed||!Object.prototype.hasOwnProperty.call(WEAPONS,id))return false;
  if(id===weaponId)return true;
  const next=makeEntity("F4:Weapon:"+id);next.enabled=false;
  try{
   for(const p of WEAPONS[id])add(next,p);
   root.addChild(next);
  }catch(e){next.destroy();throw e;}
  weaponRoot?.destroy();weaponRoot=next;weaponId=id;next.enabled=true;
  lastStride=NaN;lastRecoil=NaN; // weapon-specific pose resets on switch.
  return true;
 }
 function setInk(ink,capacity){
  if(disposed||!showOwnInkTank)return;
  const panel=nodes.get('rear-stripe');
  if(!Number.isFinite(ink)||!Number.isFinite(capacity)||capacity<=0){
   panel.enabled=false;lastInkRatio=NaN;return;
  }
  const ratio=Math.min(1,Math.max(0,ink/capacity));
  if(ratio===lastInkRatio)return;
  lastInkRatio=ratio;
  panel.enabled=ratio>0;
  if(!panel.enabled)return;
  const height=.42*ratio;
  // Rear-facing pigment strip follows only the actual local ink tank.
  panel.setLocalScale(.24,height,.035);
  panel.setLocalPosition(0,-.24+height*.5,.51);
 }
 function setStride(swing){
  if(disposed||!Number.isFinite(swing)||swing===lastStride)return;
  lastStride=swing;
  // Rotate about the hips without inheriting nonuniform mesh scales.
  for(const [side,x,angle] of [["left",-.19,swing],["right",.19,-swing]]){
   const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
   const leg=nodes.get(side+"-leg"),boot=nodes.get(side+"-boot");
   leg.setLocalPosition(x,-.30-.27*c,-.27*s);
   leg.setLocalEulerAngles(angle,0,0);
   boot.setLocalPosition(x,-.30-.55*c+.10*s,-.55*s-.10*c);
   boot.setLocalEulerAngles(angle,0,0);
  }
  const twoHanded=['twin-comets','rail-charger','metro-roller','rotor-splatling','chord-stringer','ink-saber'].includes(weaponId);
  // Long/two-handed weapons keep the support arm steadier while walking.
  nodes.get("left-arm").setLocalEulerAngles(twoHanded?-25-swing*.10:-swing*.45,0,-10);
 }
 // Render-only response, using the already created weapon hierarchy.
 function setRecoil(value){
  if(disposed||!weaponRoot)return;
  const amount=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;
  if(amount===lastRecoil)return;
  lastRecoil=amount;
  const swing=['metro-roller','dash-brush','wave-slosher','ink-saber'].includes(weaponId);
  // Rotate around the authored grip rather than the actor origin.
  // The root translation cancels the rotation of that local pivot.
  const grip=WEAPONS[weaponId].find(p=>p.name==='grip'||p.name==='handle'||p.name==='shaft');
  const py=grip?.pos[1]??-.28,pz=grip?.pos[2]??-.20;
  const angle=(swing?-18:-5)*amount,a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  const kick=(swing?.025:.085)*amount;
  weaponRoot.setLocalPosition(0,py-(py*c-pz*s),pz-(py*s+pz*c)+kick);
  weaponRoot.setLocalEulerAngles(angle,0,0);
  nodes.get("right-arm").setLocalEulerAngles(-25-(swing?16:5)*amount,0,12);
 }
 return {root,setWeapon,setStride,setInk,setRecoil,destroy(){if(!disposed){disposed=true;root.destroy();}}};
}
