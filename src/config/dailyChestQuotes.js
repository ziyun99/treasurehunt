export const dailyChestQuotes = {
  // Date-specific quotes (format: "MM-DD")
  dateQuotes: {
    "01-01": {
      text: "新年新希望，願這一年充滿智慧與成長。",
      author: "新年守護者"
    },
    "02-14": {
      text: "愛是智慧的結晶，也是成長的動力。",
      author: "愛之導師"
    },
    "05-25": {
      text: "聖誕的奇蹟，是智慧與希望的禮物。",
      author: "聖誕智者"
    }
    // Add more date-specific quotes here
  },

  // Default quotes for each day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  dayQuotes: [
    {
      text: "感恩過去一週的收穫，期待新一週的成長。",
      author: ""
    },
    {
      text: "新的一週開始了！讓我們帶著好奇心和熱情，探索知識的海洋。",
      author: ""
    },
    {
      text: "週二的堅持，是通往成功的階梯。",
      author: ""
    },
    {
      text: "知識就像陽光，照亮我們前進的道路。",
      author: ""
    },
    {
      text: "週四的突破，是超越自我的時刻。",
      author: ""
    },
    {
      text: "週五的收穫，是努力的回報。",
      author: ""
    },
    {
      text: "保持樂觀的心態，世界會因你而更美好。",
      author: ""
    }
  ],

  
  // Helper function to get the quote for today
  getTodayQuote: () => {
    const today = new Date();
    const dateKey = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // First try to get a date-specific quote
    if (dailyChestQuotes.dateQuotes[dateKey]) {
      return dailyChestQuotes.dateQuotes[dateKey];
    }
    
    // If no date-specific quote, fall back to day of week
    const dayOfWeek = today.getDay();
    return {}  // return dailyChestQuotes.dayQuotes[dayOfWeek];
  },

  // Helper function to get the quote for a specific date
  getQuoteForDate: (date) => {
    const dateKey = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // First try to get a date-specific quote
    if (dailyChestQuotes.dateQuotes[dateKey]) {
      return dailyChestQuotes.dateQuotes[dateKey];
    }
    
    // If no date-specific quote, fall back to day of week
    const dayOfWeek = date.getDay();
    return dailyChestQuotes.dayQuotes[dayOfWeek];
  },

  // Helper function to get the sun sticker for today
  getTodaySunSticker: () => {
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to 1-7 (Monday = 1, ..., Sunday = 7)
    const stickerNumber = dayOfWeek === 0 ? 7 : dayOfWeek;
    return `/icons/sunny/${stickerNumber}.svg`;
  }
}; 