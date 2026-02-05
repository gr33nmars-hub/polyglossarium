
import os

base_dir = r"c:\Users\Home\Desktop\Polyglossarium"
protocol_path = os.path.join(base_dir, "Protocol_polymanth.md")
tom1_path = os.path.join(base_dir, "Polyglsssarium_tom_1.md")
output_path = protocol_path

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.readlines()

def get_content_start_index(lines, start_marker_prefix):
    for i, line in enumerate(lines):
        if line.strip().startswith(start_marker_prefix):
            return i
    return 0

protocol_lines = read_file(protocol_path)
tom1_lines = read_file(tom1_path)

# Find where ## 14 starts in protocol
insert_index = -1
for i, line in enumerate(protocol_lines):
    if line.strip().startswith("## 14."):
        insert_index = i
        break

if insert_index == -1:
    print("Could not find ## 14. in Protocol. Appending to end or assuming different structure?")
    # If not found, maybe I should just append? But I know it is there.
    exit(1)

# Extract tom1 from first ## (which should be 0 or 1)
# tom_1 typically starts with 0. Metaskills?
tom1_start = get_content_start_index(tom1_lines, "##")
tom1_content = tom1_lines[tom1_start:]

# We need a separator before tom1 (if methodology doesn't end with one)
# And separator after tom1
separator = ["\n", "***\n", "\n"]

# Check previous lines in protocol
# Protocol lines 0..insert_index
pre_content = protocol_lines[:insert_index]
# Check if pre_content ends with separator
# tom1_content starts with ##
# We want: ...Text \n *** \n ## 0... \n *** \n ## 14...

# tom1 content likely ends with separator?
# Let's check tom1 last lines in logic? No easy way.
# Just ensuring separators between blocks.

# The Protocol file currently has "Text... \n ## 14..."
# We want "Text... \n *** \n ## 0... [content] \n *** \n ## 14..."

# Does tom1_content start with ##? Yes.
# Does it start with ***? No. 
# So add separator before.

# Does tom1_content END with ***? 
# Usually no.
# So add separator after.

# Does ## 14 in protocol have separator before it?
# Step 72 showed:
# 153: Text
# 155: ## 14
# No separator.

final_lines = pre_content + separator + tom1_content + separator + protocol_lines[insert_index:]

with open(output_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print(f"Inserted {len(tom1_content)} lines from Tom 1.")
