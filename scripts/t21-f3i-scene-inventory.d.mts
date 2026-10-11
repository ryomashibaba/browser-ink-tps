export declare function createF3iSceneCollector():{
 line(line:string):void;
 finish():{
  background:number[];
  backgroundTriangles:number;backgroundObjects:number;backgroundFaceCount:number;
  backgroundExcludedFaces:number;actorFaceCount:number;actorTriangles:number;
  actorObjectCount:number;sourceVertices:number;
  largestUnplacedActors:Array<{
   name:string;faces:number;triangles:number;min:number[];max:number[]
  }>;
  actorPlacementRecovered:false;environmentStageRegistrationRecovered:false;
  traversalAuthorityRecovered:false;
 };
};
export declare function convertF3iSceneInventory(options:{
 input:string;output:string;allowTestFixture?:boolean
}):Promise<{
 schema:string;sourceSHA256:string;verifiedAgainstPinnedSource:boolean;
 coordinateSpace:string;stagePlayableAuthority:'NONE';productionAuthorization:false;
 stageCollisionSolidsAdded:0;navigationLinksAdded:0;scoreableSurfacesAdded:0;
 inferredFloorOrRouteAdded:0;actorPlacementRecovered:false;
 environmentStageRegistrationRecovered:false;traversalAuthorityRecovered:false;
 backgroundTriangleCount:number;backgroundObjectCount:number;backgroundFaceCount:number;
 backgroundExcludedFaces:number;actorObjectCount:number;actorFaceCount:number;
 actorTriangles:number;largestUnplacedActors:Array<{name:string;faces:number;
 triangles:number;min:number[];max:number[]}>;
 previewBin:{file:string;bytes:number;sha256:string}
}>;
