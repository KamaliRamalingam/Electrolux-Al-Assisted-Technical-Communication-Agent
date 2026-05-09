const fs = require('fs');
const path = require('path');

const filesToFix = [
  'frontend/src/components/TemplatesPage.jsx',
  'frontend/src/components/SettingsPage.jsx',
  'frontend/src/components/AnalyticsPage.jsx',
  'frontend/src/components/AuditLogsPage.jsx'
];

for (const filePath of filesToFix) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unterminated strings
    content = content.replace(/"',/g, "'',");
    
    fs.writeFileSync(filePath, content);
  }
}
console.log('Untracked files fixed');
