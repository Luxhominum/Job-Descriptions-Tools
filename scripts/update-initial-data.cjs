const fs = require('fs');
const path = require('path');

const reqMapPath = path.join(__dirname, '..', 'src', 'data', 'jobRequirementsMap.json');
const initialDataPath = path.join(__dirname, '..', 'src', 'data', 'initialData.ts');

const reqMap = JSON.parse(fs.readFileSync(reqMapPath, 'utf8'));
let content = fs.readFileSync(initialDataPath, 'utf8');

for (const [code, req] of Object.entries(reqMap)) {
  const codeNeedle = `code: '${code}',`;
  const pos = content.indexOf(codeNeedle);
  if (pos !== -1) {
    const skillsNeedle = 'requiredSkills:';
    const skillsPos = content.indexOf(skillsNeedle, pos);
    if (skillsPos !== -1) {
      const skillsEndPos = content.indexOf('],', skillsPos);
      if (skillsEndPos !== -1) {
        const insertion = 
          `\n    educationRequirement: ${JSON.stringify(req.education)},` +
          `\n    experienceRequirement: ${JSON.stringify(req.experience)},` +
          `\n    technicalRequirements: ${JSON.stringify(req.technical)},` +
          `\n    softSkills: ${JSON.stringify(req.softSkills)},` +
          `\n    specialRequirements: ${JSON.stringify(req.special)},`;
        
        content = content.slice(0, skillsEndPos + 2) + insertion + content.slice(skillsEndPos + 2);
      }
    }
  }
}

fs.writeFileSync(initialDataPath, content, 'utf8');
console.log('Successfully updated src/data/initialData.ts with full requirements!');
