import questions from './questions';

const sectionMap = new Map();
questions.forEach((q) => {
  if (!sectionMap.has(q.sectionId)) {
    sectionMap.set(q.sectionId, {
      id: q.sectionId,
      name: `Section ${q.sectionId}`,
      time: 40 * 60,
      questions: [],
    });
  }
  sectionMap.get(q.sectionId).questions.push(q);
});

const sections = Array.from(sectionMap.values());

export default sections;
