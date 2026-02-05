
import re
import json

filepath = r"c:\Users\Home\Desktop\Polyglossarium\Protocol_polymanth.md"
output_path = r"c:\Users\Home\Desktop\Polyglossarium\web\src\data\curriculum.js"

curriculum = []
current_category = None
current_topic = None

# Matches: ## 20. Title
category_pattern = re.compile(r'^##\s*(?:(\d+)\.\s*)?(.+)$')
# Matches: 186. Title OR 286. **Title**
topic_pattern = re.compile(r'^(\d+)\.\s*(.+)$')
# Matches: - Description
desc_pattern = re.compile(r'^\s*-\s*(.+)$')

last_cat_id = -1

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in lines:
    line = line.strip()
    if not line:
        continue
    if line == "***":
        continue
    # Ignore preamble headers like "ЧАСТЬ 1: ..."
    if line.startswith("ЧАСТЬ"):
        continue

    cat_match = category_pattern.match(line)
    if cat_match:
        if current_topic and current_category:
            current_category['topics'].append(current_topic)
            current_topic = None
        if current_category:
            curriculum.append(current_category)

        cat_id_str = cat_match.group(1)
        cat_title = cat_match.group(2).strip()
        
        if cat_id_str:
            cat_id = int(cat_id_str)
        else:
            cat_id = last_cat_id + 1
        last_cat_id = cat_id

        current_category = {
            "id": cat_id,
            "category": cat_title,
            "description": "",
            "topics": []
        }
        continue

    # Only process topics if we are inside a category
    if current_category:
        topic_match = topic_pattern.match(line)
        if topic_match:
            if current_topic:
                 current_category['topics'].append(current_topic)
            
            t_id = topic_match.group(1)
            raw_content = topic_match.group(2).strip()
            
            # Handle inline styling like **Title**
            # We want to keep markdown for rendering or strip it?
            # Existing curriculum.js has simple text usually?
            # Actually grid system uses .replace(/\*\*/g, '') so it expects it?
            # Step 17 view didn't show **.
            # But Step 59 showed **Метаобучение**.
            # GridSystem.jsx explicitly removes it: `title.replace(/\*\*/g, '')`.
            # So I can keep it.

            # Handle inline description separator ":"
            parts = raw_content.split(": ", 1)
            if len(parts) == 2 and not parts[0].lower().startswith("http"):
                 title = parts[0].strip()
                 desc = parts[1].strip()
            else:
                 title = raw_content
                 desc = ""

            current_topic = {
                "id": t_id,
                "title": title,
                "description": desc
            }
            continue

        desc_match = desc_pattern.match(line)
        if desc_match and current_topic:
             existing = current_topic.get('description', "")
             new_desc = desc_match.group(1).strip()
             if existing:
                 current_topic['description'] = existing + " " + new_desc
             else:
                 current_topic['description'] = new_desc

# Final append
if current_topic and current_category:
    current_category['topics'].append(current_topic)
if current_category:
    curriculum.append(current_category)

js_content = "export const curriculum = " + json.dumps(curriculum, ensure_ascii=False, indent=2) + ";\n"

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Parsed {len(curriculum)} categories from {filepath}")
print(f"Total topics: {sum(len(c['topics']) for c in curriculum)}")
