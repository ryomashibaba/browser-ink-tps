export type F3kFamily={family:string;representativeObject:string;representativeTriangles:number};
export declare function createF3kFamilyCollector(families:readonly F3kFamily[]):{
 line(line:string):void;
 finish():Array<{family:string;object:string;expectedTriangles:number;
  positions:number[];triangles:number;min:number[];max:number[]}>;
};
export declare function convertF3kGallery(options:{input:string;output:string;
 families:readonly F3kFamily[];allowTestFixture?:boolean}):Promise<{
 schema:'T21_F3K_ISOLATED_SOURCE_FAMILY_GALLERY_V1';
 sourceSHA256:string;verifiedAgainstPinnedSource:boolean;
 sourceGeometrySpace:'ORIGINAL_OBJ_LOCAL_UNPLACED';
 viewerPlacement:'ISOLATED_NORMALIZED_SHOWCASE';
 stagePlayableAuthority:'NONE';productionAuthorization:false;
 instanceMatricesRecovered:false;actorPlacementRecovered:false;
 stageCollisionSolidsAdded:0;navigationLinksAdded:0;
 scoreableSurfacesAdded:0;inferredFloorOrRouteAdded:0;
 components:Array<{family:string;representativeObject:string;originalTriangles:number;
 min:number[];max:number[];file:string;bytes:number;sha256:string}>;
}>;
