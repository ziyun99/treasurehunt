export const GAME_RULES = {
  tasks: {
    landmarkUnlock: {
      id: 'landmarkUnlock',
      points: 10,
      message: (points) => `✅ 通關成功！\n💎 +${points} 鑽石`,
      type: 'landmark'
    },
    diamondChest: {
      id: 'diamondChest',
      points: 20,
      message: (points) => `✅ 鑽石寶箱解鎖成功！\n💎 +${points} 鑽石`,
      type: 'diamond'
    },
    dailyCheckIn: {
      id: 'dailyCheckIn',
      points: 5,
      message: (points) => `✅ 簽到成功！\n💎 +${points} 鑽石`,
      type: 'daily'
    }
  },
  errorMessages: {
    wrongPassword: "❌ 密語錯誤，請再試一次",
    noPassword: "⚠️ 此地標尚未設置密語",
    alreadyCheckedIn: "⚠️ 今天已經簽到過了"
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