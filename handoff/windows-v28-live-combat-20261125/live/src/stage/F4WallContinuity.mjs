// Bounded provisional wall continuity; no movement/paint state writes.
export function f4SharedWallSeam(a,b,minRun=6){
 if(a===b||a.axis!==b.axis||a.plane!==b.plane||a.width!==b.width||a.height!==b.height)return false;
 const n=Math.round(Math.sqrt(a.mask.length));
 if(!Number.isInteger(n)||n*n!==a.mask.length||a.mask.length!==b.mask.length)return false;
 const du=b.minU-a.minU,dv=b.minV-a.minV;
 let run=0;
 for(let i=0;i<n;i++){
  let left=0,right=0;
  if(du===a.width&&dv===0){left=a.mask[i*n+n-1];right=b.mask[i*n];}
  else if(du===-a.width&&dv===0){left=a.mask[i*n];right=b.mask[i*n+n-1];}
  else if(dv===a.height&&du===0){left=a.mask[(n-1)*n+i];right=b.mask[i];}
  else if(dv===-a.height&&du===0){left=a.mask[i];right=b.mask[(n-1)*n+i];}
  else return false;
  run=left&&right?run+1:0;
  if(run>=minRun)return true;
 }
 return false;
}

export function selectF4ConnectedWallTiles(rows,isSeed,prepare,limit=8){
 const chosen=[],seen=new Set(),prepared=new Map();
 const get=(row)=>{if(!prepared.has(row))prepared.set(row,prepare(row));return prepared.get(row);};
 const add=(row)=>{seen.add(row);chosen.push(row);};
 // Prefer directly reachable starts, then one/two immediately adjoining
 // tiles before choosing another start; upper tiles need no invented floor.
 const seeds=rows.filter(isSeed);
 for(const row of seeds){
  if(chosen.length>=limit)break;
  if(seen.has(row))continue;
  const first=get(row);if(!first||!isSeed(first))continue;add(first);
  // A prepared row may be a different object with a reduced physical mask.
  seen.add(row);
  let tip=first;
  for(let i=0;i<2&&chosen.length<limit;i++){
   let next=null;
   for(const candidate of rows){
    if(seen.has(candidate)||candidate.minV<tip.minV||!f4SharedWallSeam(tip,candidate))continue;
    const physical=get(candidate);
    if(physical&&f4SharedWallSeam(tip,physical)){next=physical;seen.add(candidate);break;}
   }
   if(!next)break;add(next);tip=next;
  }
 }
 return chosen;
}

export function f4CarryCrestMomentum(gap,normalY,verticalSpeed,toward,gravity,clear){
 return clear===true&&[gap,normalY,verticalSpeed,toward,gravity].every(Number.isFinite)&&
  gap>=-.12&&gap<=.42&&normalY>=Math.cos(50*Math.PI/180)-1e-6&&
  verticalSpeed>0&&toward>=.28&&gravity>0&&verticalSpeed*verticalSpeed/(2*gravity)>=Math.max(0,gap)+.025;
}
