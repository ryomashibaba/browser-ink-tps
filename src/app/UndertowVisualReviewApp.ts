import {
  AppBase,
  AppOptions,
  calculateNormals,
  CameraComponentSystem,
  Color,
  ContainerHandler,
  CULLFACE_NONE,
  BLEND_NORMAL,
  createGraphicsDevice,
  DEVICETYPE_WEBGPU,
  DEVICETYPE_WEBGL2,
  Entity,
  FILLMODE_FILL_WINDOW,
  LightComponentSystem,
  Mesh,
  MeshInstance,
  RenderComponentSystem,
  RESOLUTION_AUTO,
  StandardMaterial,
  TextureHandler,
  Vec3
} from 'playcanvas';
import { rasterizeStageFootprint } from '../stage/StageFootprint';
import type { StageFootprint, StageFootprintPoint } from '../stage/StageFootprint';
import type {
  StageNavigationLinkDefinition,
  StageSolidDefinition,
  StageVector3
} from '../stage/StageDefinition';
import type { MetricXZ } from '../stage/measurement/StageMapCalibration';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_T21_MACRO_COVERAGE,
  UNDERTOW_T21_MACRO_OCCUPANCY_ENVELOPE,
  UNDERTOW_T21_MACRO_OUTER_BOUNDARY,
  UNDERTOW_T21_MACRO_REVIEW_SURFACES,
  UNDERTOW_T21_MACRO_UNRESOLVED_OUTLINES,
  type UndertowMacroCoverageStatus,
  type UndertowMacroReviewOutline,
  type UndertowMacroReviewSurface
} from '../stage/undertow/UndertowSpillwayMacroCoverage';
import {
  UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
  UNDERTOW_T21_SOURCE_NATIVE_REVIEW_SUMMARY,
  type UndertowSourceNativeReviewMesh
} from '../stage/undertow/UndertowSpillwaySourceNativeReviewGeometry';
import {
  UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
  UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY
} from '../stage/undertow/UndertowSpillwaySourceNativeSupplementGeometry';
import { UNDERTOW_T21_VISUAL_REVIEW } from '../stage/undertow/UndertowSpillwayVisualReview';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES, UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY } from '../stage/undertow/UndertowSpillwaySourceNativePhase1Geometry';
import { UNDERTOW_T21_SOURCE_BATCH2_MESHES, UNDERTOW_T21_SOURCE_BATCH2_SUMMARY } from '../stage/undertow/UndertowSpillwaySourceBatch2Geometry';
import { UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES, UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY } from '../stage/undertow/UndertowSpillwayBroadStaticSourceGeometry';
import { UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES, UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY } from '../stage/undertow/UndertowSpillwayFlankElevationPhase4Geometry';
import { UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES, UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY } from '../stage/undertow/UndertowSpillwayVerticalSourcePhase5BGeometry';
import { UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES, UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY } from '../stage/undertow/UndertowSpillwayHighSourcePhase6Geometry';
import { UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES, UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY } from '../stage/undertow/UndertowSpillwayPhase7FramedSourceGeometry';
import { UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES, UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY } from '../stage/undertow/UndertowSpillwayPhase8StaticSourceGeometry';
import { UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES, UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY } from '../stage/undertow/UndertowSpillwayPhase9DownfaceSourceGeometry';
import { UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE, UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_SUMMARY, type UndertowPhase10EdgeEvidence } from '../stage/undertow/UndertowSpillwayPhase10EdgeDiagnosticGeometry';
import { UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES, UNDERTOW_T21_PHASE11_CENTRAL_GAP_SUMMARY } from '../stage/undertow/UndertowSpillwayPhase11NearestSourceDiagnostic';
import {UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES,UNDERTOW_T21_PHASE12_FAMILY_SUMMARY} from '../stage/undertow/UndertowSpillwayPhase12SourceFamilyGeometry';
import {UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES,UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_SUMMARY} from '../stage/undertow/UndertowSpillwayPhase12CEligibleFullSourceGeometry';

type ReviewView = 'OVERVIEW' | 'TOP' | 'POS_TO_NEG' | 'SPAWN_A' | 'SPAWN_B' | 'CENTER_SOURCE';
type ReviewLayerPreset = 'WALK_SOURCE' | 'THREE_DIMENSIONAL' | 'ALL_EVIDENCE';

interface ReviewMaterials {
  paintBacked: StandardMaterial;
  structure: StandardMaterial;
  visualOnly: StandardMaterial;
  supportOnly: StandardMaterial;
  occupancy: StandardMaterial;
  sourceNative: StandardMaterial;
  sourceLocal: StandardMaterial;
  sourceVerticalGlass: StandardMaterial;
  sourceVerticalMetal: StandardMaterial;
  sourceVerticalPillar: StandardMaterial;
  sourceHighStructure: StandardMaterial;
  sourcePhase7SideSupports: StandardMaterial;
  sourcePhase7GlassFrame: StandardMaterial;
  sourcePhase8CentralTowers: StandardMaterial;
  sourcePhase8FlankHigh: StandardMaterial;
  sourcePhase8EdgeFacing: StandardMaterial;
  sourcePhase9CenterUnder: StandardMaterial;
  sourcePhase9FenceUnder: StandardMaterial;
  sourcePhase9MegalithUnder: StandardMaterial;
  sourcePhase10CoordinateSeam: StandardMaterial;
  sourcePhase10UnmatchedEdge: StandardMaterial;
  sourcePhase11OriginalNearby: StandardMaterial;
  sourcePhase12FloorLine: StandardMaterial;
  sourcePhase12WallMetal: StandardMaterial;
  sourcePhase12Pillar: StandardMaterial;
  sourcePhase12Glass: StandardMaterial;
  sourcePhase12GlassEdge: StandardMaterial;
  confirmedBoundary: StandardMaterial;
  provisional: StandardMaterial;
  unresolved: StandardMaterial;
  spawnA: StandardMaterial;
  spawnB: StandardMaterial;
  nav: StandardMaterial;
}

export class UndertowVisualReviewApp {
  public static async boot(
    canvas: HTMLCanvasElement,
    uiRoot: HTMLElement
  ): Promise<UndertowVisualReviewApp> {
    // Chrome headless WebGPU may boot successfully yet stall CDP screenshots on
    // software drivers. Explicit reviewRenderer=webgl2 is isolated to this
    // REVIEW app, with no production runtime/device changes.
    const explicitWebGL2=new URL(window.location.href).searchParams.get('reviewRenderer')==='webgl2';
    const device = await createGraphicsDevice(canvas, {
      deviceTypes: explicitWebGL2
        ? [DEVICETYPE_WEBGL2]
        : [DEVICETYPE_WEBGPU, DEVICETYPE_WEBGL2],
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance'
    });
    device.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.dataset.t21ReviewRenderer = (device as { deviceType?: string }).deviceType ?? 'unreported';

    const options = new AppOptions();
    options.graphicsDevice = device;
    options.componentSystems = [
      RenderComponentSystem,
      CameraComponentSystem,
      LightComponentSystem
    ];
    options.resourceHandlers = [TextureHandler, ContainerHandler];

    const app = new AppBase(canvas);
    app.init(options);
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);

    return new UndertowVisualReviewApp(app, canvas, uiRoot);
  }

  private readonly materials: ReviewMaterials;
  private readonly camera: Entity;
  private readonly target = new Vec3();
  private readonly confirmedRoot = new Entity('T21Review:Confirmed');
  private readonly occupancyRoot = new Entity('T21Review:MacroOccupancyEnvelope');
  private readonly sourceNativeRoot = new Entity('T21Review:SourceNativeCandidates');
  private readonly sourceLocalRoot = new Entity('T21Review:SourceLocalCandidates');
  private readonly sourceBatch2Root = new Entity('T21Review:SourceTerrainBatch2');
  private readonly broadStaticRoot = new Entity('T21Review:BroadStaticSourceTerrain');
  private readonly flankElevationPhase4Root = new Entity('T21Review:FlankElevationPhase4');
  private readonly verticalSourcePhase5BRoot = new Entity('T21Review:VerticalSourcePhase5B');
  private readonly highSourcePhase6Root = new Entity('T21Review:HighStructurePhase6');
  private readonly sideSupportsPhase7Root = new Entity('T21Review:SideSupportsPhase7');
  private readonly glassFramesPhase7Root = new Entity('T21Review:MidGlassFramesPhase7');
  private readonly centralTowersPhase8Root = new Entity('T21Review:SourceCentralTowersPhase8');
  private readonly flankHighPhase8Root = new Entity('T21Review:SourceFlankHighPhase8');
  private readonly sideEdgePhase8Root = new Entity('T21Review:SourceSideEdgePhase8');
  private readonly centerDownfacePhase9Root = new Entity('T21Review:CenterDownfacePhase9');
  private readonly fenceDownfacePhase9Root = new Entity('T21Review:FlankFenceDownfacePhase9');
  private readonly megalithDownfacePhase9Root = new Entity('T21Review:MegalithDownfacePhase9');
  private readonly coordinateSeamPhase10Root = new Entity('T21Review:Phase10NonWeldedCoordinateEdges');
  private readonly unmatchedEdgePhase10Root = new Entity('T21Review:Phase10UnmatchedSourceEdges');
  private readonly nearestOriginalPhase11Root = new Entity('T21Review:Phase11ExactNearbyOriginalTriangles');
  private readonly sourceFamiliesPhase12Root = new Entity('T21Review:Phase12OriginalSourceFamilyFaces');
  private readonly completeSourcePhase12CRoot = new Entity('T21Review:Phase12CCompleteOriginalSource');
  private readonly provisionalRoot = new Entity('T21Review:ProvisionalMacro');
  private readonly unresolvedRoot = new Entity('T21Review:Unresolved');
  private readonly navRoot = new Entity('T21Review:Navigation');
  private readonly keys = new Set<string>();
  private readonly layerToggleBindings: Array<{button:HTMLButtonElement;root:Entity;label:string}> = [];
  private yawDegrees = 35;
  private pitchDegrees = 42;
  private distanceMeters = 70;
  private dragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  private constructor(
    private readonly app: AppBase,
    private readonly canvas: HTMLCanvasElement,
    private readonly uiRoot: HTMLElement
  ) {
    document.title = 'Ink TPS — T21 Undertow Visual Review v2';
    this.materials = createReviewMaterials();
    this.camera = this.createCamera();
    this.createLighting();
    this.buildReviewedGeometry();
    this.buildMacroCoverageReviewGeometry();
    this.buildSpawnMarkers();
    this.buildNavigationMarkers();
    this.createReviewPanel();
    this.bindControls();
    // URL state is for deterministic five-view evidence only. It changes
    // inert renderer visibility/camera, never runtime stage/collision state.
    const params=new URL(window.location.href).searchParams;
    const requestedPreset=params.get('reviewPreset');
    if(requestedPreset==='WALK_SOURCE'||requestedPreset==='THREE_DIMENSIONAL'||
       requestedPreset==='ALL_EVIDENCE')this.applyReviewLayerPreset(requestedPreset);
    const requestedView=params.get('reviewView');
    const view:ReviewView=
      requestedView==='TOP'||requestedView==='POS_TO_NEG'||
      requestedView==='SPAWN_A'||requestedView==='SPAWN_B'||
      requestedView==='CENTER_SOURCE'
        ?requestedView:'OVERVIEW';
    this.setView(view);
    if(params.get('reviewNearestCentral')==='1'){
      this.nearestOriginalPhase11Root.enabled=true;
      this.canvas.dataset.t21ReviewNearestCentral='on';
      this.refreshReviewLayerButtons();
    }
    if(params.get('reviewSourceFamilies')==='1'){
      this.sourceFamiliesPhase12Root.enabled=true;
      this.canvas.dataset.t21ReviewSourceFamilies='on';
      this.refreshReviewLayerButtons();
    }
    if(params.get('reviewCompleteCentral')==='1'){
      this.completeSourcePhase12CRoot.enabled=true;
      this.sourceFamiliesPhase12Root.enabled=false;
      this.canvas.dataset.t21ReviewSourceFamilies='off';
      this.canvas.dataset.t21ReviewCompleteCentral='on';
      this.refreshReviewLayerButtons();
    }
    if(params.get('reviewTopologyEdges')==='1'){
      this.coordinateSeamPhase10Root.enabled=true;
      this.unmatchedEdgePhase10Root.enabled=true;
      this.canvas.dataset.t21ReviewTopology='on';
      this.refreshReviewLayerButtons();
    }
    this.updateCamera();

    this.app.on('update', (dt: number) => {
      this.updateKeyboardNavigation(
        Number.isFinite(dt) ? Math.min(Math.max(dt, 0), 0.05) : 0
      );
      this.updateCamera();
    });
    window.addEventListener('resize', () => this.app.resizeCanvas());
    this.app.start();
  }

  private createCamera(): Entity {
    const world = this.app.scene.layers.getLayerByName('World');
    if (!world) throw new Error('PlayCanvas World layer is unavailable.');

    const camera = new Entity('T21Review:Camera');
    camera.addComponent('camera', {
      clearColor: new Color(0.025, 0.035, 0.045, 1),
      nearClip: 0.1,
      farClip: 500,
      fov: 55,
      layers: [world.id]
    });
    this.app.root.addChild(camera);
    return camera;
  }

  private createLighting(): void {
    this.app.scene.ambientLight = new Color(0.54, 0.58, 0.64);

    const key = new Entity('T21Review:KeyLight');
    key.addComponent('light', {
      type: 'directional',
      color: new Color(1, 0.97, 0.92),
      intensity: 1.55,
      castShadows: true,
      shadowResolution: 2048
    });
    key.setEulerAngles(52, -32, 0);
    this.app.root.addChild(key);

    const fill = new Entity('T21Review:FillLight');
    fill.addComponent('light', {
      type: 'omni',
      color: new Color(0.30, 0.72, 0.96),
      intensity: 1.2,
      range: 90,
      castShadows: false
    });
    fill.setPosition(0, 18, 0);
    this.app.root.addChild(fill);
  }

  private buildReviewedGeometry(): void {
    this.app.root.addChild(this.confirmedRoot);
    const paintBackings = new Set(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.map(
        surface => surface.backingSolidId
      )
    );

    for (const solid of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids) {
      const material = paintBackings.has(solid.id)
        ? this.materials.paintBacked
        : solid.render === false
          ? this.materials.supportOnly
          : solid.collisionEnabled === false && solid.navigationEnabled === false
            ? this.materials.visualOnly
            : this.materials.structure;
      createReviewSolid(this.app, this.confirmedRoot, solid, material);
    }
  }

  private buildMacroCoverageReviewGeometry(): void {
    this.app.root.addChild(this.occupancyRoot);
    this.app.root.addChild(this.sourceNativeRoot);
    this.app.root.addChild(this.sourceLocalRoot);
    this.app.root.addChild(this.sourceBatch2Root);
    this.app.root.addChild(this.broadStaticRoot);
    this.app.root.addChild(this.flankElevationPhase4Root);
    this.app.root.addChild(this.verticalSourcePhase5BRoot);
    this.app.root.addChild(this.highSourcePhase6Root);
    this.app.root.addChild(this.sideSupportsPhase7Root);
    this.app.root.addChild(this.glassFramesPhase7Root);
    this.app.root.addChild(this.centralTowersPhase8Root);
    this.app.root.addChild(this.flankHighPhase8Root);
    this.app.root.addChild(this.sideEdgePhase8Root);
    this.app.root.addChild(this.centerDownfacePhase9Root);
    this.app.root.addChild(this.fenceDownfacePhase9Root);
    this.app.root.addChild(this.megalithDownfacePhase9Root);
    this.app.root.addChild(this.coordinateSeamPhase10Root);
    this.app.root.addChild(this.unmatchedEdgePhase10Root);
    this.app.root.addChild(this.nearestOriginalPhase11Root);
    this.app.root.addChild(this.sourceFamiliesPhase12Root);
    this.app.root.addChild(this.completeSourcePhase12CRoot);
    this.app.root.addChild(this.provisionalRoot);
    this.app.root.addChild(this.unresolvedRoot);

    createMacroOccupancyEnvelope(
      this.occupancyRoot,
      this.materials.occupancy
    );

    for (const sourceMesh of UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES) {
      createSourceNativeReviewMesh(
        this.app,
        this.sourceNativeRoot,
        sourceMesh,
        this.materials.sourceNative
      );
    }

    // Additional exact source terrain: distinct from both runtime and the older
    // frozen 16+10 source batches; original source Y is retained by mesh builder.
    for (const sourceMesh of UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES) {
      createSourceNativeReviewMesh(
        this.app,
        this.sourceNativeRoot,
        sourceMesh,
        this.materials.sourceNative
      );
    }

    for (const sourceMesh of UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES) {
      createSourceNativeReviewMesh(
        this.app,
        this.sourceLocalRoot,
        sourceMesh,
        this.materials.sourceLocal
      );
    }

    // These source components contain original Temple01 triangles/Y, but
    // some originate from PntSet meshes without actor-layout binding. Keep
    // separate from confirmed terrain and allow reviewers to toggle them.
    for (const sourceMesh of UNDERTOW_T21_SOURCE_BATCH2_MESHES) {
      createSourceNativeReviewMesh(
        this.app,
        this.sourceBatch2Root,
        sourceMesh,
        this.materials.sourceLocal
      );
    }

    // Three new large exact Fld_Temple01 floor pairs, independently source-audited.
    // Rendering creates no Rapier, Recast, paint, score or kill authority.
    for (const sourceMesh of UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES) {
      createSourceNativeReviewMesh(
        this.app,
        this.broadStaticRoot,
        sourceMesh,
        this.materials.sourceNative
      );
    }

    // Reviewed from WHOLE-STAGE Temple01 source, not runtime-activated.
    // Separate toggle enables five-view side-flank/elevation visibility review.
    for (const sourceMesh of UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES) {
      createSourceNativeReviewMesh(
        this.app,
        this.flankElevationPhase4Root,
        sourceMesh,
        this.materials.sourceNative
      );
    }

    // Exact vertical Temple01 source *faces*, NOT gameplay walls or a whole
    // closed 3D component. Visually colored by source material, with a separate
    // toggle from 64 upward-walk-source triangles and stage-runtime solids.
    for (const sourceMesh of UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES) {
      const material=sourceMesh.visualKind==='GLASS'
        ? this.materials.sourceVerticalGlass
        : sourceMesh.visualKind==='METAL_WALL'
        ? this.materials.sourceVerticalMetal
        : this.materials.sourceVerticalPillar;
      createSourceNativeReviewMesh(
        this.app,
        this.verticalSourcePhase5BRoot,
        sourceMesh,
        material
      );
    }

    // Verified original source-facing panels only, NOT a continuous roof.
    for (const sourceMesh of UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES) {
      createSourceNativeReviewMesh(this.app, this.highSourcePhase6Root,
        sourceMesh, this.materials.sourceHighStructure);
    }

    // Only ORIGINAL Temple01 source near-vertical triangle faces. The
    // continuous three-tier side supports and four-layer glass frames are
    // display evidence, NOT verified closed collision solids or glass rules.
    for(const sourceMesh of UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES){
      const side=sourceMesh.kind==='SIDE_SUPPORT';
      createSourceNativeReviewMesh(this.app,
        side?this.sideSupportsPhase7Root:this.glassFramesPhase7Root,
        sourceMesh,
        side?this.materials.sourcePhase7SideSupports:this.materials.sourcePhase7GlassFrame);
    }

    // Phase8: the exact 16 original source near-vertical face meshes.
    // In particular a source object named FloorLine02 is NOT a walkable
    // floor, route, collision surface or confirmed closed wall.
    for(const sourceMesh of UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES){
      const isTower=sourceMesh.kind==='CENTRAL_TOWER';
      const isFlank=sourceMesh.kind==='FLANK_HIGH_SUPPORT';
      createSourceNativeReviewMesh(
        this.app,
        isTower?this.centralTowersPhase8Root:
          isFlank?this.flankHighPhase8Root:this.sideEdgePhase8Root,
        sourceMesh,
        isTower?this.materials.sourcePhase8CentralTowers:
          isFlank?this.materials.sourcePhase8FlankHigh:
            this.materials.sourcePhase8EdgeFacing
      );
    }

    // Phase9 original down-facing faces: orientation evidence ONLY, not
    // proven playable floors, ceiling colliders or game-visible undersides.
    for(const sourceMesh of UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES){
      const isCenter=sourceMesh.kind==='CENTER_UNDER_METAL';
      const isFence=sourceMesh.kind==='FLANK_FENCE_UNDER';
      createSourceNativeReviewMesh(
        this.app,
        isCenter?this.centerDownfacePhase9Root:
          isFence?this.fenceDownfacePhase9Root:this.megalithDownfacePhase9Root,
        sourceMesh,
        isCenter?this.materials.sourcePhase9CenterUnder:
          isFence?this.materials.sourcePhase9FenceUnder:
            this.materials.sourcePhase9MegalithUnder
      );
    }

    // Pinpoint original unverified seam edges, never construct bridges/ramps.
    // Diagnostic line segments are OFF by default even in All Evidence mode.
    for(const edge of UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE){
      if(edge.tier==='EXACT_ORIGINAL_OBJ_VERTEX_ID_EDGE')continue;
      const coordOnly=edge.tier==='COINCIDENT_XYZ_ONLY_NOT_WELDED';
      createPhase10SourceEdgeDiagnostic(
        coordOnly?this.coordinateSeamPhase10Root:this.unmatchedEdgePhase10Root,
        edge,
        coordOnly?this.materials.sourcePhase10CoordinateSeam:
          this.materials.sourcePhase10UnmatchedEdge
      );
    }

    // Phase11 opt-in diagnostic: the 16 closest ACTUAL original source
    // triangles around the center underfaces. These are individual source
    // samples, NOT complete source components or playable connectors.
    for(const triangle of UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES){
      createSourceNativeReviewMesh(
        this.app,this.nearestOriginalPhase11Root,triangle,
        this.materials.sourcePhase11OriginalNearby
      );
    }

    // The distinct original Phase12 face samples are opt-in diagnostics only.
    // Never count these as 16 additional full mesh components or walkable floors.
    for(const face of UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES){
      const material=face.sourceFamily==='FloorLine02'?this.materials.sourcePhase12FloorLine:
        face.sourceFamily==='WallMetal00'?this.materials.sourcePhase12WallMetal:
        face.sourceFamily==='PillarBase02'?this.materials.sourcePhase12Pillar:
        face.sourceFamily==='Glass01'?this.materials.sourcePhase12Glass:
        this.materials.sourcePhase12GlassEdge;
      createSourceNativeReviewMesh(this.app,this.sourceFamiliesPhase12Root,face,material);
    }
    // Eight fully sourced 12C originals are separately gated and OFF by default.
    // No inferred infill, gameplay geometry, floor/bridge collider or route.
    for(const c of UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES){
      const mat=c.sourceFamily==='WallMetal00'?this.materials.sourcePhase12WallMetal:
        c.sourceFamily==='FloorLine02'?this.materials.sourcePhase12FloorLine:
        this.materials.sourcePhase12GlassEdge;
      createSourceNativeReviewMesh(this.app,this.completeSourcePhase12CRoot,c,mat);
    }
    for (const surface of UNDERTOW_T21_MACRO_REVIEW_SURFACES) {
      createMacroReviewSurface(
        this.provisionalRoot,
        surface,
        this.materials.provisional
      );
    }
    for (const outline of UNDERTOW_T21_MACRO_UNRESOLVED_OUTLINES) {
      createMacroReviewOutline(
        this.unresolvedRoot,
        outline,
        this.materials.unresolved
      );
    }
    createPlanLineLoop(
      this.confirmedRoot,
      'T21Review:HardPlayableSilhouette',
      UNDERTOW_T21_MACRO_OUTER_BOUNDARY,
      -1.64,
      this.materials.confirmedBoundary,
      0.09
    );
  }

  private buildSpawnMarkers(): void {
    createMarker(
      this.app,
      'T21Review:SpawnA',
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.teamASpawnFloorPoint,
      this.materials.spawnA,
      0.75
    );
    createMarker(
      this.app,
      'T21Review:SpawnB',
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.teamBSpawnFloorPoint,
      this.materials.spawnB,
      0.75
    );
  }

  private buildNavigationMarkers(): void {
    this.navRoot.enabled = false;
    this.app.root.addChild(this.navRoot);
    for (const link of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks) {
      createNavigationMarker(this.navRoot, link, this.materials.nav);
    }
  }

  private createReviewPanel(): void {
    const bounds = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.worldBounds;
    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxZ - bounds.minZ;
    const counts = UNDERTOW_T21_MACRO_COVERAGE.statusCounts;
    const panel = document.createElement('section');
    panel.id = 't21-review-panel';
    panel.className = 'panel v2';
    panel.innerHTML = `
      <div class="review-title">
        <strong>T21 UNDERTOW VISUAL REVIEW v2</strong>
        <span>REVIEW ONLY</span>
      </div>
      <p class="review-warning"><b>T20 production unchanged.</b> Source-based 3D preview ONLY — not playable geometry or a confirmed floor.</p>
      <p class="review-camera-status">Camera: <b id="t21-review-active-view">OVERVIEW</b> <small>· 5-view source evidence</small></p>
      <details class="review-source-explanation">
        <summary>Color legend & evidence limits</summary>
        <p>Cyan is reviewed/confirmed broad geometry; orange is Temple01 original source XYZ/Y with gameplay authority pending. Dark amber is the whole-stage XZ occupancy outline, not a floor. Light orange includes locally audited source and PntSet actor placement still unresolved. Yellow is provisional XZ-only macro coverage; red flags unresolved details. Black exterior remains omitted. Source face colors do not indicate in-game collision, painting, ceiling or traversal.</p>
      </details>
      <details class="review-metrics"><summary>Metrics — 18 regions · 124 original-source display meshes</summary>
      <div class="review-stats macro">
        <span>Macro regions</span><b>${UNDERTOW_T21_VISUAL_REVIEW.macroRegionCount}</b>
        <span>Stage occupancy envelope</span><b>42-vertex XZ / NOT FLOOR</b>
        <span>Source-native review meshes</span><b>${UNDERTOW_T21_SOURCE_NATIVE_REVIEW_SUMMARY.meshCount} / ${UNDERTOW_T21_SOURCE_NATIVE_REVIEW_SUMMARY.totalSourceAreaSquareMeters.toFixed(1)} m²</b>
        <span>Additional local source meshes</span><b>${UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY.meshCount} / ${UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY.totalSourceAreaSquareMeters.toFixed(1)} m²</b>
        <span>Phase 1 exact terrain source meshes</span><b>${UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY.meshCount} / ${UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY.totalSourceTriangleAreaSquareMeters.toFixed(1)} m² (source triangles, not extra XZ)</b>
        <span>Source terrain batch 2</span><b>${UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.meshCount} / ${UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.sourceAreaSquareMeters.toFixed(1)} m² (8 PntSet actor placements pending)</b>
        <span>Broad static source floors</span><b>${UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY.meshCount} / ${UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY.totalSourceAreaSquareMeters.toFixed(1)} m² (source triangles, not newly displayed XZ)</b>
        <span>Phase 4 flank / high-ramp source</span><b>${UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY.meshCount} / ${UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY.sourceTriangleAreaSquareMeters.toFixed(1)} m² (unmodified 3D source triangles)</b>
        <span>Phase 5B vertical source (non-floor)</span><b>${UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY.meshCount} / ${UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY.sourceTriangleAreaSquareMeters.toFixed(1)} m² (exact original wall/glass/pillar facing triangle area)</b>
        <span>Phase 6 high source panels (NOT game roof)</span><b>${UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY.registeredOriginalMeshes} displayed / ${UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY.originalSourceCandidatePairs} audited high pairs; ${UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY.sourceTriangleAreaSquareMeters.toFixed(1)} m² original 3D triangles</b>
        <span>Phase 7 vertical source support + glass frames (NOT floor)</span><b>${UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY.sourceMeshCount} faces / ${UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY.sourceTriangleAreaSquareMeters.toFixed(1)} m² original 3D triangles</b>
        <span>Phase 8 towers / flank / edge source (NOT floor)</span><b>${UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY.originalComponentCount} original source meshes / ${UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY.originalSource3DAreaSquareMeters.toFixed(1)} m² 3D triangle area, 0 new verified floor</b>
        <span>Phase 9 down-facing source (NOT verified underside collider)</span><b>${UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY.sourceComponentCount} original face meshes / ${UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY.original3DTriangleAreaSquareMeters.toFixed(1)} m² 3D triangle area, no additional floor authority</b>
        <span>Phase 10 original boundary-edge topology</span><b>${UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_SUMMARY.sharedOriginalOBJVertexIDs} original welded IDs / ${UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_SUMMARY.coordinateOnlySeams} coordinate-only / ${UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_SUMMARY.unmatchedSourceEdges} unmatched; ZERO proven gameplay connections</b>
        <span>Phase 11 closest center source, NOT connected geometry</span><b>${UNDERTOW_T21_PHASE11_CENTRAL_GAP_SUMMARY.sourceTouchingZeroMeterEdges} edge-to-triangle contact at 0m / ${UNDERTOW_T21_PHASE11_CENTRAL_GAP_SUMMARY.source2Point55CentimeterGapEdges} at 0.0255m; 16 source triangles, 0 new original display components</b>
        <span>Phase12 center original family samples</span><b>${UNDERTOW_T21_PHASE12_FAMILY_SUMMARY.sourceFaceSamples} source triangles / ${UNDERTOW_T21_PHASE12_FAMILY_SUMMARY.materialFamilies} materials / 0 new default full components / connectivity UNKNOWN</b>
        <span>Phase12C separately optional complete original components</span><b>${UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_SUMMARY.originalSourceComponentCount} full original pieces / ${UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_SUMMARY.originalTriangleCount} source triangles / ${UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_SUMMARY.source3DAreaSquareMeters.toFixed(2)} m² source area; OFF by default; not floor</b>
         <span>Confirmed / provisional</span><b>${counts.CONFIRMED_GEOMETRY} / ${counts.PROVISIONAL_MACRO_GEOMETRY}</b>
        <span>Exists-only / unresolved</span><b>${counts.EXISTS_BUT_NOT_IMPLEMENTED} / ${counts.UNRESOLVED}</b>
        <span>Intentional void/outside</span><b>${counts.INTENTIONAL_VOID_OR_WATER}</b>
        <span>Reviewed solids / paint surfaces</span><b>${UNDERTOW_T21_VISUAL_REVIEW.solidCount} / ${UNDERTOW_T21_VISUAL_REVIEW.paintSurfaceCount}</b>
        <span>Navigation links</span><b>${UNDERTOW_T21_VISUAL_REVIEW.navigationLinkCount}</b>
        <span>World X/Z span</span><b>${width.toFixed(1)} × ${depth.toFixed(1)} m</b>
      </div>
      </details>
      <div class="review-actions presets">
        <button data-review-preset="WALK_SOURCE">Walk-source only</button>
        <button data-review-preset="THREE_DIMENSIONAL">Floors + 3D structure</button>
        <button data-review-preset="ALL_EVIDENCE">All evidence layers</button>
      </div>
      <p class="review-detail-note">Phase10 source-edge diagnostic: <b>orange = 30 same-XYZ / different OBJ IDs</b>, <b>red = 18 no exact edge match</b>, welded source edges = 0. Phase11 <b>yellow = 16 nearest original source triangle samples</b>: eight 0m source contacts, eight 2.55cm gaps. Neither represents a connected walkable path or game collider. Phase12: mint=FloorLine02, coral=WallMetal00, purple=PillarBase02, blue=Glass01, pink=GlassEdge00; all 16 original-face diagnostics only.</p>
      <div class="review-actions views">
        <button data-review-view="OVERVIEW">Overview</button>
        <button data-review-view="TOP">Top</button>
        <button data-review-view="POS_TO_NEG">POS → Center → NEG</button>
        <button data-review-view="SPAWN_A">Spawn A / POS</button>
        <button data-review-view="SPAWN_B">Spawn B / NEG</button>
        <button data-review-view="CENTER_SOURCE">Center source close-up</button>
      </div>
      <div class="review-actions layers">
        <button id="t21-review-confirmed-toggle">Confirmed ON</button>
        <button id="t21-review-occupancy-toggle">Stage envelope ON</button>
        <button id="t21-review-source-native-toggle">Source mesh ON</button>
        <button id="t21-review-source-local-toggle">Local source ON</button>
        <button id="t21-review-source-batch2-toggle">Terrain batch 2 ON</button>
        <button id="t21-review-broad-static-toggle">Broad static floors ON</button>
        <button id="t21-review-flank-phase4-toggle">Flanks / high ramps ON</button>
        <button id="t21-review-vertical-phase5b-toggle">Vertical source faces ON</button>
        <button id="t21-review-high-phase6-toggle">High source panels ON</button>
        <button id="t21-review-side-supports-phase7-toggle">Source side supports ON</button>
        <button id="t21-review-glass-frames-phase7-toggle">Source glass frames ON</button>
        <button id="t21-review-central-towers-phase8-toggle">Central source towers ON</button>
        <button id="t21-review-flank-high-phase8-toggle">Flank high supports ON</button>
        <button id="t21-review-side-edge-phase8-toggle">Source edge faces ON</button>
        <button id="t21-review-center-downface-phase9-toggle">Center downfaces ON</button>
        <button id="t21-review-fence-downface-phase9-toggle">Flank fence downfaces ON</button>
        <button id="t21-review-megalith-downface-phase9-toggle">Megalith downfaces ON</button>
        <button id="t21-review-coordinate-seams-phase10-toggle">Phase10 non-welded edges OFF</button>
        <button id="t21-review-unmatched-edges-phase10-toggle">Phase10 unmatched edges OFF</button>
        <button id="t21-review-nearest-phase11-toggle">Phase11 nearest source triangles OFF</button>
        <button id="t21-review-source-families-phase12-toggle">Phase12 source family faces OFF</button>
        <button id="t21-review-complete-phase12c-toggle">Phase12C complete original source OFF</button>
        <button id="t21-review-provisional-toggle">Provisional ON</button>
        <button id="t21-review-unresolved-toggle">Unresolved ON</button>
        <button id="t21-review-nav-toggle">Nav markers ON</button>
      </div>
      <div class="review-legend">
        <span><i class="confirmed"></i> confirmed/reviewed macro geometry</span>
        <span><i class="occupancy"></i> whole-stage XZ occupancy envelope; NOT a flat floor</span>
        <span><i class="source-native"></i> exact Temple01 source floors, side-flanks and high ramps; connectivity/runtime pending</span>
        <span><i class="source-local"></i> local source triangles and batch 2; PntSet actor placement and connectivity pending</span>
        <span>cyan translucent = source glass faces; blue-grey = wall metal faces; violet = pillar faces; all double-sided REVIEW TINTS, not runtime optical/collision materials</span>
        <span><i class="provisional"></i> provisional XZ-only macro envelope; Y unresolved</span>
        <span><i class="unresolved"></i> unresolved detail boundary / ledger item</span>
        <span><i class="void"></i> intentional void / outside hard silhouette</span>
        <span><i class="nav"></i> currently authored navigation links</span>
      </div>
      <details>
        <summary>Coverage Ledger v3 — unshown XZ areas (0.5m samples)</summary>
        <p class="review-detail-note">
          This is a 2D display-coverage comparison, NOT a floor map, a fall-out map,
          or evidence of missing connectivity. Stage envelope and yellow provisional
          plan surfaces are deliberately excluded. Exact source Y and gameplay
          connectivity are independent.
        </p>
        <p class="review-detail-note">
          Sampled hard-envelope area:
          ${(UNDERTOW_T21_COVERAGE_LEDGER_V3.stageCells * 0.25).toFixed(1)} m² XZ.
          Not yet displayed:
          ${(UNDERTOW_T21_COVERAGE_LEDGER_V3.undisplayedCells * 0.25).toFixed(1)} m² XZ
          (${(100 * UNDERTOW_T21_COVERAGE_LEDGER_V3.undisplayedCells / UNDERTOW_T21_COVERAGE_LEDGER_V3.stageCells).toFixed(1)}% of samples).
        </p>
        <ul class="review-region-list">
          ${UNDERTOW_T21_COVERAGE_LEDGER_V3.zones.map(zone=>`
            <li><div><b>${escapeHtml(zone.zone)}</b>
              <small>Undisplayed ${zone.approximateUndisplayedXZSquareMeters.toFixed(1)} m² XZ
              / ${(zone.cells * 0.25).toFixed(1)} m² sampled region</small></div></li>`).join('')}
        </ul>
        <p class="review-detail-note">
          Largest connected undisplayed XZ samples — diagnostic centers, NOT
          authoritative source component locations:
        </p>
        <ul class="review-region-list">
          ${UNDERTOW_T21_COVERAGE_LEDGER_V3.clusters.slice(0,10).map((gap,i)=>`
            <li><div><b>#${i+1} ${escapeHtml(gap.zone)} /
              ${gap.approximateAreaSquareMeters.toFixed(1)} m² XZ</b>
              <small>center X=${gap.centroidXZ[0].toFixed(1)},
              Z=${gap.centroidXZ[1].toFixed(1)};
              shape/Y/connectivity unresolved</small></div></li>`).join('')}
        </ul>
      </details>
      <details open>
        <summary>Macro coverage regions (${UNDERTOW_T21_MACRO_COVERAGE.regionCount})</summary>
        <ul class="review-region-list">
          ${UNDERTOW_T21_MACRO_COVERAGE.regions
            .map(region => `
              <li class="${macroStatusClass(region.status)}">
                <span class="status-dot"></span>
                <div><b>${escapeHtml(region.label)}</b><small>${macroStatusLabel(region.status)}</small></div>
              </li>`)
            .join('')}
        </ul>
      </details>
      <details>
        <summary>Special deferred features (${UNDERTOW_T21_VISUAL_REVIEW.deferredFeatureIds.length}; NOT macro missing total)</summary>
        <p class="review-detail-note">
          These are the older special deferred items only. Macro coverage status above is the whole-stage review inventory.
        </p>
        <ul>
          ${UNDERTOW_T21_VISUAL_REVIEW.deferredFeatureIds
            .map(id => `<li>${escapeHtml(id)}</li>`)
            .join('')}
        </ul>
      </details>
      <details>
        <summary>Activation blockers (${UNDERTOW_T21_VISUAL_REVIEW.activationBlockers.length})</summary>
        <ul>
          ${UNDERTOW_T21_VISUAL_REVIEW.activationBlockers
            .map(id => `<li>${escapeHtml(id)}</li>`)
            .join('')}
        </ul>
      </details>
      <p class="review-source-note">
        Legacy cyan diagram polygons remain source annotations only; Visual Review v2 does not reinterpret them as internal water or void.
      </p>
      <p class="review-help">
        Drag: orbit · Wheel: zoom · WASD: pan · Arrow keys: orbit · Shift: faster
      </p>
    `;
    this.uiRoot.appendChild(panel);

    panel
      .querySelectorAll<HTMLButtonElement>('[data-review-preset]')
      .forEach(button=>{
        button.addEventListener('click',()=>{
          const preset=button.dataset.reviewPreset as ReviewLayerPreset;
          this.applyReviewLayerPreset(preset);
        });
      });

    panel
      .querySelectorAll<HTMLButtonElement>('[data-review-view]')
      .forEach(button => {
        button.addEventListener('click', () => {
          this.setView(button.dataset.reviewView as ReviewView);
        });
      });

    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-confirmed-toggle'),
      this.confirmedRoot,
      'Confirmed'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-occupancy-toggle'),
      this.occupancyRoot,
      'Stage envelope'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-source-native-toggle'),
      this.sourceNativeRoot,
      'Source mesh'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-source-local-toggle'),
      this.sourceLocalRoot,
      'Local source'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-source-batch2-toggle'),
      this.sourceBatch2Root,
      'Terrain batch 2'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-broad-static-toggle'),
      this.broadStaticRoot,
      'Broad static floors'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-flank-phase4-toggle'),
      this.flankElevationPhase4Root,
      'Flanks / high ramps'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-vertical-phase5b-toggle'),
      this.verticalSourcePhase5BRoot,
      'Vertical source faces'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-high-phase6-toggle'),
      this.highSourcePhase6Root,
      'High source panels'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-side-supports-phase7-toggle'),
      this.sideSupportsPhase7Root,
      'Source side supports'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-glass-frames-phase7-toggle'),
      this.glassFramesPhase7Root,
      'Source glass frames'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-central-towers-phase8-toggle'),
      this.centralTowersPhase8Root,
      'Central source towers'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-flank-high-phase8-toggle'),
      this.flankHighPhase8Root,
      'Flank high supports'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-side-edge-phase8-toggle'),
      this.sideEdgePhase8Root,
      'Source edge faces'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-center-downface-phase9-toggle'),
      this.centerDownfacePhase9Root,
      'Center downfaces'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-fence-downface-phase9-toggle'),
      this.fenceDownfacePhase9Root,
      'Flank fence downfaces'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-megalith-downface-phase9-toggle'),
      this.megalithDownfacePhase9Root,
      'Megalith downfaces'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-coordinate-seams-phase10-toggle'),
      this.coordinateSeamPhase10Root,
      'Non-welded edges'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-unmatched-edges-phase10-toggle'),
      this.unmatchedEdgePhase10Root,
      'Unmatched edges'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-nearest-phase11-toggle'),
      this.nearestOriginalPhase11Root,
      'Nearest original source'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-source-families-phase12-toggle'),
      this.sourceFamiliesPhase12Root,
      'Source families'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-complete-phase12c-toggle'),
      this.completeSourcePhase12CRoot,
      'Complete original source'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-provisional-toggle'),
      this.provisionalRoot,
      'Provisional'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-unresolved-toggle'),
      this.unresolvedRoot,
      'Unresolved'
    );
    this.bindRootToggle(
      panel.querySelector<HTMLButtonElement>('#t21-review-nav-toggle'),
      this.navRoot,
      'Nav markers'
    );
    // Keep prior fully-visible review defaults, with an explicit preset state.
    this.applyReviewLayerPreset('ALL_EVIDENCE');
  }

  private refreshReviewLayerButtons():void {
    for(const {button,root,label} of this.layerToggleBindings){
      button.textContent=`${label} ${root.enabled ? 'ON' : 'OFF'}`;
      button.classList.toggle('active-mode',root.enabled);
    }
  }

  private applyReviewLayerPreset(preset:ReviewLayerPreset):void {
    if(preset!=='WALK_SOURCE'&&preset!=='THREE_DIMENSIONAL'&&preset!=='ALL_EVIDENCE')
      throw new Error('T21 unknown review-only layer preset');
    this.canvas.dataset.t21ReviewPreset=preset;
    const full=preset==='ALL_EVIDENCE';
    const vertical=preset!=='WALK_SOURCE';
    this.confirmedRoot.enabled=vertical;
    this.occupancyRoot.enabled=full;
    // All 64 original walk-oriented source components remain visible in every
    // preset. Do not infer gameplay floor area or promote PntSet actor source.
    for(const root of [this.sourceNativeRoot,this.sourceLocalRoot,this.sourceBatch2Root,
      this.broadStaticRoot,this.flankElevationPhase4Root])root.enabled=true;
    this.verticalSourcePhase5BRoot.enabled=vertical;
    this.highSourcePhase6Root.enabled=vertical;
    this.sideSupportsPhase7Root.enabled=vertical;
    this.glassFramesPhase7Root.enabled=vertical;
    this.centralTowersPhase8Root.enabled=vertical;
    this.flankHighPhase8Root.enabled=vertical;
    // Edge-facing source evidence is useful but does not imply floor or nav.
    this.sideEdgePhase8Root.enabled=vertical;
    this.centerDownfacePhase9Root.enabled=vertical;
    this.fenceDownfacePhase9Root.enabled=vertical;
    this.megalithDownfacePhase9Root.enabled=vertical;
    // Always opt-in to source seam diagnostics. Never conflate a line marker
    // with authentic stage solids or collision/nav geometry.
    this.coordinateSeamPhase10Root.enabled=false;
    this.unmatchedEdgePhase10Root.enabled=false;
    this.nearestOriginalPhase11Root.enabled=false;
    this.sourceFamiliesPhase12Root.enabled=false;
    this.completeSourcePhase12CRoot.enabled=false;
    this.canvas.dataset.t21ReviewCompleteCentral='off';
    this.canvas.dataset.t21ReviewSourceFamilies='off';
    this.canvas.dataset.t21ReviewTopology='off';
    this.canvas.dataset.t21ReviewNearestCentral='off';
    this.provisionalRoot.enabled=full;
    this.unresolvedRoot.enabled=full;
    this.navRoot.enabled=full;
    this.refreshReviewLayerButtons();
    this.uiRoot.querySelectorAll<HTMLButtonElement>('[data-review-preset]').forEach(button=>{
      const active=button.dataset.reviewPreset===preset;
      button.classList.toggle('active-mode',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }

  private bindRootToggle(
    button:HTMLButtonElement|null,root:Entity,label:string
  ):void {
    if(!button)return;
    this.layerToggleBindings.push({button,root,label});
    this.refreshReviewLayerButtons();
    button.addEventListener('click',()=>{
      root.enabled=!root.enabled;
      // Prevent duplicate Phase12 original single faces and Phase12C full faces.
      if(root===this.completeSourcePhase12CRoot&&root.enabled)
        this.sourceFamiliesPhase12Root.enabled=false;
      if(root===this.sourceFamiliesPhase12Root&&root.enabled)
        this.completeSourcePhase12CRoot.enabled=false;
      this.canvas.dataset.t21ReviewCompleteCentral=
        this.completeSourcePhase12CRoot.enabled?'on':'off';
      this.canvas.dataset.t21ReviewTopology=
        (this.coordinateSeamPhase10Root.enabled||this.unmatchedEdgePhase10Root.enabled)?'on':'off';
      this.canvas.dataset.t21ReviewNearestCentral=
        this.nearestOriginalPhase11Root.enabled?'on':'off';
      this.canvas.dataset.t21ReviewSourceFamilies=
        this.sourceFamiliesPhase12Root.enabled?'on':'off';
      this.refreshReviewLayerButtons();
      this.uiRoot.querySelectorAll<HTMLButtonElement>('[data-review-preset]').forEach(presetButton=>{
        presetButton.classList.remove('active-mode');
        presetButton.setAttribute('aria-pressed','false');
      });
    });
  }

  private bindControls(): void {
    this.canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      this.dragging = true;
      this.lastPointerX = event.clientX;
      this.lastPointerY = event.clientY;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', event => {
      if (!this.dragging) return;
      const dx = event.clientX - this.lastPointerX;
      const dy = event.clientY - this.lastPointerY;
      this.lastPointerX = event.clientX;
      this.lastPointerY = event.clientY;
      this.yawDegrees -= dx * 0.22;
      this.pitchDegrees = clamp(this.pitchDegrees + dy * 0.18, 8, 89.5);
    });
    this.canvas.addEventListener('pointerup', event => {
      this.dragging = false;
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
    });
    this.canvas.addEventListener('pointercancel', () => {
      this.dragging = false;
    });
    this.canvas.addEventListener(
      'wheel',
      event => {
        event.preventDefault();
        this.distanceMeters = clamp(
          this.distanceMeters * Math.exp(event.deltaY * 0.0012),
          6,
          240
        );
      },
      { passive: false }
    );

    window.addEventListener('keydown', event => {
      this.keys.add(event.code);
      if (event.code.startsWith('Arrow')) event.preventDefault();
    });
    window.addEventListener('keyup', event => {
      this.keys.delete(event.code);
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.dragging = false;
    });
  }

  private updateKeyboardNavigation(dt: number): void {
    if (dt <= 0) return;
    const speed =
      Math.max(5, Math.min(34, this.distanceMeters * 0.34)) *
      (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 2.2 : 1);
    const yaw = this.yawDegrees * Math.PI / 180;
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);

    let forward = 0;
    let right = 0;
    if (this.keys.has('KeyW')) forward += 1;
    if (this.keys.has('KeyS')) forward -= 1;
    if (this.keys.has('KeyD')) right += 1;
    if (this.keys.has('KeyA')) right -= 1;

    this.target.x += (forwardX * forward + rightX * right) * speed * dt;
    this.target.z += (forwardZ * forward + rightZ * right) * speed * dt;

    if (this.keys.has('ArrowLeft')) this.yawDegrees += 70 * dt;
    if (this.keys.has('ArrowRight')) this.yawDegrees -= 70 * dt;
    if (this.keys.has('ArrowUp')) {
      this.pitchDegrees = clamp(this.pitchDegrees - 55 * dt, 8, 89.5);
    }
    if (this.keys.has('ArrowDown')) {
      this.pitchDegrees = clamp(this.pitchDegrees + 55 * dt, 8, 89.5);
    }
  }

  private setView(view: ReviewView): void {
    this.canvas.dataset.t21ReviewView=view;
    // Show which viewpoint is actually selected, including URL-triggered CI views.
    const label=this.uiRoot.querySelector<HTMLElement>('#t21-review-active-view');
    if(label)label.textContent=view.replaceAll('_',' ');
    this.uiRoot.querySelectorAll<HTMLButtonElement>('[data-review-view]').forEach(button=>{
      const active=button.dataset.reviewView===view;
      button.classList.toggle('active-mode',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const bounds = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.worldBounds;
    const centerX = (bounds.minX + bounds.maxX) * 0.5;
    const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
    const span = Math.max(
      bounds.maxX - bounds.minX,
      bounds.maxZ - bounds.minZ
    );

    if (view === 'CENTER_SOURCE') {
      // Camera only. Both original center FloorMetal downfaces occupy
      // X≈−20.7..+20.9, Z≈−13.8..+14, Y=+4.5255. Never move mesh XYZ.
      this.target.set(0.115, 4.5255, 0.097);
      this.yawDegrees = 38;
      this.pitchDegrees = 62;
      this.distanceMeters = 48;
      return;
    }

    if (view === 'TOP') {
      this.target.set(centerX, 2.8, centerZ);
      this.yawDegrees = 0;
      this.pitchDegrees = 89.5;
      this.distanceMeters = Math.max(28, span * 0.72);
      return;
    }

    if (view === 'POS_TO_NEG') {
      this.target.set(centerX, 2.8, centerZ);
      this.yawDegrees = 0;
      this.pitchDegrees = 34;
      this.distanceMeters = Math.max(55, span * 0.86);
      return;
    }

    if (view === 'SPAWN_A' || view === 'SPAWN_B') {
      const source = view === 'SPAWN_A'
        ? UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.teamASpawnFloorPoint
        : UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.teamBSpawnFloorPoint;
      this.target.set(source[0], source[1] - 1.2, source[2]);
      // Off-axis opposite perspectives expose different wall/side-flank
      // silhouettes; the symmetric frontal views previously looked identical
      // except the spawn marker tint, concealing visual-review differences.
      // Source spawn XYZ/Y and any gameplay camera configuration are unchanged.
      this.yawDegrees = view === 'SPAWN_A' ? 24 : 156;
      this.pitchDegrees = 28;
      this.distanceMeters = Math.max(16, span * 0.23);
      return;
    }

    this.target.set(centerX, 2.8, centerZ);
    this.yawDegrees = 35;
    this.pitchDegrees = 42;
    this.distanceMeters = Math.max(42, span * 0.82);
  }

  private updateCamera(): void {
    const yaw = this.yawDegrees * Math.PI / 180;
    const pitch = this.pitchDegrees * Math.PI / 180;
    const horizontal = this.distanceMeters * Math.cos(pitch);
    const position = new Vec3(
      this.target.x + horizontal * Math.sin(yaw),
      this.target.y + this.distanceMeters * Math.sin(pitch),
      this.target.z + horizontal * Math.cos(yaw)
    );
    this.camera.setPosition(position);
    this.camera.lookAt(this.target);
  }
}

function createReviewMaterials(): ReviewMaterials {
  return {
    paintBacked: makeMaterial(new Color(0.12, 0.66, 0.76), 0.10),
    structure: makeMaterial(new Color(0.19, 0.50, 0.60), 0.06),
    visualOnly: makeMaterial(new Color(0.24, 0.58, 0.66), 0.08),
    supportOnly: makeMaterial(new Color(0.10, 0.40, 0.52), 0.08),
    occupancy: makeMaterial(new Color(0.30, 0.22, 0.065), 0.14),
    sourceNative: makeMaterial(new Color(0.94, 0.46, 0.08), 0.30),
    sourceLocal: makeMaterial(new Color(0.96, 0.64, 0.27), 0.22),
    sourceVerticalGlass: makeVerticalSourceMaterial(new Color(0.35, 0.86, 0.93), 0.36, true),
    sourceVerticalMetal: makeVerticalSourceMaterial(new Color(0.55, 0.67, 0.79), 0.27, false),
    sourceVerticalPillar: makeVerticalSourceMaterial(new Color(0.79, 0.51, 0.91), 0.27, false),
    sourceHighStructure: makeVerticalSourceMaterial(new Color(0.86, 0.76, 0.50), 0.24, true),
    sourcePhase7SideSupports: makeVerticalSourceMaterial(new Color(0.48, 0.87, 0.68), 0.33, false),
    sourcePhase7GlassFrame: makeVerticalSourceMaterial(new Color(0.52, 0.79, 0.99), 0.34, true),
    sourcePhase8CentralTowers: makeVerticalSourceMaterial(new Color(0.85, 0.67, 0.94), 0.28, false),
    sourcePhase8FlankHigh: makeVerticalSourceMaterial(new Color(0.52, 0.86, 0.66), 0.27, false),
    sourcePhase8EdgeFacing: makeVerticalSourceMaterial(new Color(0.96, 0.76, 0.39), 0.20, false),
    sourcePhase9CenterUnder: makeVerticalSourceMaterial(new Color(0.38, 0.83, 0.92), 0.19, true),
    sourcePhase9FenceUnder: makeVerticalSourceMaterial(new Color(0.85, 0.96, 0.46), 0.24, true),
    sourcePhase9MegalithUnder: makeVerticalSourceMaterial(new Color(0.87, 0.68, 0.47), 0.20, true),
    sourcePhase10CoordinateSeam: makeMaterial(new Color(1, 0.68, 0.16), 0.85),
    sourcePhase10UnmatchedEdge: makeMaterial(new Color(1, 0.24, 0.21), 0.95),
    sourcePhase11OriginalNearby: makeVerticalSourceMaterial(new Color(0.99, 0.99, 0.20), 0.55, true),
    sourcePhase12FloorLine: makeVerticalSourceMaterial(new Color(0.22,0.96,0.62),0.6,true),
    sourcePhase12WallMetal: makeVerticalSourceMaterial(new Color(1,0.48,0.36),0.6,true),
    sourcePhase12Pillar: makeVerticalSourceMaterial(new Color(0.83,0.47,0.99),0.6,true),
    sourcePhase12Glass: makeVerticalSourceMaterial(new Color(0.55,0.80,1),0.6,true),
    sourcePhase12GlassEdge: makeVerticalSourceMaterial(new Color(1,0.38,0.77),0.6,true),
    confirmedBoundary: makeMaterial(new Color(0.42, 0.88, 0.98), 0.42),
    provisional: makeMaterial(new Color(0.98, 0.72, 0.16), 0.18),
    unresolved: makeMaterial(new Color(1.00, 0.20, 0.16), 0.50),
    spawnA: makeMaterial(new Color(0.05, 0.90, 1.00), 0.55),
    spawnB: makeMaterial(new Color(1.00, 0.10, 0.58), 0.55),
    nav: makeMaterial(new Color(0.50, 1.00, 0.32), 0.48)
  };
}

function makeMaterial(color: Color, emissiveStrength: number): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = color;
  material.emissive = new Color(
    color.r * emissiveStrength,
    color.g * emissiveStrength,
    color.b * emissiveStrength
  );
  material.useMetalness = true;
  material.metalness = 0.04;
  material.gloss = 0.52;
  material.update();
  return material;
}

function makeVerticalSourceMaterial(color: Color, emissiveStrength: number, glass: boolean): StandardMaterial {
  // Original near-vertical source triangles are ONE-sided geometry. Review
  // must see both sides when orbiting; this is material ONLY, not collider
  // double-sided gameplay authorization. Cyan glass is a visual review tint.
  const material = makeMaterial(color, emissiveStrength);
  material.cull = CULLFACE_NONE;
  if (glass) {
    material.opacity = 0.48;
    material.blendType = BLEND_NORMAL;
    material.depthWrite = false;
  }
  material.update();
  return material;
}

function createReviewSolid(
  app: AppBase,
  parent: Entity,
  solid: StageSolidDefinition,
  material: StandardMaterial
): void {
  const entity = new Entity(`T21Review:${solid.id}`);
  entity.setPosition(vec3(solid.center));
  if (solid.rotationEulerDegrees) {
    entity.setEulerAngles(
      solid.rotationEulerDegrees[0],
      solid.rotationEulerDegrees[1],
      solid.rotationEulerDegrees[2]
    );
  }

  if (solid.triangleMesh) {
    const positions = solid.triangleMesh.vertices.flatMap(vertex => [...vertex]);
    const indices = [...solid.triangleMesh.indices];
    const mesh = new Mesh(app.graphicsDevice);
    mesh.setPositions(new Float32Array(positions));
    mesh.setNormals(new Float32Array(calculateNormals(positions, indices)));
    mesh.setIndices(new Uint32Array(indices));
    mesh.update();
    const meshInstance = new MeshInstance(mesh, material);
    entity.addComponent('render', {
      meshInstances: [meshInstance],
      castShadows: true,
      receiveShadows: true
    });
    parent.addChild(entity);
    return;
  }

  if (!solid.footprint) {
    entity.addComponent('render', {
      type: 'box',
      material,
      castShadows: true,
      receiveShadows: true
    });
    entity.setLocalScale(vec3(solid.size));
    parent.addChild(entity);
    return;
  }

  const raster = rasterizeStageFootprint(
    solid.size[0],
    solid.size[2],
    solid.footprint
  );
  raster.rectangles.forEach((rect, index) => {
    const piece = new Entity(`T21Review:${solid.id}:footprint:${index}`);
    piece.addComponent('render', {
      type: 'box',
      material,
      castShadows: true,
      receiveShadows: true
    });
    piece.setLocalPosition(
      rect.centerU - solid.size[0] * 0.5,
      0,
      rect.centerV - solid.size[2] * 0.5
    );
    piece.setLocalScale(rect.widthMeters, solid.size[1], rect.depthMeters);
    entity.addChild(piece);
  });
  parent.addChild(entity);
}

function createSourceNativeReviewMesh(
  app: AppBase,
  parent: Entity,
  sourceMesh: Pick<UndertowSourceNativeReviewMesh, 'id' | 'vertices'>,
  material: StandardMaterial
): void {
  const positions = sourceMesh.vertices.flatMap(([x, y, z]) => [
    x,
    y - 0.035,
    z
  ]);
  const indices = Array.from(
    { length: sourceMesh.vertices.length },
    (_, index) => index
  );
  const mesh = new Mesh(app.graphicsDevice);
  mesh.setPositions(new Float32Array(positions));
  mesh.setNormals(new Float32Array(calculateNormals(positions, indices)));
  mesh.setIndices(new Uint32Array(indices));
  mesh.update();

  const entity = new Entity(`T21Review:${sourceMesh.id}`);
  const meshInstance = new MeshInstance(mesh, material);
  entity.addComponent('render', {
    meshInstances: [meshInstance],
    castShadows: false,
    receiveShadows: false
  });
  parent.addChild(entity);
}

function createMacroOccupancyEnvelope(
  parent: Entity,
  material: StandardMaterial
): void {
  const surface = UNDERTOW_T21_MACRO_OCCUPANCY_ENVELOPE;
  const bounds = polygonBounds(surface.outer);
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const footprint = localReviewFootprint(
    surface.outer,
    surface.holes,
    bounds.minX,
    bounds.minZ,
    surface.cellSizeMeters
  );
  const raster = rasterizeStageFootprint(width, depth, footprint);
  const thickness = 0.035;

  raster.rectangles.forEach((rect, index) => {
    const piece = new Entity(`T21Review:${surface.id}:${index}`);
    piece.addComponent('render', {
      type: 'box',
      material,
      castShadows: false,
      receiveShadows: false
    });
    piece.setPosition(
      bounds.minX + rect.centerU,
      surface.reviewPlaneY - thickness * 0.5,
      bounds.minZ + rect.centerV
    );
    piece.setLocalScale(rect.widthMeters, thickness, rect.depthMeters);
    parent.addChild(piece);
  });
}

function createMacroReviewSurface(
  parent: Entity,
  surface: UndertowMacroReviewSurface,
  material: StandardMaterial
): void {
  const bounds = polygonBounds(surface.outer);
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const footprint = localReviewFootprint(
    surface.outer,
    surface.holes,
    bounds.minX,
    bounds.minZ,
    surface.cellSizeMeters
  );
  const raster = rasterizeStageFootprint(width, depth, footprint);
  const thickness = 0.06;

  raster.rectangles.forEach((rect, index) => {
    const piece = new Entity(`T21Review:${surface.id}:${index}`);
    piece.addComponent('render', {
      type: 'box',
      material,
      castShadows: false,
      receiveShadows: false
    });
    piece.setPosition(
      bounds.minX + rect.centerU,
      surface.reviewPlaneY - thickness * 0.5,
      bounds.minZ + rect.centerV
    );
    piece.setLocalScale(rect.widthMeters, thickness, rect.depthMeters);
    parent.addChild(piece);
  });
}

function createPhase10SourceEdgeDiagnostic(
  parent:Entity,
  edge:UndertowPhase10EdgeEvidence,
  material:StandardMaterial
):void{
  // A thin render-only orange/red bar, offset slightly from the source
  // surface so it stays legible, with NO collision/nav/floor semantics.
  const [a,b]=edge.endpoints;
  const start=new Vec3(a[0],a[1]+0.065,a[2]);
  const end=new Vec3(b[0],b[1]+0.065,b[2]);
  const length=start.distance(end);
  if(length<1e-6)return;
  const segment=new Entity('T21Review:Phase10:SOURCE_EDGE_NOT_GAME_GEOMETRY');
  segment.addComponent('render',{
    type:'box',material,castShadows:false,receiveShadows:false
  });
  segment.setPosition(start.clone().add(end).mulScalar(0.5));
  segment.lookAt(end);
  segment.setLocalScale(0.13,0.13,Math.max(0.13,length));
  parent.addChild(segment);
}

function createMacroReviewOutline(
  parent: Entity,
  outline: UndertowMacroReviewOutline,
  material: StandardMaterial
): void {
  createPlanLineLoop(
    parent,
    `T21Review:${outline.id}`,
    outline.points,
    outline.reviewY,
    material,
    0.11
  );
}

function createPlanLineLoop(
  parent: Entity,
  name: string,
  points: readonly MetricXZ[],
  y: number,
  material: StandardMaterial,
  thickness: number
): void {
  for (let index = 0; index < points.length; index += 1) {
    const startPoint = points[index]!;
    const endPoint = points[(index + 1) % points.length]!;
    const start = new Vec3(startPoint[0], y, startPoint[1]);
    const end = new Vec3(endPoint[0], y, endPoint[1]);
    const midpoint = start.clone().add(end).mulScalar(0.5);
    const length = start.distance(end);
    const bar = new Entity(`${name}:${index}`);
    bar.addComponent('render', {
      type: 'box',
      material,
      castShadows: false,
      receiveShadows: false
    });
    bar.setPosition(midpoint);
    bar.lookAt(end);
    bar.setLocalScale(thickness, thickness, Math.max(thickness, length));
    parent.addChild(bar);
  }
}

function localReviewFootprint(
  outer: readonly MetricXZ[],
  holes: readonly (readonly MetricXZ[])[],
  minX: number,
  minZ: number,
  cellSizeMeters: number
): StageFootprint {
  const toLocal = ([x, z]: MetricXZ): StageFootprintPoint => [x - minX, z - minZ];
  return {
    outer: outer.map(toLocal),
    holes: holes.map(hole => hole.map(toLocal)),
    cellSizeMeters
  };
}

function polygonBounds(points: readonly MetricXZ[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} {
  return {
    minX: Math.min(...points.map(point => point[0])),
    maxX: Math.max(...points.map(point => point[0])),
    minZ: Math.min(...points.map(point => point[1])),
    maxZ: Math.max(...points.map(point => point[1]))
  };
}

function createMarker(
  app: AppBase,
  name: string,
  position: StageVector3,
  material: StandardMaterial,
  diameterMeters: number
): void {
  const marker = new Entity(name);
  marker.addComponent('render', {
    type: 'sphere',
    material,
    castShadows: false,
    receiveShadows: false
  });
  marker.setPosition(position[0], position[1] + diameterMeters * 0.65, position[2]);
  marker.setLocalScale(diameterMeters, diameterMeters, diameterMeters);
  app.root.addChild(marker);
}

function createNavigationMarker(
  root: Entity,
  link: StageNavigationLinkDefinition,
  material: StandardMaterial
): void {
  const start = vec3(link.start);
  const end = vec3(link.end);
  const midpoint = start.clone().add(end).mulScalar(0.5);
  const length = start.distance(end);

  const bar = new Entity(`T21Review:Nav:${link.id}`);
  bar.addComponent('render', {
    type: 'box',
    material,
    castShadows: false,
    receiveShadows: false
  });
  bar.setPosition(midpoint);
  bar.lookAt(end);
  bar.setLocalScale(0.12, 0.12, Math.max(0.15, length));
  root.addChild(bar);

  for (const [suffix, point] of [['start', start], ['end', end]] as const) {
    const endpoint = new Entity(`T21Review:Nav:${link.id}:${suffix}`);
    endpoint.addComponent('render', {
      type: 'sphere',
      material,
      castShadows: false,
      receiveShadows: false
    });
    endpoint.setPosition(point);
    endpoint.setLocalScale(0.28, 0.28, 0.28);
    root.addChild(endpoint);
  }
}

function macroStatusClass(status: UndertowMacroCoverageStatus): string {
  return `status-${status.toLowerCase().replaceAll('_', '-')}`;
}

function macroStatusLabel(status: UndertowMacroCoverageStatus): string {
  switch (status) {
    case 'CONFIRMED_GEOMETRY':
      return 'CONFIRMED';
    case 'PROVISIONAL_MACRO_GEOMETRY':
      return 'PROVISIONAL XZ';
    case 'EXISTS_BUT_NOT_IMPLEMENTED':
      return 'EXISTS / NOT IMPLEMENTED';
    case 'INTENTIONAL_VOID_OR_WATER':
      return 'INTENTIONAL VOID / OUTSIDE';
    case 'UNRESOLVED':
      return 'UNRESOLVED';
  }
}

function vec3(value: StageVector3): Vec3 {
  return new Vec3(value[0], value[1], value[2]);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char] ?? char)
  );
}
