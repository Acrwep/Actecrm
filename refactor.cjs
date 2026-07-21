const fs = require('fs');
const file = 'src/features/Trainers/Trainers.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace('import ViewTrainerDetails from "./ViewTrainerDetails";', 'import ViewTrainerDetails from "./ViewTrainerDetails";\nimport AddTrainer from "./AddTrainer";');

// 2. Replace {renderPersonalDetails()} with <AddTrainer {...formProps} />
content = content.replace('{renderPersonalDetails()}', '<AddTrainer {...formProps} />');

// 3. Replace the function with formProps
const formProps = `  const formProps = {
    editTrainerId,
    profilePictureArray,
    handlePreview,
    handleProfileAttachment,
    handleRemoveProfile,
    name,
    setName,
    nameError,
    setNameError,
    email,
    setEmail,
    emailError,
    setEmailError,
    mobile,
    setMobile,
    mobileError,
    setMobileError,
    selectedCountry,
    setSelectedCountry,
    setMobileCountryCode,
    whatsApp,
    setWhatsApp,
    whatsAppError,
    setWhatsAppError,
    whatsAppCountry,
    setWhatsAppCountry,
    setWhatsAppCountryCode,
    technology,
    setTechnology,
    technologyError,
    setTechnologyError,
    technologyOptions,
    isTechnologyFocused,
    setIsTechnologyFocused,
    setIsOpenAddCourseModal,
    experience,
    setExperience,
    experienceError,
    setExperienceError,
    experienceOptions,
    relevantExperience,
    setRelevantExperience,
    relevantExperienceError,
    setRelevantExperienceError,
    batch,
    setBatch,
    batchError,
    setBatchError,
    batchOptions,
    skills,
    setSkills,
    skillsError,
    setSkillsError,
    skillsOptions,
    isSkillFocused,
    setIsOpenAddSkillModal,
    avaibilityTime,
    setAvaibilityTime,
    secondaryTime,
    setSecondaryTime,
    location,
    setLocation,
    locationError,
    setLocationError,
    validationTrigger,
  };`;

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('const renderPersonalDetails = () => {'));
let endIdx = -1;
if (startIdx !== -1) {
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].trim() === '};' && lines[i+2] && lines[i+2].trim() === 'return (') {
      endIdx = i;
      break;
    }
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1, formProps);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Successfully replaced!');
} else {
  console.log('Could not find renderPersonalDetails function boundaries', startIdx, endIdx);
}
