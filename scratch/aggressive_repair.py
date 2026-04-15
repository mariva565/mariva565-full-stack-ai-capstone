import sys

def repair_line(line):
    # Fix the dash mojibake specifically
    if 'вЂ”' in line:
        line = line.replace('вЂ”', '—')
    
    try:
        # Step 1: Try to recover original UTF-8 bytes from cp1251 mis-interpretation
        raw_bytes = line.encode('cp1251')
        decoded = raw_bytes.decode('utf-8')
        
        # Heuristic: count lowercase cyrillic letters
        # Original mojibake has lots of "Р" (U+0420) and "С" (U+0421) instead of small letters
        orig_small = sum(1 for c in line if '\u0430' <= c <= '\u044f')
        new_small = sum(1 for c in decoded if '\u0430' <= c <= '\u044f')
        
        # If the decoded version has more lowercase cyrillic letters, it's almost certainly the fix
        if new_small > orig_small or ('—' in decoded and '—' not in line):
            return decoded
        return line
    except:
        try:
            # Try CP1252 for some edge cases with symbols
            raw_bytes = line.encode('cp1252')
            decoded = raw_bytes.decode('utf-8')
            if any('\u0430' <= c <= '\u044f' for c in decoded) or '—' in decoded:
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

    with open(output_path, 'w', encoding='utf-8', newline='\n') as f:
        f.writelines(repaired_lines)

if __name__ == "__main__":
    # Use the backup as source again to ensure we don't double-damage
    process_file('docs/dev-log.md.corrupted.bak', 'docs/dev-log.md')
    print("Aggressive repair complete from backup.")
