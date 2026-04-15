import sys

def repair_line(line):
    # Step 1: Specific symbol fixes
    line = line.replace('вЂ”', '—').replace('вЂ—', '—')
    
    # Step 2: Full Byte Restoration
    # This assumes the file was read as some 1-byte encoding and re-saved as UTF-8
    encodings_to_try = ['cp1251', 'cp1252', 'iso-8859-1']
    
    for enc in encodings_to_try:
        try:
            # Get the supposed original bytes
            raw_bytes = line.encode(enc)
            # Try to decode them as UTF-8
            decoded = raw_bytes.decode('utf-8')
            if decoded != line and any('\u0400' <= c <= '\u04FF' for c in decoded):
                return decoded
        except:
            continue
    
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
    process_file('docs/dev-log.md.corrupted.bak', 'docs/dev-log.md')
    print("Ultra repair complete.")
