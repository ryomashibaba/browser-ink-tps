import {spinnerChargeStage,spinnerShotOffsets,spinnerDamage,saberPlan,acceptSaberComponent} from "./chargeWeaponPlan.mjs";
function checkAll(spinnerChargeStage,spinnerShotOffsets,spinnerDamage,saberPlan,acceptSaberComponent){
 const ok=(x,m)=>{if(!x)throw Error(m);};
 ok(spinnerChargeStage(0).ring===0&&spinnerChargeStage(49).ring===0&&spinnerChargeStage(50).ring===1&&spinnerChargeStage(75).ring===2,"rings");
 ok(spinnerChargeStage(50).rangeProgress===spinnerChargeStage(75).rangeProgress&&spinnerChargeStage(62.5).secondProgress===.5,"range saturation");
 ok(spinnerShotOffsets(37).at(-1)===144&&spinnerShotOffsets(36).at(-1)===140&&spinnerShotOffsets(0).length===0,"boundary convention explicit");
 ok([0,11,15,19,30].map(spinnerDamage).join(",")==="30,30,22.5,15,15","damage decay");
 const h=saberPlan("HORIZONTAL"),c=saberPlan("CHARGED"),l=saberPlan("LUNGE");
 ok(h.collisionOffsetsRaw.length===3&&c.collisionOffsetsRaw.length===7&&h.slashDamage+h.projectileDamage===45&&c.slashDamage+c.projectileDamage===180,"shapes and two components");
 ok(h.inkPercent===3&&c.inkPercent===6&&l.inkPercent===6,"ink per action");
 ok(h.slashStartF===3&&h.projectileStartF===6&&l.slashStartF===14&&l.projectileStartF===17,"event delays");
 ok(h.splashMax===8&&c.splashMax===14&&h.burstF===4&&c.burstF===14,"splash profiles");
 const s=new Set();ok(acceptSaberComponent(s,"B1:1","SLASH")&&!acceptSaberComponent(s,"B1:1","SLASH")&&acceptSaberComponent(s,"B1:1","WAVE")&&!acceptSaberComponent(s,"B1:1","WAVE")&&acceptSaberComponent(s,"B2:1","WAVE")&&acceptSaberComponent(new Set(),"B1:1","WAVE"),"component dedup");
 let n=0;for(const f of [()=>spinnerDamage(-1),()=>spinnerShotOffsets(38),()=>saberPlan("INVALID"),()=>acceptSaberComponent(s,"","SLASH")])try{f()}catch{n++}ok(n===4,"invalid input");
 return 10;
}
console.log("checks passed:",checkAll(spinnerChargeStage,spinnerShotOffsets,spinnerDamage,saberPlan,acceptSaberComponent));
