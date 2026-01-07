
export const sectionOrderers = {
  /**
   * CAT exam: Order sections as VARC -> DILR -> QA
   */
  CAT: (sections) => {
    // Define exact order for CAT: VARC -> DILR -> QA
    // Section names from backend are: "VARC", "DILR", "QA"
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

  /**
   * Default: No ordering, return sections as-is
   */
  default: (sections) => [...sections],
};

/**
 * Section locking rules
 * Returns an object mapping section index to lock status (true = locked, false = unlocked)
 */
export const sectionLockRules = {
  /**
   * CAT: Only first section (index 0) is unlocked initially
   */
  CAT: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = idx !== 0; // Index 0 (VARC) should be unlocked (false), others locked (true)
    });
    return locks;
  },

  /**
   * SNAP: All sections unlocked
   */
  SNAP: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = false;
    });
    return locks;
  },

  /**
   * NMAT: Sections at index 0 and 2 are unlocked
   */
  NMAT: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = !(idx === 0 || idx === 2);
    });
    return locks;
  },

  /**
   * CMAT: All sections unlocked (default behavior)
   */
  CMAT: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = false;
    });
    return locks;
  },

  /**
   * Default: All sections unlocked
   */
  default: (sections) => {
    const locks = {};
    sections.forEach((sec, idx) => {
      locks[idx] = false;
    });
    return locks;
  },
};

/**
 * DurationLeft scope configuration
 * Determines whether durationLeft is applied at exam-level or section-level
 */
export const durationLeftScope = {
  CAT: 'section',      // CAT uses section-level durationLeft
  SNAP: 'exam',        // SNAP uses exam-level durationLeft
  CMAT: 'section',      // CMAT uses section-level durationLeft
  NMAT: 'exam',         // NMAT uses exam-level durationLeft
  default: 'section',   // Default to section-level
};

/**
 * Get exam configuration
 * @param {string} examType - The exam type (CAT, SNAP, CMAT, NMAT, etc.)
 * @returns {object} Configuration object with orderer, lockRule, and durationScope
 */
export const getExamConfig = (examType) => {
  const normalizedType = (examType || '').toUpperCase();
  
  return {
    orderSections: sectionOrderers[normalizedType] || sectionOrderers.default,
    getLockRules: sectionLockRules[normalizedType] || sectionLockRules.default,
    durationScope: durationLeftScope[normalizedType] || durationLeftScope.default,
  };
};

