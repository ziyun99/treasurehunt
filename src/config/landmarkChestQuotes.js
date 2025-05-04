export const landmarkChestQuotes = {
  // Quote configurations for each landmark
  quotes: [
    {
      text: "每一次的探索都是心靈的冒險，每一次的發現都是智慧的結晶。",
      author: "探索者1"
    },
    {
      text: "在知識的海洋中，每一滴汗水都是智慧的珍珠。",
      author: "智者2"
    },
    {
      text: "好奇心是探索的鑰匙，堅持是成功的密碼。",
      author: "冒險家3"
    },
    {
      text: "每一個密碼背後，都藏著一個等待被發現的故事。",
      author: "解謎者4"
    },
    {
      text: "智慧不在於知道多少，而在於如何運用所學。",
      author: "導師5"
    },
    {
      text: "探索的過程比結果更重要，因為它塑造了我們的成長。",
      author: "導師6"
    },
    {
      text: "每一次的挑戰都是通往智慧的階梯。",
      author: "智者7"
    }
  ],

  // Helper function to get the quote for a specific landmark
  getQuote: (id) => {
    return landmarkChestQuotes.quotes[id] || landmarkChestQuotes.quotes[0];
  }
}; 