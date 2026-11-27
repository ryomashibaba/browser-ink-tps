"""Apply the exact pending F4 playable batch, then build. No reset, merge, push, install or asset upload."""
import argparse
import hashlib
from pathlib import Path
import re
import subprocess
import sys

REPO = 'ryomashibaba/browser-ink-tps'
BRANCH = 'research/t21-integrated-a1-c-patrol-four-mode-20261105'
WINDOWS = 'handoff/windows-v28-live-combat-20261125'
COMMIT = 'cd6480844269d950a4e766d0ca6f071a02a115a3'
BLOB = 'e0b857c4011266d34d3bf37ae5231aaa43b60ace'
PATCH = 'handoff/f4-parallel-20261125/chief/f4-live-final-playable-batch.patch'
TARGETS = ["src/projectile/ProjectileSystem.ts","src/app/UndertowF3PlayablePreviewApp.ts","src/app/UndertowF3SourceRadar.ts","src/physics/RapierStagePhysics.ts","src/app/UndertowF3SourceTraffic.ts","src/app/F4MatchFlowExtras.mjs","src/special/F4SpecialRuntime.ts","src/app/CompactF4Hud.mjs","src/app/CompactF4Hud.d.mts","src/feedback/GameFeedback.ts","src/app/F4FloorRadarSamples.mjs","src/app/F4FloorRadarSamples.d.mts"]
NEW = set(["src/app/F4FloorRadarSamples.mjs","src/app/F4FloorRadarSamples.d.mts"])
EXPECTED_WINDOWS_DETACHED = 'b2e41bde14bc744231e4c16fd9300ce3db49f244'


def git(root, *args, data=None, check=True):
    return subprocess.run(['git', '-C', str(root), *args], input=data,
                          capture_output=True, check=check)


def validate_patch(raw):
    if hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\x00' + raw).hexdigest() != BLOB:
        raise RuntimeError('pinned patch hash mismatch')
    body = raw.decode('utf-8')
    paths = re.findall(r'^diff --git a/(\S+) b/(\S+)$', body, re.M)
    if len(paths) != len(TARGETS) or {a for a, b in paths if a == b} != set(TARGETS):
        raise RuntimeError('unexpected patch targets')
    blocks = re.split(r'(?=^diff --git )', body, flags=re.M)
    for block in filter(None, blocks):
        lines = block.splitlines()
        path = lines[0].split(' b/', 1)[1]
        headers = [line for line in lines[1:] if line.startswith(('--- ', '+++ '))]
        if headers != (['--- /dev/null', '+++ b/' + path] if path in NEW
                       else ['--- a/' + path, '+++ b/' + path]):
            raise RuntimeError('unexpected file header: ' + path)
        modes = [line for line in lines if re.match(r'^(?:new file mode|deleted file mode|old mode|new mode|rename |copy |GIT binary patch)', line)]
        if modes != (['new file mode 100644'] if path in NEW else []):
            raise RuntimeError('unexpected mode change: ' + path)


def apply_checked(root, raw):
    validate_patch(raw)
    for name in TARGETS:
        p = root / name
        if p.resolve() != p or not p.parent.is_dir() or p.is_symlink():
            raise RuntimeError('redirected or invalid target: ' + name)
        if (name not in NEW and not p.is_file()) or (p.exists() and not p.is_file()):
            raise RuntimeError('missing or invalid target: ' + name)
    forward = git(root, 'apply', '--check', '-', data=raw, check=False)
    reverse = git(root, 'apply', '--reverse', '--check', '-', data=raw, check=False)
    if reverse.returncode == 0 and forward.returncode != 0:
        return 'ALREADY_APPLIED'
    if forward.returncode != 0 or reverse.returncode == 0:
        raise RuntimeError('mixed state or patch conflict; no files changed\n' +
                           forward.stderr.decode(errors='replace'))
    if any((root / name).exists() for name in NEW):
        raise RuntimeError('unexpected existing new file; no files changed')
    git(root, 'apply', '-', data=raw)
    git(root, 'apply', '--reverse', '--check', '-', data=raw)
    return 'APPLIED'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path.home() / 'Documents/Codex/browser-ink-tps')
    args = parser.parse_args()
    root = args.root.resolve()
    if Path(git(root, 'rev-parse', '--show-toplevel').stdout.decode().strip()).resolve() != root:
        raise RuntimeError('not repository root')
    url = git(root, 'remote', 'get-url', 'origin').stdout.decode().strip().rstrip('/')
    if url not in {f'https://github.com/{REPO}', f'https://github.com/{REPO}.git',
                   f'git@github.com:{REPO}', f'git@github.com:{REPO}.git'}:
        raise RuntimeError('unexpected repository')
    branch = git(root, 'symbolic-ref', '--quiet', '--short', 'HEAD', check=False)
    if branch.returncode not in (0, 1) or (branch.returncode == 0 and branch.stdout.decode().strip() != WINDOWS):
        raise RuntimeError('protected or unexpected branch; do not switch automatically')
    current = git(root, 'rev-parse', 'HEAD').stdout.decode().strip()
    print('Windows HEAD:', current, flush=True)
    if branch.returncode == 1 and current != EXPECTED_WINDOWS_DETACHED:
        raise RuntimeError('unexpected detached HEAD; inspect before applying')
    if not (root / 'node_modules/.bin/vite.cmd').is_file():
        raise RuntimeError('existing Windows dependencies unavailable; no install attempted')
    # Fetch only research objects; do not alter the working tree or index.
    git(root, 'fetch', '--no-tags', '--no-recurse-submodules', 'origin', BRANCH)
    raw = git(root, 'show', f'{COMMIT}:{PATCH}').stdout
    print(apply_checked(root, raw), flush=True)
    subprocess.run(['cmd.exe', '/d', '/c', 'npm.cmd', 'run', 'build'], cwd=root, check=True)
    print('BUILD_PASS; launch existing play-f4.html. Real floor paint, swim and 180s match remain unverified.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, RuntimeError, subprocess.CalledProcessError, UnicodeError) as exc:
        print('HOLD:', exc, file=sys.stderr)
        if isinstance(exc, subprocess.CalledProcessError) and exc.stderr:
            print(exc.stderr.decode(errors='replace'), file=sys.stderr)
        sys.exit(1)
