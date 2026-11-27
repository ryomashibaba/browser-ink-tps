// Provisional impact-time actor attribution, not original launch-life certification.
export class F4ProvisionalGauge {
 #actors=new Map();#closed=false;
 constructor(kit,pointsPerM2=10,retention=.5){
  if(!Number.isFinite(pointsPerM2)||pointsPerM2<=0||!Number.isFinite(retention)||retention<0||retention>1)throw Error('invalid calibration');
  this.kit=kit;this.pointsPerM2=pointsPerM2;this.retention=retention;
 }
 reset(){this.#actors.clear();this.#closed=false}
 close(){this.#closed=true}
 sync(actor,alive){
  if(this.#closed||!actor||!actor.actorId||!actor.lifeId||![1,-1].includes(actor.team)||!Object.hasOwn(this.kit,actor.weapon))return null;
  const old=this.#actors.get(actor.actorId);
  if(!old||old.weapon!==actor.weapon||old.team!==actor.team){
   const row={...actor,alive,points:0,activations:0};this.#actors.set(actor.actorId,row);return row;
  }
  if(old.lifeId!==actor.lifeId){
   if(old.alive)old.points*=this.retention;
   old.lifeId=actor.lifeId;old.alive=alive;
  }else if(old.alive&&!alive){old.alive=false;old.points*=this.retention}
  return old;
 }
 credit(actor,alive,area,blocked){
  const row=this.sync(actor,alive);
  if(!row||!row.alive||blocked||!Number.isFinite(area)||area<=0)return 0;
  const old=row.points;row.points=Math.min(this.kit[row.weapon].required,old+area*this.pointsPerM2);return row.points-old
 }
 state(id){
  const a=this.#actors.get(id);if(!a)return null;
  const required=this.kit[a.weapon].required;
  return {...a,required,ready:!this.#closed&&a.alive&&a.points>=required};
 }
 consume(id,lifeId){
  const a=this.#actors.get(id);
  if(!this.state(id)?.ready||a.lifeId!==lifeId)return false;
  a.points=0;a.activations++;return true
 }
 snapshot(){return [...this.#actors.keys()].map(id=>this.state(id))}
}
