// Data integrity test for Multi-Topic Scientific Investigation Lab

const fs = require('fs');
const path = require('path');

// Mock window object for Node environment
const mockWindow = {};
global.window = mockWindow;

// Read and execute data.js
const dataFilePath = path.join(__dirname, 'data.js');
const dataContent = fs.readFileSync(dataFilePath, 'utf8');
eval(dataContent);

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assert Failed: ${message}`);
    process.exit(1);
  }
}

console.log("Starting Data Integrity Checks...");

// 1. Check Plant Transport Lab
assert(mockWindow.PlantTransportLab !== undefined, "PlantTransportLab is defined");
assert(mockWindow.PlantTransportLab.title === "Leaves and Water Uptake", "Plant Transport title correct");
assert(mockWindow.PlantTransportLab.results.length === 3, "Plant Transport has 3 results rows");

// 2. Check Practice Labs
assert(mockWindow.PracticeLabs !== undefined, "PracticeLabs is defined");
const expectedLabs = ["water_cycle", "electrical", "reproduction", "respiratory", "circulatory"];
expectedLabs.forEach(key => {
  assert(mockWindow.PracticeLabs[key] !== undefined, `Practice lab '${key}' exists`);
  const lab = mockWindow.PracticeLabs[key];
  assert(lab.title !== undefined, `Lab '${key}' has title`);
  assert(lab.changedVariable !== undefined, `Lab '${key}' has changed variable`);
  assert(lab.measuredVariable !== undefined, `Lab '${key}' has measured variable`);
  assert(lab.controlledVariables.length > 0, `Lab '${key}' has controlled variables`);
  assert(lab.quiz !== undefined, `Lab '${key}' has a quiz section`);
  assert(lab.quiz.mcq !== undefined, `Lab '${key}' has mcq`);
  assert(lab.quiz.mcq.options.length >= 2, `Lab '${key}' mcq has at least 2 options`);
  assert(lab.quiz.mcq.correctIndex >= 0 && lab.quiz.mcq.correctIndex < lab.quiz.mcq.options.length, `Lab '${key}' mcq has valid correctIndex`);
  assert(lab.quiz.structured !== undefined, `Lab '${key}' has structured question`);
  assert(lab.quiz.structured.expectedKeywords.length > 0, `Lab '${key}' structured has keywords`);
});
console.log("✓ Practice Labs integrity verified.");

// 3. Check Stage 3 Scenarios
assert(mockWindow.InvestigateScenarios !== undefined, "InvestigateScenarios is defined");
assert(mockWindow.InvestigateScenarios.length === 3, "InvestigateScenarios has 3 scenarios");
mockWindow.InvestigateScenarios.forEach(sc => {
  assert(sc.id !== undefined, "Scenario has ID");
  assert(sc.aim !== undefined, "Scenario has aim");
  assert(sc.changedVariable !== undefined, "Scenario has changed variable");
  assert(sc.measuredVariable !== undefined, "Scenario has measured variable");
  assert(sc.procedure.length > 0, "Scenario has procedure steps");
  assert(sc.results.length === 3, "Scenario has 3 results rows");
  assert(sc.setupOptions.length === 3, "Scenario has 3 fault options");
  const correctSetup = sc.setupOptions.filter(o => o.isCorrect);
  assert(correctSetup.length === 1, `Scenario ${sc.id} has exactly one correct setup option`);
});
console.log("✓ Stage 3 Scenarios integrity verified.");

// 4. Check Mixed Quiz Question Count & Structure
assert(mockWindow.MixedQuizQuestions !== undefined, "MixedQuizQuestions is defined");

const totalQuestions = mockWindow.MixedQuizQuestions.length;
console.log(`Mixed Quiz Question Count: ${totalQuestions}`);

const typeCounts = {};
mockWindow.MixedQuizQuestions.forEach((q, idx) => {
  typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
  assert(q.topic !== undefined, `Question ${idx} has a P5 topic`);
  assert(q.question !== undefined, `Question ${idx} has question text`);
  
  if (q.type === "mcq" || q.type === "graph_reading" || q.type === "conclusion_writing") {
    assert(q.options !== undefined && q.options.length >= 2, `Question ${idx} (${q.type}) must have options`);
    assert(q.correctIndex >= 0 && q.correctIndex < q.options.length, `Question ${idx} (${q.type}) correctIndex is within options bounds`);
  } else if (q.type === "structured" || q.type === "fair_test") {
    assert(q.expectedKeywords !== undefined && q.expectedKeywords.length > 0, `Question ${idx} (${q.type}) has expected keywords`);
    assert(q.expectedAnswers !== undefined && q.expectedAnswers.length > 0, `Question ${idx} (${q.type}) has expected sample answers`);
  } else if (q.type === "variable_id") {
    assert(q.variables !== undefined, `Question ${idx} has variables dictionary`);
    assert(q.variables.changed !== undefined, `Question ${idx} variable_id has changed variable`);
    assert(q.variables.measured !== undefined, `Question ${idx} variable_id has measured variable`);
  }
});

console.log("Type breakdown:", typeCounts);

// Requirements:
// Include at least:
// * 8 MCQs
// * 6 structured questions
// * 2 variable-identification questions
// * 2 fair-test evaluation questions
// * 2 graph questions
// * 2 conclusion-writing questions
// Let's verify:
const mcqCount = (typeCounts["mcq"] || 0);
const structuredCount = (typeCounts["structured"] || 0);
const variableCount = (typeCounts["variable_id"] || 0);
const fairTestCount = (typeCounts["fair_test"] || 0);
const graphCount = (typeCounts["graph_reading"] || 0);
const conclusionCount = (typeCounts["conclusion_writing"] || 0);

assert(mcqCount >= 8, `Mixed quiz has at least 8 MCQs (found ${mcqCount})`);
assert(structuredCount >= 6, `Mixed quiz has at least 6 structured questions (found ${structuredCount})`);
assert(variableCount >= 2, `Mixed quiz has at least 2 variable-identification questions (found ${variableCount})`);
assert(fairTestCount >= 2, `Mixed quiz has at least 2 fair-test questions (found ${fairTestCount})`);
assert(graphCount >= 2, `Mixed quiz has at least 2 graph questions (found ${graphCount})`);
assert(conclusionCount >= 2, `Mixed quiz has at least 2 conclusion questions (found ${conclusionCount})`);

console.log("✓ Mixed Quiz structure meets all criteria!");
console.log("🎉 ALL DATA INTEGRITY CHECKS PASSED!");
