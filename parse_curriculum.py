#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Polyglossarium Curriculum Parser
Parses 3 Markdown files and generates web/src/data/curriculum.js
"""

import re
import json
import sys
from pathlib import Path
from typing import List, Dict, Optional


class CurriculumParser:
    """Parser for Polyglossarium Markdown files"""
    
    def __init__(self):
        self.categories = []
        self.current_category = None
        self.current_category_id = 0
        self.all_topic_ids = set()
        self.errors = []
        self.warnings = []
    
    def parse_files(self, file_paths: List[str]) -> List[Dict]:
        """Parse all Markdown files and return categories"""
        for file_path in file_paths:
            print(f"Parsing {file_path}...")
            self._parse_file(file_path)
        
        # Add last category if exists
        if self.current_category:
            self._finalize_category()
        
        # Validate data
        self._validate()
        
        return self.categories
    
    def _parse_file(self, file_path: str):
        """Parse a single Markdown file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except FileNotFoundError:
            self.errors.append(f"File not found: {file_path}")
            return
        
        i = 0
        while i < len(lines):
            line = lines[i].rstrip()
            
            # Skip empty lines and separators
            if not line or line.startswith('***') or line.startswith('Великий Мастер'):
                i += 1
                continue
            
            # Detect category header (## N. Category Name or ## Special Name)
            if line.startswith('## '):
                # Save previous category
                if self.current_category:
                    self._finalize_category()
                
                # Extract category
                match = re.match(r'## (\d+)\.\s+(.+)', line)
                if match:
                    category_num = int(match.group(1))
                    category_name = match.group(2).strip()
                    
                    self.current_category = {
                        'id': self.current_category_id,
                        'category': category_name,
                        'description': '',
                        'topics': []
                    }
                    self.current_category_id += 1
                else:
                    # Check for special header without number (e.g., "## Заключительный блок: Вершина познания")
                    special_match = re.match(r'## (.+)', line)
                    if special_match:
                        category_name = special_match.group(1).strip()
                        self.current_category = {
                            'id': self.current_category_id,
                            'category': category_name,
                            'description': '',
                            'topics': []
                        }
                        self.current_category_id += 1
                    else:
                        self.warnings.append(f"Invalid category header format: {line}")
                
                i += 1
                continue
            
            # Detect topic (N. Topic Name or N. **Topic Name**: Description)
            if re.match(r'^\d+\.\s+', line):
                topic_match = re.match(r'^(\d+)\.\s+(.+)', line)
                if topic_match and self.current_category is not None:
                    topic_id = topic_match.group(1)
                    rest = topic_match.group(2).strip()
                    
                    # Check if it's the special format: **Title**: Description
                    special_match = re.match(r'\*\*(.+?)\*\*:\s*(.+)', rest)
                    if special_match:
                        topic_title = special_match.group(1).strip()
                        description = special_match.group(2).strip()
                        i += 1
                    else:
                        # Regular format: title on this line, description on next
                        topic_title = rest
                        
                        # Read description from next line(s)
                        description = ''
                        i += 1
                        while i < len(lines):
                            desc_line = lines[i].rstrip()
                            if desc_line.startswith('   - '):
                                # Extract description (remove "   - " prefix)
                                description = desc_line[5:].strip()
                                i += 1
                                break
                            elif not desc_line:
                                # Empty line, no description
                                break
                            else:
                                i += 1
                                break
                    
                    # Create topic
                    topic = {
                        'id': topic_id,
                        'title': topic_title,
                        'description': description
                    }
                    
                    self.current_category['topics'].append(topic)
                    
                    # Track topic ID for uniqueness check
                    if topic_id in self.all_topic_ids:
                        self.errors.append(f"Duplicate topic ID: {topic_id}")
                    self.all_topic_ids.add(topic_id)
                    
                    continue
            
            i += 1
    
    def _finalize_category(self):
        """Finalize current category and add to list"""
        if self.current_category:
            if len(self.current_category['topics']) == 0:
                self.warnings.append(
                    f"Category {self.current_category['id']} "
                    f"'{self.current_category['category']}' has no topics"
                )
            self.categories.append(self.current_category)
            self.current_category = None
    
    def _validate(self):
        """Validate parsed data"""
        # Check total number of categories (should be 62: categories 0-61)
        if len(self.categories) != 62:
            self.warnings.append(
                f"Expected 62 categories (0-61), found {len(self.categories)}"
            )
        
        # Check total number of topics
        total_topics = sum(len(cat['topics']) for cat in self.categories)
        if total_topics != 290:
            self.warnings.append(
                f"Expected 290 topics, found {total_topics}"
            )
        
        # Check topic ID range
        expected_ids = set(str(i) for i in range(1, 291))
        if self.all_topic_ids != expected_ids:
            missing = expected_ids - self.all_topic_ids
            extra = self.all_topic_ids - expected_ids
            if missing:
                self.errors.append(f"Missing topic IDs: {sorted(missing, key=int)}")
            if extra:
                self.errors.append(f"Extra topic IDs: {sorted(extra, key=int)}")
        
        # Check required fields
        for cat in self.categories:
            if 'id' not in cat or 'category' not in cat:
                self.errors.append(f"Category missing required fields: {cat}")
            
            for topic in cat['topics']:
                if 'id' not in topic or 'title' not in topic or 'description' not in topic:
                    self.errors.append(
                        f"Topic in category {cat['id']} missing required fields: {topic}"
                    )
    
    def print_report(self):
        """Print parsing report"""
        print("\n" + "="*60)
        print("PARSING REPORT")
        print("="*60)
        print(f"Categories: {len(self.categories)}")
        print(f"Topics: {sum(len(cat['topics']) for cat in self.categories)}")
        
        if self.warnings:
            print(f"\nWarnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  ⚠ {warning}")
        
        if self.errors:
            print(f"\nErrors ({len(self.errors)}):")
            for error in self.errors:
                print(f"  ✗ {error}")
            print("\n❌ Parsing failed with errors!")
            return False
        else:
            print("\n✓ Parsing completed successfully!")
            return True


def generate_curriculum_js(categories: List[Dict], output_path: str):
    """Generate curriculum.js file"""
    print(f"\nGenerating {output_path}...")
    
    # Convert to JSON with proper formatting
    json_data = json.dumps(categories, ensure_ascii=False, indent=2)
    
    # Create JavaScript module
    js_content = f"export const curriculum = {json_data};\n"
    
    # Write to file
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"✓ Generated {output_path} ({len(js_content)} bytes)")


def main():
    """Main entry point"""
    print("Polyglossarium Curriculum Parser")
    print("="*60)
    
    # Input files
    input_files = [
        'Polyglsssarium_tom_1.md',
        'Polyglsssarium_tom_2.md',
        'Polyglsssarium_tom_3.md'
    ]
    
    # Output file
    output_file = 'web/src/data/curriculum.js'
    
    # Parse files
    parser = CurriculumParser()
    categories = parser.parse_files(input_files)
    
    # Print report
    success = parser.print_report()
    
    if not success:
        sys.exit(1)
    
    # Generate output
    generate_curriculum_js(categories, output_file)
    
    print("\n✓ All done!")


if __name__ == '__main__':
    main()
