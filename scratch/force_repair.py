import sys

def repair_line(line):
    # Specific fix for common mojibake symbols
    if 'вЂ”' in line:
        line = line.replace('вЂ”', '—')
    
    try:
        # Try to recover original UTF-8 bytes from cp1251 mis-interpretation
        raw_bytes = line.encode('cp1251')
        decoded = raw_bytes.decode('utf-8')
        # If it has Cyrillic, it's definitely a fix
        if any('\u0400' <= c <= '\u04FF' for c in decoded):
            return decoded
        return line
    except:
        try:
            # Try CP1252 for symbols
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
        repaired = repair_line(line)
        repaired_lines.append(repaired)

    # Force write as clean UTF-8
    with open(output_path, 'w', encoding='utf-8', newline='\n') as f:
        f.writelines(repaired_lines)

if __name__ == "__main__":
    # Use the backup as source to be safe
    process_file('docs/dev-log.md.corrupted.bak', 'docs/dev-log.md')
    print("Force repair complete from backup.")
