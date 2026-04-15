import subprocess

try:
    # Get the clean content from git directly as bytes
    content = subprocess.check_output(['git', 'show', '0e44cc77:docs/dev-log.md'], stderr=subprocess.STDOUT)

    # Write it back strictly as UTF-8 bytes to docs/dev-log.md
    with open('docs/dev-log.md', 'wb') as f:
        f.write(content)
    
    print("Dev-log restored to 0e44cc77 version successfully.")
except Exception as e:
    print(f"Error restoring dev-log: {e}")
