import sys

def repair_line(line):
    # Try to undo: utf-8 bytes -> interpreted as cp1251 -> re-encoded as utf-8
    try:
        # Step 1: Encode to bytes as CP1251 (to get original UTF-8 bytes)
        # Note: We use 'cp1251' because it's the most common Russian/Bulgarian mis-encoding.
        # However, some characters like em-dash use bytes that might be CP1252.
        # We'll try a flexible approach.
        raw_bytes = line.encode('cp1251')
        decoded = raw_bytes.decode('utf-8')
        # If successfully decoded and has Cyrillic, it's likely a fix
        if any('\u0400' <= c <= '\u04FF' for c in decoded):
            return decoded
        return line
    except:
        # Try CP1252 if CP1251 fails (common for symbols)
        try:
            raw_bytes = line.encode('cp1252')
            decoded = raw_bytes.decode('utf-8')
            if any('\u0400' <= c <= '\u04FF' for c in decoded) or '—' in decoded:
                return decoded
            return line
        except:
            return line

def process_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    repaired_lines = []
    for line in lines:
        # Protect Session 247 (lines starting from "## 2026-04-15" or similar)
        # We'll just try to repair every line - if it's already clean, the decode will likely fail or return same.
        repaired = repair_line(line)
        repaired_lines.append(repaired)

    with open(output_path, 'w', encoding='utf-8', newline='\n') as f:
        f.writelines(repaired_lines)

if __name__ == "__main__":
    process_file('docs/dev-log.md', 'docs/dev-log.md.repaired')
    print("Repair complete. Check docs/dev-log.md.repaired")
