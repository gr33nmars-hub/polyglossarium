import json

with open('web/src/data/curriculum.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove "export const curriculum = " and trailing ";\n"
json_str = content[27:-2]
data = json.loads(json_str)

print(f'Total categories: {len(data)}')
print('\nAll categories:')
for cat in data:
    print(f'  {cat["id"]}: {cat["category"]} ({len(cat["topics"])} topics)')
