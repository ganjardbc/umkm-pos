const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

try {
  const rootPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const version = rootPkg.version || '1.0.0';

  const files = walk(path.join(__dirname, '../apps/web/src'));
  let sidebarFiles = files.filter(f => f.toLowerCase().includes('sidebar') && f.endsWith('.vue'));
  if (sidebarFiles.length === 0) {
    sidebarFiles = files.filter(f => (f.toLowerCase().includes('layout') || f.toLowerCase().includes('footer')) && f.endsWith('.vue'));
  }

  sidebarFiles.forEach(sidebarFile => {
    let content = fs.readFileSync(sidebarFile, 'utf8');
    
    if (content.includes('<!-- app-version -->')) {
      const versionRegex = /<!-- app-version -->[\s\S]*?<\/div>/;
      content = content.replace(versionRegex, `<!-- app-version --><div class="text-xs text-gray-400 text-center py-2">v${version}</div>`);
      fs.writeFileSync(sidebarFile, content, 'utf8');
      console.log(`Updated version in ${sidebarFile}`);
      return;
    }

    const templateEnd = content.lastIndexOf('</template>');
    if (templateEnd !== -1) {
      const templateContent = content.substring(0, templateEnd);
      let insertIndex = -1;
      
      const footerRegex = /<div[^>]*class="[^"]*(?:footer|mt-auto)[^"]*"[^>]*>/gi;
      let match;
      let lastFooterMatch = null;
      while ((match = footerRegex.exec(templateContent)) !== null) {
        lastFooterMatch = match;
      }
      
      if (lastFooterMatch) {
        const openTagEnd = lastFooterMatch.index + lastFooterMatch[0].length;
        insertIndex = openTagEnd;
        const versionHtml = `\n      <!-- app-version --><div class="text-xs text-gray-400 text-center py-2">v${version}</div>`;
        content = content.substring(0, insertIndex) + versionHtml + content.substring(insertIndex);
        console.log(`Injected version into footer of ${sidebarFile}`);
      } else {
        const lastDiv = templateContent.lastIndexOf('</div>');
        if (lastDiv !== -1) {
          const versionHtml = `\n    <!-- app-version --><div class="text-xs text-gray-400 text-center py-2">v${version}</div>\n`;
          content = content.substring(0, lastDiv) + versionHtml + content.substring(lastDiv);
          console.log(`Injected version before last div of ${sidebarFile}`);
        }
      }
      
      fs.writeFileSync(sidebarFile, content, 'utf8');
    }
  });
} catch (err) {
  console.error('Error adding version:', err);
}