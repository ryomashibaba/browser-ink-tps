"""Publish a bounded Windows source snapshot without touching its worktree/index."""
import argparse
import os
from pathlib import Path
import re
import subprocess
import tempfile

BRANCH = 'handoff/windows-v28-live-combat-20261125'
REF = 'refs/heads/' + BRANCH
EXPECTED = '175e1a63f4825d28761e57eef9ca2b44aeccb6db'
DEST = BRANCH + '/live/'
ORIGIN = 'ryomashibaba/browser-ink-tps'


def git(root, *args, data=None, env=None):
    return subprocess.run(['git', '-C', str(root), *args], input=data,
                          stdout=subprocess.PIPE, check=True, env=env).stdout


def remote_head(root):
    result = git(root, 'ls-remote', '--exit-code', 'origin', REF).decode().split()
    if len(result) != 2 or result[1] != REF:
        raise RuntimeError('unexpected remote ref')
    return result[0]


def read_sources(root, paths):
    sources = {}
    for name in paths:
        if not re.fullmatch(r'src/[A-Za-z0-9_/.-]+\.(?:ts|mts|mjs)', name) or '..' in name.split('/'):
            raise RuntimeError('outside source allowlist: ' + name)
        path = root / name
        if not path.is_file() or path.resolve() != path:
            raise RuntimeError('missing or redirected source: ' + name)
        raw = path.read_bytes()
        if b'\x00' in raw or raw.startswith(b'version https://git-lfs.github.com/spec/'):
            raise RuntimeError('non-source content: ' + name)
        raw.decode('utf-8')
        if re.search(rb'-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_\-]{20,}', raw):
            raise RuntimeError('possible credential: ' + name)
        sources[name] = raw.replace(b'\r\n', b'\n')
    return sources


def prepare(root, parent, sources):
    with tempfile.TemporaryDirectory() as tmp:
        env = dict(os.environ, GIT_INDEX_FILE=str(Path(tmp) / 'index'))
        git(root, 'read-tree', parent, env=env)
        for name, data in sources.items():
            blob = git(root, 'hash-object', '-w', '--stdin', data=data).decode().strip()
            git(root, 'update-index', '--add', '--cacheinfo', f'100644,{blob},{DEST}{name}', env=env)
        tree = git(root, 'write-tree', env=env).decode().strip()
    changed = git(root, 'diff-tree', '-r', '--no-commit-id', '--name-only', '-z', parent, tree).decode().split('\0')
    changed = set(filter(None, changed))
    if not changed <= {DEST + name for name in sources}:
        raise RuntimeError('unexpected tree changes')
    return tree, changed


def main(paths):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--publish', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    url = git(root, 'remote', 'get-url', 'origin').decode().strip().rstrip('/')
    if url not in ('https://github.com/'+ORIGIN, 'https://github.com/'+ORIGIN+'.git',
                   'git@github.com:'+ORIGIN+'.git', 'git@github.com:'+ORIGIN):
        raise RuntimeError('unexpected origin')
    if remote_head(root) != EXPECTED:
        raise RuntimeError('shared HEAD changed; stop and reconcile')
    sources = read_sources(root, paths)
    print(f'{len(sources)} allowlisted source files; destination {DEST}src/')
    if not args.publish:
        print('Dry run: no Git writes or push. Review scope and secrets before --publish.')
        return
    git(root, 'fetch', '--no-tags', 'origin', REF)
    if git(root, 'rev-parse', 'FETCH_HEAD').decode().strip() != EXPECTED:
        raise RuntimeError('shared HEAD changed during fetch')
    tree, changed = prepare(root, EXPECTED, sources)
    if not changed:
        print('No source changes to publish')
        return
    if read_sources(root, paths) != sources:
        raise RuntimeError('Windows source changed during snapshot')
    commit = git(root, 'commit-tree', tree, '-p', EXPECTED, '-m',
                 '[skip ci] Publish built V28 Windows live source snapshot').decode().strip()
    if remote_head(root) != EXPECTED:
        raise RuntimeError('shared HEAD changed before push')
    git(root, 'push', 'origin', f'{commit}:{REF}')
    if remote_head(root) != commit:
        raise RuntimeError('remote confirmation mismatch')
    print(f'Published {len(changed)} paths; shared HEAD {commit}')


# Exact union of the three chief integration patches at 3dc902ca.
PATHS = (
    'src/ai/B216OriginalSourceBackfillInk.ts',
    'src/ai/CpuAgentSystem.ts',
    'src/ai/F4CpuAttackPolicy.d.mts',
    'src/ai/F4CpuAttackPolicy.mjs',
    'src/ai/F4CpuCommitment.d.mts',
    'src/ai/F4CpuCommitment.mjs',
    'src/ai/F4CpuRecoveryPolicy.d.mts',
    'src/ai/F4CpuRecoveryPolicy.mjs',
    'src/ai/F4FlightLead.ts',
    'src/ai/F4PatrolNavigation.d.mts',
    'src/ai/F4PatrolNavigation.mjs',
    'src/ai/F4PatrolSurvey.d.mts',
    'src/ai/F4PatrolSurvey.mjs',
    'src/app/B248SourceActorVisuals.ts',
    'src/app/B401NativeLiveSourceInkOwnership.ts',
    'src/app/B402NativeSourceInkRadarSamples.ts',
    'src/app/CompactF4Hud.d.mts',
    'src/app/CompactF4Hud.mjs',
    'src/app/F4ActorArt.d.mts',
    'src/app/F4ActorArt.mjs',
    'src/app/F4LocalCombat.d.mts',
    'src/app/F4LocalCombat.mjs',
    'src/app/F4MatchFlowExtras.d.mts',
    'src/app/F4MatchFlowExtras.mjs',
    'src/app/F4PlayerPresentation.d.mts',
    'src/app/F4PlayerPresentation.mjs',
    'src/app/F4StageMaterialLook.d.mts',
    'src/app/F4StageMaterialLook.mjs',
    'src/app/UndertowF3LTexturedSourcePreview.ts',
    'src/app/UndertowF3PlayableHud.ts',
    'src/app/UndertowF3PlayablePreviewApp.ts',
    'src/app/UndertowF3SourceRadar.ts',
    'src/app/UndertowF3SourceTraffic.ts',
    'src/audio/SourcePracticeAudio.ts',
    'src/camera/F4StableCameraAim.d.mts',
    'src/camera/F4StableCameraAim.mjs',
    'src/camera/ThirdPersonCamera.ts',
    'src/combat/PlayerResources.ts',
    'src/core/InkBrushRasterStream.ts',
    'src/feedback/F4AudioBus.d.mts',
    'src/feedback/F4AudioBus.mjs',
    'src/feedback/F4FeedbackMotion.d.mts',
    'src/feedback/F4FeedbackMotion.mjs',
    'src/feedback/F4SpatialAudio.d.mts',
    'src/feedback/F4SpatialAudio.mjs',
    'src/feedback/GameFeedback.ts',
    'src/ink/F4ProvisionalTurf.d.mts',
    'src/ink/F4ProvisionalTurf.mjs',
    'src/ink/GameplayInkSystem.ts',
    'src/ink/GpuInkAtlas.ts',
    'src/ink/InkSurfaceMaterial.ts',
    'src/ink/PaintCoordinator.ts',
    'src/ink/PaintSurface.ts',
    'src/ink/types.ts',
    'src/input/PlayerInput.ts',
    'src/physics/RapierStagePhysics.ts',
    'src/player/F4PlayerIntent.d.mts',
    'src/player/F4PlayerIntent.mjs',
    'src/player/F4ZipReticleAim.d.mts',
    'src/player/F4ZipReticleAim.mjs',
    'src/player/PlayerController.ts',
    'src/projectile/ProjectileSystem.ts',
    'src/special/F4CpuSpecialAim.d.mts',
    'src/special/F4CpuSpecialAim.mjs',
    'src/special/F4CpuSpecialTactics.d.mts',
    'src/special/F4CpuSpecialTactics.mjs',
    'src/special/F4CpuZipMotion.d.mts',
    'src/special/F4CpuZipMotion.mjs',
    'src/special/F4NaturalCastLease.d.mts',
    'src/special/F4NaturalCastLease.mjs',
    'src/special/F4ProvisionalGauge.d.mts',
    'src/special/F4ProvisionalGauge.mjs',
    'src/special/F4SpecialRuntime.ts',
    'src/stage/F4ConcreteWallTiles.d.mts',
    'src/stage/F4ConcreteWallTiles.mjs',
    'src/stage/F4PhysicalStageSafety.d.mts',
    'src/stage/F4PhysicalStageSafety.mjs',
    'src/stage/F4ProvisionalWalls.ts',
    'src/stage/F4WallContinuationBrushes.d.mts',
    'src/stage/F4WallContinuationBrushes.mjs',
    'src/stage/F4WallContinuity.d.mts',
    'src/stage/F4WallContinuity.mjs',
    'src/stage/TestStage.ts',
    'src/stage/undertow/UndertowPhase14QSharedActorCollision.ts',
    'src/subweapon/SubWeaponSystem.ts',
)

if __name__ == '__main__':
    main(PATHS)
