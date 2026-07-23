const fs = require('fs');

const path = 'd:/GitHub/Actecrm/src/features/Trainers/AddTrainer.jsx';
let content = fs.readFileSync(path, 'utf8');

const techRegex = /(<div\s*style=\{\{\s*display: "flex",\s*alignItems: "center",\s*gap: "3px",\s*\}\}\s*onMouseEnter=\{.*?\}\s*onMouseLeave=\{.*?\}\s*>[\s\S]*?<CommonSelectField[^>]*?label="Technology"[\s\S]*?<\/div>\s*<\/div>)/;

content = content.replace(techRegex, (match) => {
    let newMatch = match.replace(/\s*label="Technology"/, '');
    return `<div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Technology<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    ${newMatch}
                  </div>`;
});

const statusRegex = /(<CommonSelectField[^>]*?label=\{"Current Trainer Status"\}[\s\S]*?\/>)/;
content = content.replace(statusRegex, (match) => {
    let newMatch = match.replace(/\s*label=\{"Current Trainer Status"\}/, '');
    return `<div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Current Trainer Status<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    ${newMatch}
                  </div>`;
});

fs.writeFileSync(path, content);
console.log('Fixed missed labels');
