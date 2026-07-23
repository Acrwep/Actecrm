const fs = require('fs');

const path = 'd:/GitHub/Actecrm/src/features/Trainers/AddTrainer.jsx';
let content = fs.readFileSync(path, 'utf8');

const fields = [
    { name: "Trainer Name", component: "CommonInputField" },
    { name: "Trainer Email", component: "CommonInputField" },
    { name: "Mobile Number", component: "PhoneWithCountry" },
    { name: "WhatsApp Number", component: "PhoneWithCountry" },
    { name: "Technology", component: "CommonSelectField" },
    { name: "Experience", component: "CommonSelectField" },
    { name: "Relevant Experience", component: "CommonSelectField" },
    { name: "Batch", component: "CommonSelectField" },
    { name: "Availability Time", component: "CommonMuiTimePicker" },
    { name: "Secondary Time", component: "CommonMuiTimePicker" },
    { name: "Location", component: "CommonInputField" },
    { name: "Current Trainer Status", component: "CommonSelectField" },
    // Also include Skills and Certifications for completeness!
    { name: "Skills", component: "CommonOptionsMultiSelect" },
    { name: "Certifications", component: "CommonOptionsMultiSelect" },
];

fields.forEach(field => {
    // Escape special characters in field.name just in case, though there are none here.
    const escapedName = field.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Find: <p className={"trainer_skillslabel"}> \s*? Trainer Name [\s\S]*? </p> [\s\S]*? <CommonInputField
    const regex = new RegExp(`(<p className=\\{"trainer_skillslabel"\\}>\\s*?${escapedName}[\\s\\S]*?<\\/p>[\\s\\S]*?<${field.component})(?!\\s+errorLabel=)`, 'g');
    
    content = content.replace(regex, (match) => {
        return `${match} errorLabel="${field.name}"`;
    });
});

fs.writeFileSync(path, content);
console.log('Successfully injected errorLabel into AddTrainer.jsx');
