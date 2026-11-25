// Read-only observations, never collision/paint/score authorization.
const F=Number.isFinite,positive=x=>F(x)&&x>0,vec=x=>Array.isArray(x)&&x.length===3&&x.every(F),id=x=>typeof x==="string"&&x.length>0;
const eps=1e-9,sub=(a,b)=>a.map((v,i)=>v-b[i]);
export function materialEvidence(m){
 if(!m||!Array.isArray(m.mat_flags)||!Array.isArray(m.col_disable_flags)||!m.mat_flags.every(id)||!m.col_disable_flags.every(id))return {status:"HOLD"};
 const a=new Set(m.mat_flags),d=new Set(m.col_disable_flags),yes=a.has("ForceColPaintPaintable"),no=a.has("ForceColPaintNotPaintable");
 return {status:"OBSERVED",name:m.mat_name??null,playerDead:a.has("PlayerDead"),playerUnsafe:a.has("PlayerUnsafe"),water:a.has("Water"),unridable:a.has("Unridable")||a.has("GameUnridable"),humanLayerDisabled:d.has("SplPlayer")||d.has("SplPlayerHuman"),squidLayerDisabled:d.has("SplPlayer")||d.has("SplPlayerSquid_Visible"),inkLayerDisabled:d.has("SplInkBullet"),paintOverride:yes&&no?"CONFLICT":yes?"FORCE_PAINTABLE":no?"FORCE_NOT_PAINTABLE":"UNSPECIFIED",flags:[...a],disabledLayers:[...d],scoreAuthority:"UNPROVEN"}
}
export function parseCollisionObj(obj,materials,transform){
 if(typeof obj!=="string"||!materials||typeof transform!=="function")throw Error("explicit transform required");
 const vs=[],ts=[];let mat=null,group=null,line=0;
 for(const raw of obj.split(/\r?\n/)){line++;const s=raw.split("#")[0].trim();if(!s)continue;const [tag,...args]=s.split(/\s+/);
 if(tag==="v"){const v=args.slice(0,3).map(Number);if(!vec(v))throw Error("vertex "+line);const w=transform(v);if(!vec(w))throw Error("transform "+line);vs.push(w.slice())}
 else if(tag==="usemtl")mat=args.join(" ");else if(tag==="o"||tag==="g")group=args.join(" ");
 else if(tag==="f"){if(args.length!==3)throw Error("non-triangle "+line);
 const pts=args.map(x=>{const n=Number(x.split("/")[0]);if(!Number.isSafeInteger(n)||n===0)throw Error("index "+line);const v=vs[n>0?n-1:vs.length+n];if(!v)throw Error("unresolved index "+line);return v});
 const u=sub(pts[1],pts[0]),v=sub(pts[2],pts[0]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);if(l<=eps)continue;
 ts.push({line,group,material:mat,attributes:materialEvidence(Object.hasOwn(materials,mat)?materials[mat]:null),points:pts,normal:n.map(x=>x/l),minX:Math.min(...pts.map(x=>x[0])),maxX:Math.max(...pts.map(x=>x[0])),minZ:Math.min(...pts.map(x=>x[2])),maxZ:Math.max(...pts.map(x=>x[2]))})
 }}return ts
}
export function localTriangles(ts,b){if(![b.minX,b.maxX,b.minZ,b.maxZ].every(F)||b.minX>b.maxX||b.minZ>b.maxZ)throw Error("ROI");return ts.filter(t=>t.maxX>=b.minX&&t.minX<=b.maxX&&t.maxZ>=b.minZ&&t.minZ<=b.maxZ)}
function vertical(t,x,z){if(x<t.minX-eps||x>t.maxX+eps||z<t.minZ-eps||z>t.maxZ+eps||Math.abs(t.normal[1])<=eps)return null;const [a,b,c]=t.points,u=sub(b,a),v=sub(c,a),dx=x-a[0],dz=z-a[2],den=u[0]*v[2]-u[2]*v[0];if(Math.abs(den)<=eps)return null;const r=(dx*v[2]-dz*v[0])/den,s=(u[0]*dz-u[2]*dx)/den;return r>=-eps&&s>=-eps&&r+s<=1+eps?a[1]+r*u[1]+s*v[1]:null}
export function probeFoot(ts,{foot,radiusM,belowM,aboveM,slopeCos,ringSamples=8}){
 if(!vec(foot)||![radiusM,belowM,slopeCos].every(positive)||slopeCos>1||!F(aboveM)||aboveM<0||!Number.isInteger(ringSamples)||ringSamples<4||ringSamples>64)throw Error("capsule calibration");
 const offsets=[[0,0],...Array.from({length:ringSamples},(_,i)=>[radiusM*Math.cos(i*2*Math.PI/ringSamples),radiusM*Math.sin(i*2*Math.PI/ringSamples)])];
 return offsets.map(([dx,dz],i)=>{const x=foot[0]+dx,z=foot[2]+dz,hits=[];for(const t of ts){const y=vertical(t,x,z);if(y!==null&&y>=foot[1]-belowM-eps&&y<=foot[1]+aboveM+eps)hits.push({line:t.line,material:t.material,group:t.group,y,deltaY:y-foot[1],normal:t.normal,upFacingCandidate:t.normal[1]>=slopeCos,attributes:t.attributes})}hits.sort((a,b)=>b.y-a.y||a.line-b.line);return {sample:i,x,z,hits}})
}
export function supportObservation(frame,{slopeCos,maxSupportGapM}){
 if(!Number.isSafeInteger(frame.tick)||frame.tick<0||!vec(frame.foot)||!positive(slopeCos)||slopeCos>1||!F(maxSupportGapM)||maxSupportGapM<0)throw Error("sample");
 const s=frame.support;
 if(frame.grounded===true&&s?.queried===true&&s.hit===true&&id(s.colliderId)&&vec(s.normal)&&Math.abs(Math.hypot(...s.normal)-1)<.01&&s.normal[1]>=slopeCos&&F(s.gapM)&&s.gapM>=0&&s.gapM<=maxSupportGapM)return "SUPPORTED";
 if(frame.grounded===false&&s?.queried===true&&s.hit===false)return "UNSUPPORTED";return "UNKNOWN"
}
export function locateSupportLoss(frames,config){
 let last=null,prev=null;
 for(const frame of frames){if(prev&&frame.tick!==prev.tick+1)last=null;const s=supportObservation(frame,config);
 if(s==="SUPPORTED")last=frame;else if(s==="UNSUPPORTED"&&last)return {status:frame.tick===last.tick+1?"EXACT_ADJACENT":"BRACKETED",lastSupportedTick:last.tick,firstObservedUnsupportedTick:frame.tick,lastFoot:last.foot.slice(),firstUnsupportedFoot:frame.foot.slice(),unknownBetween:frame.tick-last.tick-1};prev=frame}
 return {status:"HOLD",reason:"no contiguous support-to-loss observation"}
}
