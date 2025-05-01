// src/managers/level.js

/**
 * Tính XP cần cho level kế tiếp: (currentLevel + 1) * 100
 * @param {number} currentLevel 
 * @returns {number}
 */
function xpForNextLevel(currentLevel) {
    return (currentLevel + 1) * 100;
  }
  
  /**
   * Từ tổng XP, tính ra:
   *  - level hiện tại
   *  - xp đã tích lũy trong level này
   *  - xp cần để lên level tiếp
   * @param {number} totalXP 
   * @returns {{ level: number, xpIntoLevel: number, xpNeeded: number }}
   */
  function calculateLevel(totalXP) {
    let level = 0;
    let consumed = 0;
  
    while (true) {
      const needed = xpForNextLevel(level);
      if (totalXP < consumed + needed) break;
      consumed += needed;
      level++;
    }
  
    return {
      level,
      xpIntoLevel: totalXP - consumed,
      xpNeeded: xpForNextLevel(level)
    };
  }
  
  module.exports = { xpForNextLevel, calculateLevel };
  