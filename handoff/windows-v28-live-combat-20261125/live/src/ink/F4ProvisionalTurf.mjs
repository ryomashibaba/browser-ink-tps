// F4 provisional research scoring only. Neither source flags nor owner grids are written here.
const PAINT=1,WALL=8,FLOOR=16,RAMP=32;
export class F4ProvisionalTurf {
 #rows=new Map();#queue=[];#row=0;#cursor=0;#backed;#total=0;#a=0;#b=0;#scanned=0;#count=0;#final=null;#extraTotal=0;#extraA=0;#extraB=0;#extraTiles=0;#requireExtra;
 constructor(surfaces,backed,requireExtra=false){
  this.#backed=backed;this.#requireExtra=requireExtra;
  for(const s of surfaces){
   if(!(s.baseFlags&PAINT)||(s.baseFlags&WALL)||!(s.baseFlags&(FLOOR|RAMP))||
      !Number.isFinite(s.normal.y)||Math.abs(s.normal.y)<.1)continue;
   const n=s.widthCells*s.heightCells;
   if(!Number.isSafeInteger(n)||n<=0||s.ownerGrid.length!==n||s.flagsGrid.length!==n)throw Error('invalid provisional raster');
   // 0 = unvisited, 1 = zero weight, 2 = positive weight. Dimensions
   // and normal are immutable for the registered PaintSurface lifetime.
   // One byte per cell, plus separable exact axis extents.
   const state=new Uint8Array(n);
   const u=new Float64Array(s.widthCells),v=new Float64Array(s.heightCells);
   for(let x=0;x<u.length;x++)u[x]=Math.max(0,Math.min(s.cellSize,s.widthMeters-x*s.cellSize));
   for(let y=0;y<v.length;y++)v[y]=Math.max(0,Math.min(s.cellSize,s.heightMeters-y*s.cellSize));
   const extra=typeof s.id==='string'&&s.id.startsWith('F4ProvisionalFloor:');
   if(extra)this.#extraTiles++;
   const row={s,state,u,v,normalY:Math.abs(s.normal.y),extra};this.#rows.set(s,row);this.#queue.push(row);this.#count+=n;
  }
 }
 #visit(row,index){
  const {s,state,u,v,normalY}=row;
  const status=state[index];
  if(status===1)return 0;
  const x=index%s.widthCells,y=Math.floor(index/s.widthCells);
  if(status===2)return u[x]*v[y]*normalY;
  let w=0;
  if((s.flagsGrid[index]&PAINT)&&!(s.flagsGrid[index]&WALL)&&s.isCellActive(x,y)&&this.#backed(s,x,y,index)){
   w=u[x]*v[y]*normalY;
   if(!Number.isFinite(w)||w<0)throw Error('invalid projected weight');
  }
  state[index]=w>0?2:1;this.#scanned++;this.#total+=w;
  if(s.ownerGrid[index]===1)this.#a+=w;else if(s.ownerGrid[index]===-1)this.#b+=w;
  if(row.extra){this.#extraTotal+=w;if(s.ownerGrid[index]===1)this.#extraA+=w;else if(s.ownerGrid[index]===-1)this.#extraB+=w;}
  return w
 }
 scan(limit,keepGoing=()=>true){
  if(this.#final||!Number.isSafeInteger(limit)||limit<=0)return;
  for(let i=0;i<limit&&this.#row<this.#queue.length&&keepGoing();i++){
   const row=this.#queue[this.#row];this.#visit(row,this.#cursor++);
   if(this.#cursor===row.state.length){this.#row++;this.#cursor=0}
  }
 }
 // Called immediately before the actual raster writes ownerGrid[index].
 beforeChange(surface,index,oldOwner,newOwner){
  if(this.#final||oldOwner===newOwner||surface.ownerGrid[index]!==oldOwner||
     (oldOwner!==0&&oldOwner!==1&&oldOwner!==-1)||(newOwner!==1&&newOwner!==-1))return 0;
  const row=this.#rows.get(surface);if(!row||!Number.isSafeInteger(index)||index<0||index>=row.state.length)return 0;
  const w=this.#visit(row,index);
  if(oldOwner===1)this.#a-=w;else if(oldOwner===-1)this.#b-=w;
  if(newOwner===1)this.#a+=w;else this.#b+=w;
  if(row.extra){if(oldOwner===1)this.#extraA-=w;else if(oldOwner===-1)this.#extraB-=w;
   if(newOwner===1)this.#extraA+=w;else this.#extraB+=w;}
  return w
 }
 read(){
  if(this.#final)return {...this.#final};
  const progress=this.#count?this.#scanned/this.#count:0;
  const extraFloor={registeredTiles:this.#extraTiles,backedProjectedM2:this.#extraTotal,areaA:this.#extraA,areaB:this.#extraB};
  if(this.#scanned!==this.#count)return {status:'BUILDING',winner:'NONE',progress,extraFloor};
  if(this.#requireExtra&&this.#extraTotal<=0)return {status:'HOLD',winner:'NONE',progress,reason:'NO_BACKED_ADDITIONAL_FLOOR',extraFloor};
  if(this.#total<=0)return {status:'HOLD',winner:'NONE',progress,reason:'NO_BACKED_FLOOR',extraFloor};
  const total=this.#total,epsilon=Math.max(1e-8,total*1e-8);
  if(![total,this.#a,this.#b].every(Number.isFinite)||this.#a < -epsilon||this.#b < -epsilon||
     this.#a+this.#b>total+epsilon)return {status:'HOLD',winner:'NONE',progress:1,reason:'OWNERSHIP_AREA_INCONSISTENT',extraFloor};
  // Independent scan/paint summation can differ by a few ULPs. Correct only
  // tolerance-sized drift; never turn a materially inconsistent tally into a winner.
  let a=Math.min(total,Math.max(0,this.#a)),b=Math.min(total,Math.max(0,this.#b));
  if(a+b>total){const scale=total/(a+b);a*=scale;b*=scale;}
  return {status:'LIVE',winner:'NONE',progress:1,extraFloor,areaA:a,areaB:b,neutralArea:Math.max(0,total-a-b),
   totalProjectedM2:total,percentA:Math.min(100,(a/total)*100),percentB:Math.min(100,(b/total)*100)}
 }
 finish(tick){
  if(this.#final)return this.read();
  if(tick!==10800)return {status:'HOLD',winner:'NONE',reason:'ROUND_NOT_FINAL',progress:this.read().progress};
  const r=this.read();
  this.#final=r.status!=='LIVE'?{...r,status:'HOLD',winner:'NONE',reason:r.reason??'MASK_INCOMPLETE'}:
   {...r,status:'FINAL',winner:Math.abs(r.areaA-r.areaB)<=Math.max(1e-8,r.totalProjectedM2*1e-8)?'DRAW':r.areaA>r.areaB?'A':'B'};
  return this.read()
 }
}
export function f4ProvisionalTurfLabel(s){
 if(!s)return '';
 if(s.status==='BUILDING')return '暫定得点準備 '+Math.floor(100*s.progress)+'%';
 if(s.status==='HOLD')return '暫定得点 HOLD';
 const result=s.status==='FINAL'?' · '+(s.winner==='A'?'WIN':s.winner==='B'?'LOSE':'DRAW'):'';
 return '暫定 A '+s.percentA.toFixed(1)+'% / B '+s.percentB.toFixed(1)+'%'+result
}
