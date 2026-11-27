"""Apply the pinned F4 pending patch and build. No reset, merge, push or asset upload."""
import argparse
from pathlib import Path
import re
import subprocess
import sys

REPO = 'ryomashibaba/browser-ink-tps'
BRANCH = 'research/t21-integrated-a1-c-patrol-four-mode-20261105'
WINDOWS = 'handoff/windows-v28-live-combat-20261125'
COMMIT = '0e4b23e251b50fb0b278ad322c4b4db08335dd73'
BLOB = 'a249416227bb31639a01a532f20cf1d83e10cfc4'
PATCH = 'handoff/f4-parallel-20261125/chief/f4-live-player-polish-after-v4.patch'
TARGETS = {'src/app/F4MatchFlowExtras.mjs', 'src/app/F4MatchFlowExtras.d.mts',
 'src/app/UndertowF3PlayablePreviewApp.ts', 'src/app/F4ActorArt.mjs',
 'src/app/F4StageMaterialLook.mjs', 'src/ai/F4CpuAttackPolicy.mjs',
 'src/ai/F4CpuAttackPolicy.d.mts', 'src/ai/CpuAgentSystem.ts',
 'src/app/F4PlayerPresentation.mjs', 'src/projectile/ProjectileSystem.ts',
 'src/subweapon/SubWeaponSystem.ts'}


def git(root, *args, data=None, check=True):
    return subprocess.run(['git', '-C', str(root), *args], input=data,
                          capture_output=True, check=check)


def validate_patch(raw):
    text = raw.decode('utf-8')
    paths = re.findall(r'^diff --git a/(\S+) b/(\S+)$', text, re.M)
    if len(paths) != len(TARGETS) or {a for a, b in paths if a == b} != TARGETS:
        raise RuntimeError('unexpected patch targets')
    if re.search(r'^(?:new file mode|deleted file mode|old mode|new mode|rename |copy |GIT binary patch)', text, re.M):
        raise RuntimeError('unexpected non-content change')
    for line in text.splitlines():
        if line.startswith(('--- ', '+++ ')) and line[6:] not in TARGETS:
            raise RuntimeError('unexpected patch header: ' + line)


def apply_checked(root, raw):
    validate_patch(raw)
    for name in TARGETS:
        p = root / name
        if not p.is_file() or p.resolve() != p:
            raise RuntimeError('missing or redirected target: ' + name)
    forward = git(root, 'apply', '--check', '-', data=raw, check=False)
    reverse = git(root, 'apply', '--reverse', '--check', '-', data=raw, check=False)
    if reverse.returncode == 0 and forward.returncode != 0:
        return 'ALREADY_APPLIED'
    if forward.returncode != 0 or reverse.returncode == 0:
        raise RuntimeError('patch conflict or ambiguous state; no files changed\n' +
                           forward.stderr.decode(errors='replace'))
    # Default git apply is atomic on context failure; no --reject or --index.
    git(root, 'apply', '-', data=raw)
    git(root, 'apply', '--reverse', '--check', '-', data=raw)
    return 'APPLIED'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path.home() / 'Documents/Codex/browser-ink-tps')
    args = parser.parse_args()
    root = args.root.resolve()
    top = Path(git(root, 'rev-parse', '--show-toplevel').stdout.decode().strip()).resolve()
    if top != root:
        raise RuntimeError('not repository root')
    url = git(root, 'remote', 'get-url', 'origin').stdout.decode().strip().rstrip('/')
    if url not in {f'https://github.com/{REPO}', f'https://github.com/{REPO}.git',
                   f'git@github.com:{REPO}', f'git@github.com:{REPO}.git'}:
        raise RuntimeError('unexpected repository')
    branch = git(root, 'symbolic-ref', '--quiet', '--short', 'HEAD', check=False)
    if branch.returncode not in (0, 1) or (branch.returncode == 0 and branch.stdout.decode().strip() != WINDOWS):
        raise RuntimeError('protected or unexpected branch; do not switch automatically')
    head = git(root, 'rev-parse', 'HEAD').stdout.decode().strip()
    print('Windows HEAD:', head, flush=True)
    if branch.returncode == 1 and head != 'b2e41bde14bc744231e4c16fd9300ce3db49f244':
        raise RuntimeError('detached HEAD differs from last reported Windows base; inspect before applying')
    if not (root / 'node_modules/.bin/vite.cmd').is_file():
        raise RuntimeError('existing Windows dependencies unavailable; no install attempted')
    # Fetch only research objects. No merge, checkout or index write.
    git(root, 'fetch', '--no-tags', '--no-recurse-submodules', 'origin', BRANCH)
    raw = git(root, 'show', f'{COMMIT}:{PATCH}').stdout
    if git(root, 'hash-object', '--stdin', data=raw).stdout.decode().strip() != BLOB:
        raise RuntimeError('pinned patch hash mismatch')
    print(apply_checked(root, raw), flush=True)
    # Build includes tsc -b and Vite. Never auto-install dependencies.
    subprocess.run(['cmd.exe', '/d', '/c', 'npm.cmd', 'run', 'build'], cwd=root, check=True)
    print('BUILD_PASS. Launch the existing local F4 game and play; this is not live QA.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, RuntimeError, subprocess.CalledProcessError, UnicodeError) as exc:
        print('HOLD:', exc, file=sys.stderr)
        if isinstance(exc, subprocess.CalledProcessError) and exc.stderr:
            print(exc.stderr.decode(errors='replace'), file=sys.stderr)
        sys.exit(1)
