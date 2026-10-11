export declare const F3L_MTL_BLOB_SHA:string;
export declare const F3L_KITRIX_COMMIT:string;
export declare function parseF3lOriginalMtl(source:string|Uint8Array):Map<string,string|null>;
export declare function createF3lUvCollector(mtl:Map<string,string|null>):{
 line(line:string):void;
 finish():{groups:Array<{material:string;kind:string;texture:string|null;
  floats:number[];triangles:number}>;triangles:number;acceptedFaces:number;
  skippedNoUv:number;ignoredFaces:number;positionCount:number;uvCount:number};
};
export declare function convertF3lOriginal(args:{input:string;mtl:string;
 output:string;allowTestFixture?:boolean}):Promise<{
 schema:string;sourceSHA256:string;sourceMtlBlobSha:string;
 sourceRepositoryCommit:string;verifiedAgainstPinnedSource:boolean;
 totalTriangles:number;triangleCountWithoutSourceUV:number;
 textureFiles:string[];materials:Array<{name:string;kind:string;
 triangles:number;file:string;bytes:number;sha256:string;texture:string|null}>;
 stagePlayableAuthority:'NONE';productionAuthorization:false;
 actorMatricesRecovered:false;physicsSolidsAdded:0;navigationLinksAdded:0;scoreableSurfacesAdded:0;
}>;
