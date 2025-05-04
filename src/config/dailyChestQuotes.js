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
      text: "週日的寧靜，是為了迎接新的一週的挑戰。",
      author: "週日守護者"
    },
    {
      text: "週一的開始，是新的機會與希望。",
      author: "週一導師"
    },
    {
      text: "週二的堅持，是通往成功的階梯。",
      author: "週二智者"
    },
    {
      text: "週三的平衡，是生活與學習的藝術。",
      author: "週三平衡者"
    },
    {
      text: "週四的突破，是超越自我的時刻。",
      author: "週四突破者"
    },
    {
      text: "週五的收穫，是努力的回報。",
      author: "週五收穫者"
    },
    {
      text: "週六的放鬆，是為了更好的開始。",
      author: "週六守護者"
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
    return dailyChestQuotes.dayQuotes[dayOfWeek];
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
  }
}; 