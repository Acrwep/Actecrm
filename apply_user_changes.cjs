const fs = require('fs');
let content = fs.readFileSync('d:/GitHub/Actecrm/src/features/Trainers/AddTrainer.jsx', 'utf8');

content = content.replace(/trainer_skillslabel_new/g, 'trainer_skillslabel');
content = content.replace(/alignItems: "flex-end"/g, 'alignItems: "stretch"');
content = content.replace(/style=\{\{ height: "36px" \}\}/g, 'style={{ height: "auto", minHeight: "36px" }}');

fs.writeFileSync('d:/GitHub/Actecrm/src/features/Trainers/AddTrainer.jsx', content);
console.log('Applied user changes');
