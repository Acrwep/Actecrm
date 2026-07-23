const fs = require('fs');

const path = 'd:/GitHub/Actecrm/src/features/Trainers/AddTrainer.jsx';
let content = fs.readFileSync(path, 'utf8');

const fields = [
    { name: "Trainer Name", required: true, isWrapped: false, component: "CommonInputField" },
    { name: "Trainer Email", required: true, isWrapped: false, component: "CommonInputField" },
    { name: "Mobile Number", required: true, isWrapped: false, component: "PhoneWithCountry" },
    { name: "WhatsApp Number", required: true, isWrapped: false, component: "PhoneWithCountry" },
    { name: "Technology", required: true, isWrapped: true, component: "CommonSelectField" },
    { name: "Experience", required: true, isWrapped: false, component: "CommonSelectField" },
    { name: "Relevant Experience", required: true, isWrapped: false, component: "CommonSelectField" },
    { name: "Batch", required: true, isWrapped: false, component: "CommonSelectField" },
    { name: "Availability Time", required: true, isWrapped: false, component: "CommonMuiTimePicker" },
    { name: "Secondary Time", required: false, isWrapped: false, component: "CommonMuiTimePicker" },
    { name: "Location", required: true, isWrapped: false, component: "CommonInputField" },
    { name: "Current Trainer Status", required: true, isWrapped: false, component: "CommonSelectField" },
];

fields.forEach(field => {
    // Determine the exact string to find
    if (field.isWrapped) {
        // Specifically for Technology
        const regexStr = `(<div\\s*style=\\{\\{\\s*display: "flex",\\s*alignItems: "center",\\s*gap: "3px",\\s*\\}\\}[\\s\\S]*?<${field.component}[^>]*?label=[\"\{]${field.name}[\"\}][\\s\\S]*?\\/>\\s*<\\/div>\\s*<\\/div>\\s*<\\/div>)`;
        const regex = new RegExp(regexStr);
        content = content.replace(regex, (match) => {
            if (match.includes("trainer_skillslabel")) return match; // already wrapped
            let newMatch = match.replace(new RegExp(`\\s*label=[\"\{]${field.name}[\"\}]`), '');
            const star = field.required ? '<span style={{ color: "#d32f2f" }}> *</span>' : '';
            return `<div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      ${field.name}${star}
                    </p>
                    ${newMatch}
                  </div>`;
        });
    } else {
        const regexStr = `(<${field.component}[^>]*?label=[\"\{]${field.name}[\"\}][\\s\\S]*?\\/>)`;
        const regex = new RegExp(regexStr);
        content = content.replace(regex, (match) => {
            if (match.includes("trainer_skillslabel")) return match; // already wrapped
            let newMatch = match.replace(new RegExp(`\\s*label=[\"\{]${field.name}[\"\}]`), '');
            const star = field.required ? '<span style={{ color: "#d32f2f" }}> *</span>' : '';
            return `<div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      ${field.name}${star}
                    </p>
                    ${newMatch}
                  </div>`;
        });
    }
});

fs.writeFileSync(path, content);
console.log('Moved labels outside in AddTrainer.jsx');
