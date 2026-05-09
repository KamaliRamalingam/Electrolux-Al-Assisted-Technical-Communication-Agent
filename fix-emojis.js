const fs = require('fs');
const path = require('path');

const componentsDir = 'frontend/src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));

// Regex to match emojis
const emojiRegex = /(?:🏠|✨|📋|📄|⚙️|📊|🔒|🤖|✅|❌|⚠️|ℹ️|💡|📝|🚀|🎉|👍|👎|🔥|🌟|💬|📢|🔔|📣|📧|📨|📩|📤|📥|📦|📫|📪|📬|📭|📮|📯|📜|📃|📑|📈|📉|🗂️|📁|📂|🗄️|📅|📆|🗓️|📇|📌|📍|📎|🖇️|📏|📐|✂️|🖊️|🖋️|✒️|🖌️|🖍️|✏️|🔍|🔎|🔏|🔐|🔓|🔑|🗝️|🔨|🛠️|⚒️|🔧|🔩|🗜️|⚖️|🔗|⛓️|💉|💊|🚬|⚰️|⚱️|🗿|🛢️|🔮|🧿|💈|⚗️|🔭|🔬|🕳️|🩹|🩺|🚪|🛏️|🛋️|🪑|🚽|🚿|🛁|🪒|🧴|🧷|🧹|🧺|🧻|🧼|🧽|🧯|🛒)/g;

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace emojis with empty string
  content = content.replace(emojiRegex, '');
  
  // Specific cleanup for DashboardPage
  if (file === 'DashboardPage.jsx') {
    content = content.replace(/<span className="dash-stat-icon">.*?<\/span>/g, '');
    content = content.replace(/<div className="dash-empty-icon">.*?<\/div>/g, '');
  }
  
  // Specific cleanup for HistoryPage
  if (file === 'HistoryPage.jsx') {
    content = content.replace(/<div className="history-empty-icon">.*?<\/div>/g, '');
  }
  
  // Specific cleanup for TemplatesPage
  if (file === 'TemplatesPage.jsx') {
    content = content.replace(/<div className="tpl-empty-icon">.*?<\/div>/g, '');
  }
  
  fs.writeFileSync(filePath, content);
}
console.log('Emojis removed properly');
