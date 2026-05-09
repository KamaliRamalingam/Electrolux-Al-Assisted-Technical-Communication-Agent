const fs = require('fs');
const path = require('path');

const componentsDir = 'frontend/src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove emojis from headings and buttons
  content = content.replace(/['"](?:🏠|✨|📋|📄|⚙️|📊|🔒|🤖|✅|❌|⚠️|ℹ️|💡|📝|🚀|🎉|👍|👎|🔥|🌟|💬|📢|🔔|📣|📧|📨|📩|📤|📥|📦|📫|📪|📬|📭|📮|📯|📜|📃|📑|📊|📈|📉|🗂️|📁|📂|🗄️|📅|📆|🗓️|📇|📋|📌|📍|📎|🖇️|📏|📐|✂️|🖊️|🖋️|✒️|🖌️|🖍️|📝|✏️|🔍|🔎|🔏|🔐|🔓|🔏|🔐|🔑|🗝️|🔨|🛠️|⚒️|🔧|🔩|⚙️|🗜️|⚖️|🔗|⛓️|💉|💊|🚬|⚰️|⚱️|🗿|🛢️|🔮|🧿|💈|⚗️|🔭|🔬|🕳️|🩹|🩺|🚪|🛏️|🛋️|🪑|🚽|🚿|🛁|🪒|🧴|🧷|🧹|🧺|🧻|🧼|🧽|🧯|🛒|🚬|⚰️|⚱️|🗿|🛢️|🔮|🧿|💈|⚗️|🔭|🔬|🕳️|🩹|🩺|🚪|🛏️|🛋️|🪑|🚽|🚿|🛁|🪒|🧴|🧷|🧹|🧺|🧻|🧼|🧽|🧯|🛒)\s*/g, '"');
  content = content.replace(/>(?:🏠|✨|📋|📄|⚙️|📊|🔒|🤖|✅|❌|⚠️|ℹ️|💡|📝|🚀|🎉|👍|👎|🔥|🌟|💬|📢|🔔|📣|📧|📨|📩|📤|📥|📦|📫|📪|📬|📭|📮|📯|📜|📃|📑|📊|📈|📉|🗂️|📁|📂|🗄️|📅|📆|🗓️|📇|📋|📌|📍|📎|🖇️|📏|📐|✂️|🖊️|🖋️|✒️|🖌️|🖍️|📝|✏️|🔍|🔎|🔏|🔐|🔓|🔏|🔐|🔑|🗝️|🔨|🛠️|⚒️|🔧|🔩|⚙️|🗜️|⚖️|🔗|⛓️|💉|💊|🚬|⚰️|⚱️|🗿|🛢️|🔮|🧿|💈|⚗️|🔭|🔬|🕳️|🩹|🩺|🚪|🛏️|🛋️|🪑|🚽|🚿|🛁|🪒|🧴|🧷|🧹|🧺|🧻|🧼|🧽|🧯|🛒|🚬|⚰️|⚱️|🗿|🛢️|🔮|🧿|💈|⚗️|🔭|🔬|🕳️|🩹|🩺|🚪|🛏️|🛋️|🪑|🚽|🚿|🛁|🪒|🧴|🧷|🧹|🧺|🧻|🧼|🧽|🧯|🛒)\s*/g, '>');
  
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
console.log('Pages cleaned up');
