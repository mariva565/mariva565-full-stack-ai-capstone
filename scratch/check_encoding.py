import chardet

with open('docs/dev-log.md', 'rb') as f:
    rawdata = f.read(1000)
    result = chardet.detect(rawdata)
    print(f"Detected: {result}")

# Print first 200 bytes in hex to see what's going on
print(f"First 200 bytes (hex): {rawdata[:200].hex()}")
