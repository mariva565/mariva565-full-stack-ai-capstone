import subprocess

def check_git_file(commit, path):
    try:
        content = subprocess.check_output(['git', 'show', f'{commit}:{path}'], stderr=subprocess.STDOUT)
        # Try to decode first 500 bytes as UTF-8
        try:
            decoded = content[:500].decode('utf-8')
            print(f"--- Commit {commit} ---")
            print(decoded)
        except:
            print(f"--- Commit {commit} is not clean UTF-8 at start ---")
    except Exception as e:
        print(f"Error: {e}")

check_git_file('bd4fe86', 'docs/dev-log.md')
check_git_file('1eeb046', 'docs/dev-log.md')
check_git_file('8edd6fa', 'docs/dev-log.md')
