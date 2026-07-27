// Updated Data Integrity Test for Skills-Based P5 Scientific Investigation Academy
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

console.log("🚀 Starting Skills-Based Data Integrity Checks...");

// 1. Verify AcademyModules structure
assert(mockWindow.AcademyModules !== undefined, "AcademyModules is defined in global window");
assert(Array.isArray(mockWindow.AcademyModules), "AcademyModules is an array");
assert(mockWindow.AcademyModules.length === 8, `AcademyModules should contain exactly 8 modules, found: ${mockWindow.AcademyModules.length}`);

// Topics frequency checker to ensure transfer of skills
const topicCountMap = {};

mockWindow.AcademyModules.forEach((mod, idx) => {
  const mId = idx + 1;
  assert(mod.id === mId, `Module ${mId} ID mismatch`);
  assert(typeof mod.title === "string" && mod.title.length > 0, `Module ${mId} has valid title`);
  assert(typeof mod.badge === "string" && mod.badge.length > 0, `Module ${mId} has valid badge name`);
  assert(typeof mod.badgeIcon === "string" && mod.badgeIcon.length > 0, `Module ${mId} has valid badge icon`);
  assert(Array.isArray(mod.objectives) && mod.objectives.length > 0, `Module ${mId} has objectives list`);

  // Verify Teaching Concept & Modelled Examples
  assert(mod.teaching !== undefined, `Module ${mId} has teaching content`);
  assert(typeof mod.teaching.concept === "string" && mod.teaching.concept.length > 0, `Module ${mId} has teaching explanation`);
  assert(Array.isArray(mod.teaching.workedExamples) && mod.teaching.workedExamples.length >= 2, `Module ${mId} has at least 2 worked examples`);
  
  mod.teaching.workedExamples.forEach((ex, exIdx) => {
    assert(typeof ex.topic === "string" && ex.topic.length > 0, `Module ${mId} worked example ${exIdx} has topic`);
    assert(typeof ex.scenario === "string" && ex.scenario.length > 0, `Module ${mId} worked example ${exIdx} has scenario`);
    assert(typeof ex.conceptModel === "string" && ex.conceptModel.length > 0, `Module ${mId} worked example ${exIdx} has concept model`);
    
    topicCountMap[ex.topic] = (topicCountMap[ex.topic] || 0) + 1;
  });

  // Verify Scaffolded Practices
  assert(Array.isArray(mod.practice) && mod.practice.length >= 3, `Module ${mId} must have at least 3 scaffolded practice activities`);
  mod.practice.forEach((prac, pIdx) => {
    assert(typeof prac.id === "string" && prac.id.length > 0, `Module ${mId} practice ${pIdx} has valid ID`);
    assert(typeof prac.topic === "string" && prac.topic.length > 0, `Module ${mId} practice ${pIdx} has topic`);
    assert(typeof prac.type === "string" && prac.type.length > 0, `Module ${mId} practice ${pIdx} has question type`);
    assert(typeof prac.questionText === "string" && prac.questionText.length > 0, `Module ${mId} practice ${pIdx} has description`);
    assert(typeof prac.hint === "string" && prac.hint.length > 0, `Module ${mId} practice ${pIdx} has helper hint`);
    
    // Type-specific validations
    if (prac.type === "sort" && prac.items) {
      assert(Array.isArray(prac.items) && prac.items.length >= 2, `Module ${mId} sorting practice has elements`);
    } else if (prac.type === "select") {
      assert(Array.isArray(prac.options) && prac.options.length >= 2, `Module ${mId} MCQ practice has options`);
      assert(prac.correctIndex >= 0 && prac.correctIndex < prac.options.length, `Module ${mId} MCQ practice has valid correctIndex`);
    } else if (prac.type === "scramble") {
      assert(Array.isArray(prac.scrambledWords) && prac.scrambledWords.length >= 3, `Module ${mId} scramble has words`);
      assert(Array.isArray(prac.correctOrder) && prac.correctOrder.length === prac.scrambledWords.length, `Module ${mId} scramble matches bounds`);
    }
    
    topicCountMap[prac.topic] = (topicCountMap[prac.topic] || 0) + 1;
  });

  // Verify Quizzes
  assert(Array.isArray(mod.quiz) && mod.quiz.length >= 3, `Module ${mId} must have at least 3 quiz questions`);
  mod.quiz.forEach((q, qIdx) => {
    assert(typeof q.question === "string" && q.question.length > 0, `Module ${mId} quiz ${qIdx} has question text`);
    assert(Array.isArray(q.options) && q.options.length >= 2, `Module ${mId} quiz ${qIdx} has choices`);
    assert(q.correctIndex >= 0 && q.correctIndex < q.options.length, `Module ${mId} quiz ${qIdx} has valid correctIndex`);
  });
});

console.log("✓ Core Module structures verified!");

// 2. Verify Teacher Dashboard mock reports
assert(mockWindow.MockStudentProgress !== undefined, "MockStudentProgress is defined");
assert(Array.isArray(mockWindow.MockStudentProgress), "MockStudentProgress is an array");
assert(mockWindow.MockStudentProgress.length >= 5, "MockStudentProgress has at least 5 records");

mockWindow.MockStudentProgress.forEach((st, idx) => {
  assert(typeof st.name === "string" && st.name.length > 0, `Student ${idx} has name`);
  assert(st.completedModules >= 0 && st.completedModules <= 8, `Student ${idx} completedModules within bounds`);
  assert(st.averageQuizScore >= 0 && st.averageQuizScore <= 100, `Student ${idx} has valid score percentage`);
  assert(st.xp >= 0, `Student ${idx} has non-negative XP`);
  assert(Array.isArray(st.misconceptions), `Student ${idx} misconceptions list is array`);
});

console.log("✓ Teacher Reports database verified!");

// Print P5 Science Topics coverage summary
console.log("\n-------------------------------------------");
console.log("P5 MOE Science Topics Coverage Summary:");
console.log("-------------------------------------------");
for (const [topic, count] of Object.entries(topicCountMap)) {
  console.log(`- ${topic.padEnd(25)}: ${count} occurrences`);
}
console.log("-------------------------------------------");

console.log("\n🎉 ALL SKILLS ACADEMY DATABASE CHECKS PASSED SUCCESSFULLY!");
