export const GAME_RULES = {
  points: {
    landmarkUnlock: 10, // Points earned for unlocking a landmark
  },
  messages: {
    success: {
      landmarkUnlock: (points) => `✅ 通關成功！\n💎 +${points} 鑽石`,
    },
    error: {
      wrongPassword: "❌ 密語錯誤，請再試一次",
      noPassword: "⚠️ 此地標尚未設置密語",
    },
  },
  achievements: {
    firstStep: {
      points: 0,
      message: "🎉 恭喜完成第一個地標！",
    },
    halfWay: {
      points: 0,
      message: "🎉 恭喜完成一半地標！",
    },
    completed: {
      points: 0,
      message: "🎉 恭喜完成所有地標！",
    },
  },
}; 