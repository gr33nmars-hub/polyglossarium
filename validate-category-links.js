#!/usr/bin/env node

/**
 * Validation script for category links in TreeMap.jsx
 */

import fs from 'fs/promises';

async function validateCategoryLinks() {
  console.log('🔍 Validating category links in TreeMap.jsx...\n');
  
  const treeMapPath = 'web/src/components/TreeMap.jsx';
  const content = await fs.readFile(treeMapPath, 'utf-8');
  
  // Extract getCategoryIntro function
  const functionMatch = content.match(/const getCategoryIntro = \(categoryName\) => \{([\s\S]*?)\n\};/);
  
  if (!functionMatch) {
    console.error('❌ Could not find getCategoryIntro function');
    return;
  }
  
  const functionBody = functionMatch[1];
  
  // Extract all category entries
  const categoryMatches = [...functionBody.matchAll(/'([^']+)':\s*'([^']+(?:\n[^']*)*?)'/g)];
  
  console.log(`📊 Found ${categoryMatches.length} categories\n`);
  
  let totalLinks = 0;
  let categoriesWithLinks = 0;
  
  for (const match of categoryMatches) {
    const [, categoryName, description] = match;
    
    // Count links in description
    const linkMatches = [...description.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    
    if (linkMatches.length > 0) {
      categoriesWithLinks++;
      totalLinks += linkMatches.length;
      
      console.log(`✅ ${categoryName}: ${linkMatches.length} links`);
      linkMatches.forEach(([, text, url]) => {
        console.log(`   - [${text}](${url})`);
      });
      console.log();
    } else {
      console.log(`⚠️  ${categoryName}: NO LINKS`);
      console.log();
    }
  }
  
  console.log('\n📈 SUMMARY:');
  console.log(`   Total categories: ${categoryMatches.length}`);
  console.log(`   Categories with links: ${categoriesWithLinks}`);
  console.log(`   Total links: ${totalLinks}`);
  console.log(`   Average links per category: ${(totalLinks / categoryMatches.length).toFixed(1)}`);
  
  if (categoriesWithLinks === categoryMatches.length) {
    console.log('\n✅ SUCCESS: All categories have resource links!');
  } else {
    console.log(`\n⚠️  WARNING: ${categoryMatches.length - categoriesWithLinks} categories missing links`);
  }
}

validateCategoryLinks().catch(console.error);
