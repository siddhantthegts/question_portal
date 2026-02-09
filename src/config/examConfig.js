
export const sectionOrderers = {
  CAT: (sections) => {
    const orderMap = {
      'VARC': 0,
      'DILR': 1,
      'QA': 2,
    };
    
    return [...sections].sort((a, b) => {
      const aName = (a.sectionName || '').toUpperCase().trim();
      const bName = (b.sectionName || '').toUpperCase().trim();
      
      const aOrder = orderMap[aName] !== undefined ? orderMap[aName] : 999;
      const bOrder = orderMap[bName] !== undefined ? orderMap[bName] : 999;
      
      return aOrder - bOrder;
    });
  },
  default: (sections) => [...sections],
};

export const sectionLockRules = {
  CAT: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = idx !== 0; // Index 0 (VARC) should be unlocked (false), others locked (true)
    });
    return locks;
  },
  SNAP: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = false;
    });
    return locks;
  },
  NMAT: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = !(idx === 0 || idx === 2);
    });
    return locks;
  },
  CMAT: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = false;
    });
    return locks;
  },
  default: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = false;
    });
    return locks;
  },
};

export const durationLeftScope = {
  CAT: 'section',      // CAT uses section-level durationLeft
  SNAP: 'exam',        // SNAP uses exam-level durationLeft
  CMAT: 'section',      // CMAT uses section-level durationLeft
  NMAT: 'exam',         // NMAT uses exam-level durationLeft
  default: 'section',   // Default to section-level
};

export const getExamConfig = (examType) => {
  const normalizedType = (examType || '').toUpperCase();
  
  return {
    orderSections: sectionOrderers[normalizedType] || sectionOrderers.default,
    getLockRules: sectionLockRules[normalizedType] || sectionLockRules.default,
    durationScope: durationLeftScope[normalizedType] || durationLeftScope.default,
  };
};

