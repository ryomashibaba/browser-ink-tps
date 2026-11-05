/** Native T21 SOURCE-only user preference schema; local-only, no sim writes. */
export const SOURCE_CAMERA_PREFS_KEY='t21-source-player-camera-v1';
export interface SourceCameraPreferences{
 readonly version:1; readonly sensitivity:number;
 readonly invertY:boolean; readonly shoulder:'RIGHT'|'LEFT';
}
function valid(v:unknown):v is SourceCameraPreferences{
 if(!v||typeof v!=='object'||Array.isArray(v))return false;
 const p=v as Record<string,unknown>;
 return Object.keys(p).length===4&&p.version===1&&
  typeof p.sensitivity==='number'&&Number.isFinite(p.sensitivity)&&
  p.sensitivity>=.5&&p.sensitivity<=1.75&&
  Math.abs((p.sensitivity-.5)*4-Math.round((p.sensitivity-.5)*4))<1e-9&&
  typeof p.invertY==='boolean'&&
  (p.shoulder==='RIGHT'||p.shoulder==='LEFT');
}
export function parseSourceCameraPreferences(raw:string|null):SourceCameraPreferences|null{
 if(raw===null||raw.length>256)return null;
 try{const v:unknown=JSON.parse(raw);return valid(v)?v:null;}
 catch{return null;}
}
export function readSourceCameraPreferences(
 storage:Pick<Storage,'getItem'>
):SourceCameraPreferences|null{
 try{return parseSourceCameraPreferences(storage.getItem(SOURCE_CAMERA_PREFS_KEY));}
 catch{return null;}
}
export function writeSourceCameraPreferences(
 storage:Pick<Storage,'setItem'>,pref:SourceCameraPreferences
):boolean{
 if(!valid(pref))return false;
 try{storage.setItem(SOURCE_CAMERA_PREFS_KEY,JSON.stringify(pref));return true;}
 catch{return false;}
}
