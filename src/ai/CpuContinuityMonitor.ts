/**
 * Read-only QA witness of actual, committed CPU movement, never Crowd proposals.
 * Does not issue movement, reset agents, award paint or change navigation authority.
 * A "suspected stall" is diagnostic evidence, not a path-validity verdict.
 */
export interface CpuContinuitySample {
  id: string;
  x: number;
  y: number;
  z: number;
  lifeState: 'ACTIVE' | 'SPLATTED';
  mobilityState: string;
  hasAgent: boolean;
  /** True only when the last accepted tactical goal remains >1.5m away. */
  expectsMotion: boolean;
}

export interface CpuContinuityEntry {
  id: string;
  stationarySeconds: number;
  peakStationarySeconds: number;
  actualTravelMeters: number;
  suspectedNavigationStall: boolean;
  lifeState: string;
  mobilityState: string;
}

interface State extends CpuContinuityEntry {
  lastX: number;
  lastY: number;
  lastZ: number;
}
export interface CpuContinuityReport {
  source: 'ACTUAL_CPU_FOOT_QA_ONLY';
  suspectedStallCount: number;
  longestStallSeconds: number;
  actors: CpuContinuityEntry[];
}
const STALL_SECONDS=5;
const MIN_EXPECTED_METERS_PER_SECOND=0.08;
export class CpuContinuityMonitor {
  private readonly states = new Map<string, State>();

  public reset(): void { this.states.clear(); }

  public observe(dt: number, samples: readonly CpuContinuitySample[]): void {
    if (!Number.isFinite(dt) || dt <= 0 || dt > 0.5) return;
    const seen = new Set<string>();
    for(const s of samples){
      if(seen.has(s.id))throw Error('CPU_CONTINUITY_DUPLICATE_ACTOR');
      seen.add(s.id);
      if(![s.x,s.y,s.z].every(Number.isFinite))continue;
      const existing=this.states.get(s.id);
      const a:State=existing ?? {
        id:s.id,stationarySeconds:0,peakStationarySeconds:0,
        actualTravelMeters:0,suspectedNavigationStall:false,
        lifeState:s.lifeState,mobilityState:s.mobilityState,
        lastX:s.x,lastY:s.y,lastZ:s.z
      };
      const dx=s.x-a.lastX,dy=s.y-a.lastY,dz=s.z-a.lastZ;
      const travel=Math.hypot(dx,dy,dz);
      a.lastX=s.x;a.lastY=s.y;a.lastZ=s.z;
      a.lifeState=s.lifeState;a.mobilityState=s.mobilityState;
      a.actualTravelMeters+=travel;
      if(s.lifeState==='ACTIVE' && s.mobilityState==='GROUND' &&
         s.hasAgent && s.expectsMotion &&
         travel/dt<MIN_EXPECTED_METERS_PER_SECOND){
        a.stationarySeconds+=dt;
      }else{
        a.stationarySeconds=0;
      }
      a.peakStationarySeconds=Math.max(a.peakStationarySeconds,a.stationarySeconds);
      a.suspectedNavigationStall=a.stationarySeconds>=STALL_SECONDS;
      this.states.set(s.id,a);
    }
    for(const id of this.states.keys())if(!seen.has(id))this.states.delete(id);
  }

  public snapshot(): CpuContinuityReport {
    const actors=[...this.states.values()].map(s=>({
      id:s.id,stationarySeconds:s.stationarySeconds,
      peakStationarySeconds:s.peakStationarySeconds,
      actualTravelMeters:s.actualTravelMeters,
      suspectedNavigationStall:s.suspectedNavigationStall,
      lifeState:s.lifeState,mobilityState:s.mobilityState
    })).sort((a,b)=>a.id.localeCompare(b.id));
    return {
      source:'ACTUAL_CPU_FOOT_QA_ONLY',
      suspectedStallCount:actors.filter(a=>a.suspectedNavigationStall).length,
      longestStallSeconds:Math.max(0,...actors.map(a=>a.peakStationarySeconds)),
      actors
    };
  }
}
