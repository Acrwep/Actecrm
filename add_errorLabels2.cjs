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
];

fields.forEach(field => {
    const labelString = field.name;
    const componentStr = `<${field.component}`;
    
    // Find where the label string is located in the text
    const labelIndex = content.indexOf(`>\\n                      ${labelString}`);
    if (labelIndex === -1) {
        // try finding without \n
        const altIndex = content.indexOf(`>${labelString}`);
        if (altIndex === -1) {
             const alt2Index = content.indexOf(labelString);
             if (alt2Index !== -1) {
                 const componentIndex = content.indexOf(componentStr, alt2Index);
                 if (componentIndex !== -1 && !content.substring(componentIndex, componentIndex + 50).includes("errorLabel")) {
                     content = content.substring(0, componentIndex + componentStr.length) + ` errorLabel="${field.name}"` + content.substring(componentIndex + componentStr.length);
                 }
             }
             return;
        }
    }
    
    // Find the next occurrence of the component after the label string
    const searchIndex = content.indexOf(labelString);
    if (searchIndex !== -1) {
        const componentIndex = content.indexOf(componentStr, searchIndex);
        if (componentIndex !== -1) {
            // Check if it already has errorLabel
            if (!content.substring(componentIndex, componentIndex + 50).includes("errorLabel")) {
                content = content.substring(0, componentIndex + componentStr.length) + ` errorLabel="${field.name}"` + content.substring(componentIndex + componentStr.length);
            }
        }
    }
});

fs.writeFileSync(path, content);
console.log('Successfully injected errorLabel with indexOf');
