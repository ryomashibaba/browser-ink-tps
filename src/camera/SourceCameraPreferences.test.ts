import {describe,expect,it} from 'vitest';
import {SOURCE_CAMERA_PREFS_KEY,parseSourceCameraPreferences,
 readSourceCameraPreferences,writeSourceCameraPreferences}
 from './SourceCameraPreferences';
const valid={version:1,sensitivity:1.25,invertY:true,shoulder:'LEFT'} as const;
describe('SOURCE-only saved camera prefs',()=>{
 it('saves and recovers native SOURCE replay camera without API',()=>{
  const map=new Map<string,string>();
  const store={getItem:(k:string)=>map.get(k)??null,
    setItem:(k:string,v:string)=>{map.set(k,v);}};
  expect(writeSourceCameraPreferences(store,valid)).toBe(true);
  expect(map.has(SOURCE_CAMERA_PREFS_KEY)).toBe(true);
  expect(readSourceCameraPreferences(store)).toEqual(valid);
 });
 it('rejects unauthenticated old, malformed, or overrange values',()=>{
  for(const s of ['undefined','{}','null','[]','{"version":2}',
    JSON.stringify({...valid,sensitivity:100}),
    JSON.stringify({...valid,sensitivity:.6}),
    JSON.stringify({...valid,shoulder:'CENTER'}),
    JSON.stringify({...valid,productionAuthorized:true}), 'x'.repeat(257)])
    expect(parseSourceCameraPreferences(s)).toBe(null);
 });
 it('restricted browser storage never breaks SOURCE practice',()=>{
  expect(readSourceCameraPreferences({getItem:()=>{throw Error('BLOCKED');}}))
   .toBe(null);
  expect(writeSourceCameraPreferences({
    setItem:()=>{throw Error('PRIVATE_MODE');}},valid)).toBe(false);
  expect(writeSourceCameraPreferences({setItem:()=>{}},
    {...valid,sensitivity:2})).toBe(false);
 });
});
