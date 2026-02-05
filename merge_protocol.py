
import os

base_dir = r"c:\Users\Home\Desktop\Polyglossarium"
protocol_path = os.path.join(base_dir, "Protocol_polymanth.md")
tom2_path = os.path.join(base_dir, "Polyglsssarium_tom_2.md")
tom3_path = os.path.join(base_dir, "Polyglsssarium_tom_3.md")
output_path = protocol_path # Overwriting

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.readlines()

def get_content_start_index(lines, start_marker_prefix):
    for i, line in enumerate(lines):
        if line.strip().startswith(start_marker_prefix):
            return i
    return 0

print("Reading files...")
protocol_lines = read_file(protocol_path)
tom2_lines = read_file(tom2_path)
tom3_lines = read_file(tom3_path)

print(f"Protocol lines: {len(protocol_lines)}")
print(f"Tom2 lines: {len(tom2_lines)}")
print(f"Tom3 lines: {len(tom3_lines)}")

# Process Tom 2
# Find first header "##"
tom2_start = get_content_start_index(tom2_lines, "##")
tom2_content = tom2_lines[tom2_start:]
print(f"Tom2 content starts at line {tom2_start}, extracted {len(tom2_content)} lines")

# Process Tom 3
# Find first separator "***" which precedes the first header
tom3_start = get_content_start_index(tom3_lines, "***")
tom3_content = tom3_lines[tom3_start:]
print(f"Tom3 content starts at line {tom3_start}, extracted {len(tom3_content)} lines")

# Combine
# Ensure protocol ends with newline
if protocol_lines and not protocol_lines[-1].endswith('\n'):
    protocol_lines[-1] += '\n'

# Ensure sufficient separation if needed, but tom2 starts with header and protocol ends with separator
# Protocol ends with separator "***" (checked in analysis)
# Tom2 starts with Header.
# So we need newlines.

final_lines = protocol_lines + ["\n"] + tom2_content + ["\n"] + tom3_content

print(f"Writing {len(final_lines)} lines to {output_path}")
with open(output_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print("Done.")
