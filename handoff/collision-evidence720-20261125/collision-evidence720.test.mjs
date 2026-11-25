import * as impl from "./collision-evidence720.mjs";
export function verify(m){
 const done=[],check=(n,b)=>{if(!b)throw Error(n);done.push(n)};
 const mats={floor:{mat_name:"Stone",mat_flags:["ForceColPaintPaintable"],col_disable_flags:[]},wall:{mat_name:"Glass",mat_flags:["ForceColPaintNotPaintable"],col_disable_flags:["SplPlayerHuman"]},death:{mat_name:"Water",mat_flags:["PlayerDead","Water"],col_disable_flags:[]}};
 const obj="v -2 0 -2\nv -2 0 2\nv 2 0 -2\nv 2 0 2\nv -2 -2 -2\nv -2 -2 2\nv 2 -2 -2\nusemtl floor\nf 1 2 3\nf 3 2 4\nusemtl death\nf 5 6 7\nusemtl wall\nf 1 5 2\n";
 const t=m.parseCollisionObj(obj,mats,x=>x);check("triangles",t.length===4);check("upward normal",t[0].normal[1]===1);check("wall attributes",t[3].attributes.humanLayerDisabled&&t[3].attributes.paintOverride==="FORCE_NOT_PAINTABLE");check("death not score",t[2].attributes.playerDead&&t[2].attributes.scoreAuthority==="UNPROVEN");
 check("missing material",m.materialEvidence(null).status==="HOLD");
 check("conflict",m.materialEvidence({mat_flags:["ForceColPaintPaintable","ForceColPaintNotPaintable"],col_disable_flags:[]}).paintOverride==="CONFLICT");
 const c={radiusM:.3,belowM:.5,aboveM:.1,slopeCos:.7};
 let a=m.probeFoot(t,{...c,foot:[0,.1,0]});check("footprint",a.length===9&&a.every(x=>x.hits.some(h=>h.upFacingCandidate&&h.y===0)));
 a=m.probeFoot(t,{...c,foot:[1.9,.1,0]});check("edge",a[0].hits.length>0&&a.some(x=>x.hits.length===0));
 a=m.probeFoot(t,{...c,belowM:3,foot:[0,.1,0]});check("stacked",a[0].hits.some(h=>h.y===-2&&h.attributes.playerDead));
 check("ROI",m.localTriangles(t,{minX:3,maxX:4,minZ:3,maxZ:4}).length===0);
 let err=false;try{m.parseCollisionObj(obj,mats,null)}catch{err=true}check("explicit transform",err);
 const cfg={slopeCos:.7,maxSupportGapM:.1},floor={tick:10,foot:[0,.01,0],grounded:true,support:{queried:true,hit:true,normal:[0,1,0],gapM:.01,colliderId:"real"}},side={tick:11,foot:[1,0,0],grounded:true,support:{queried:true,hit:true,normal:[.44,0,.898],gapM:0,colliderId:"side"}},air={tick:12,foot:[1,-.1,0],grounded:false,support:{queried:true,hit:false}};
 check("side unknown",m.supportObservation(side,cfg)==="UNKNOWN");check("query required",m.supportObservation({...air,support:undefined},cfg)==="UNKNOWN");
 check("bracket",m.locateSupportLoss([floor,side,air],cfg).status==="BRACKETED");check("adjacent",m.locateSupportLoss([floor,{...air,tick:11}],cfg).status==="EXACT_ADJACENT");check("gap hold",m.locateSupportLoss([floor,air],cfg).status==="HOLD");check("no prior support",m.locateSupportLoss([side,air],cfg).status==="HOLD");
 return done
}
console.log(verify(impl));
