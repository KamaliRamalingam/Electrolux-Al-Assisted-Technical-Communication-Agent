const fs = require('fs');

// Fix TemplatesPage.jsx
let tplContent = fs.readFileSync('frontend/src/components/TemplatesPage.jsx', 'utf8');
tplContent = tplContent.replace(/{template\.archived \? '♻️ Unarchive' : "Archive'}/g, "{template.archived ? 'Unarchive' : 'Archive'}");
fs.writeFileSync('frontend/src/components/TemplatesPage.jsx', tplContent);

console.log('Untracked files fixed 3');
