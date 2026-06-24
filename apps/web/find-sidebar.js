const fs = require('fs');
const path = require('path');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (f.endsWith('.vue') || f.endsWith('.ts') || f.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.toLowerCase().includes('sidebar') || content.toLowerCase().includes('menu') || p.toLowerCase().includes('sidebar') || p.toLowerCase().includes('layout')) {
        console.log('================================================================');
        console.log('FILE:', p);
        console.log('================================================================');
        console.log(content);
      }
    }
  });
}

walk('src');
process.exit(1);
