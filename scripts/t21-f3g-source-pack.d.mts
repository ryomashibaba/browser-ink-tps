export declare const PINNED_TEMPLE01_SHA256:string;
export declare const F3G_KINDS:readonly string[];
export declare function classifyStaticMaterial(material:string):string;
export declare function createF3gObjCollector(options?:{allowTestFixture?:boolean}):{
 line(line:string):void;
 finish():{perKind:Record<string,number[]>;vertexCount:number;totalFaces:number;ignoredFaces:number;triangleCount:number};
};
export declare function convertF3gOriginal(options:{
 input:string;output:string;allowTestFixture?:boolean
}):Promise<Record<string,unknown>>;
