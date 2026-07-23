const fs = require('fs');

const path = 'd:/GitHub/Actecrm/src/features/Trainers/AddTrainer.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    { regex: /(<CommonInputField)\s+value=\{name\}/, replace: '$1 errorLabel="Trainer Name"\n                      value={name}' },
    { regex: /(<CommonInputField)\s+required=\{true\}\s+onChange=\{\(e\) => \{\s+setEmail\(e\.target\.value\);/, replace: '$1 errorLabel="Trainer Email"\n                      required={true}\n                      onChange={(e) => {\n                        setEmail(e.target.value);' },
    { regex: /(<PhoneWithCountry)\s+onChange=\{\(value, countryIso2\) => \{\s+setMobile\(value\);/, replace: '$1 errorLabel="Mobile Number"\n                      onChange={(value, countryIso2) => {\n                        setMobile(value);' },
    { regex: /(<PhoneWithCountry)\s+onChange=\{\(value, countryIso2\) => \{\s+setWhatsApp\(value\);/, replace: '$1 errorLabel="WhatsApp Number"\n                      onChange={(value, countryIso2) => {\n                        setWhatsApp(value);' },
    { regex: /(<CommonSelectField)\s+required=\{true\}\s+options=\{technologyOptions\}/, replace: '$1 errorLabel="Technology"\n                          required={true}\n                          options={technologyOptions}' },
    { regex: /(<CommonSelectField)\s+required=\{true\}\s+options=\{experienceOptions\}\s+onChange=\{\(e\) => \{\s+setExperience/, replace: '$1 errorLabel="Experience"\n                      required={true}\n                      options={experienceOptions}\n                      onChange={(e) => {\n                        setExperience' },
    { regex: /(<CommonSelectField)\s+options=\{experienceOptions\}\s+required=\{true\}\s+onChange=\{\(e\) => \{\s+setRelevantExperience/, replace: '$1 errorLabel="Relevant Experience"\n                      options={experienceOptions}\n                      required={true}\n                      onChange={(e) => {\n                        setRelevantExperience' },
    { regex: /(<CommonSelectField)\s+required=\{true\}\s+options=\{batchOptions\}/, replace: '$1 errorLabel="Batch"\n                      required={true}\n                      options={batchOptions}' },
    { regex: /(<CommonMuiTimePicker)\s+required=\{false\}\s+onChange=\{\(value\) => \{\s+setAvaibilityTime/, replace: '$1 errorLabel="Availability Time"\n                      required={false}\n                      onChange={(value) => {\n                        setAvaibilityTime' },
    { regex: /(<CommonMuiTimePicker)\s+required=\{false\}\s+onChange=\{\(value\) => \{\s+setSecondaryTime/, replace: '$1 errorLabel="Secondary Time"\n                      required={false}\n                      onChange={(value) => {\n                        setSecondaryTime' },
    { regex: /(<CommonInputField)\s+required=\{true\}\s+onChange=\{\(e\) => \{\s+setLocation/, replace: '$1 errorLabel="Location"\n                      required={true}\n                      onChange={(e) => {\n                        setLocation' },
    { regex: /(<CommonSelectField)\s+required=\{true\}\s+options=\{\[\s+\{\s*id:\s*"Active"/, replace: '$1 errorLabel="Current Trainer Status"\n                      required={true}\n                      options={[\n                        { id: "Active"' },
];

replacements.forEach(({regex, replace}) => {
    if (!regex.test(content)) {
        console.error("FAILED TO MATCH REGEX:", regex);
    } else {
        content = content.replace(regex, replace);
    }
});

fs.writeFileSync(path, content);
console.log('Successfully injected errorLabels using targeted regex!');
