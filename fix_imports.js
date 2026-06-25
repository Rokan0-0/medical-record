import fs from 'fs';
import path from 'path';

const srcDir = './src';

function walkDir(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      files = files.concat(walkDir(filePath));
    } else {
      files.push(filePath);
    }
  });
  return files;
}

const files = walkDir(srcDir);

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Regex matches package names (scoped or unscoped) with a @version suffix inside quotes
    // e.g. "class-variance-authority@0.7.1" or "@radix-ui/react-slot@1.1.2"
    const updatedContent = content.replace(/(["'])(@[a-z0-9\-]+\/[a-z0-9\-]+|[a-z0-9\-]+)@\d+(?:\.\d+)*(?:-[a-z0-9\.]+)?\1/gi, '$1$2$1');
    
    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent, 'utf8');
      console.log(`Fixed imports in: ${file}`);
    }
  }
});

console.log('Finished fixing all package imports.');
