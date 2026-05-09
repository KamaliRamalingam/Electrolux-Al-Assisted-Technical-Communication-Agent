const fs = require('fs');
const path = require('path');

// Fix TemplatesPage.jsx
let tplContent = fs.readFileSync('frontend/src/components/TemplatesPage.jsx', 'utf8');
tplContent = tplContent.replace(/{template\?\.id \? "Edit Template' : "New Template'}/g, "{template?.id ? 'Edit Template' : 'New Template'}");
fs.writeFileSync('frontend/src/components/TemplatesPage.jsx', tplContent);

// Fix AuditLogsPage.jsx
let auditContent = fs.readFileSync('frontend/src/components/AuditLogsPage.jsx', 'utf8');
auditContent = auditContent.replace(/{log\.user === 'system' \? "' : log\.user\.charAt\(0\)\.toUpperCase\(\)}/g, "{log.user === 'system' ? '' : log.user.charAt(0).toUpperCase()}");
fs.writeFileSync('frontend/src/components/AuditLogsPage.jsx', auditContent);

console.log('Untracked files fixed 2');
