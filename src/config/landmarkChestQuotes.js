export const landmarkChestQuotes = {
  // Quotes for each landmark (indexed by landmark ID)
  quotes: [
    // Landmark 0 quotes
    [
      {
        text: "改變生命地圖不是一個夢想，人人都有權為自己的生命做決定，一旦你有心，天地有情，世上的許多事可能都因此而為你改寫！不是嗎？",
        author: "《超級生命密碼》第一章 改變生命地圖"
      },
      {
        text: "世間上的所有事情，不外乎Power和Data。",
        author: "《超級生命密碼》第一章 改變生命地圖"
      },
      {
        text: "能有機會，那還有什麼選擇呢？人不就是要面對各種機會和挑戰，竭盡所能地去扮演好自己最好的角色，去成就今生需要完成的事情嗎？",
        author: "《超級生命密碼》第一章 改變生命地圖"
      },
      
    ],
    // Landmark 1 quotes
    [
      {
        text: "宇宙未來要挑選的種子，是能夠深度感恩的人，他不但要感恩，而且要知足，這兩者缺一不可。",
        author: "《超級生命密碼》第二章 宇宙通習生"
      },
      {
        text: "對所有的事情、真理，都應該有更大的胸懷、更精準的眼光、更明晰的邏輯去接受和學習，千萬不要原地踏步而阻礙了精進的機會。",
        author: "《超級生命密碼》第二章 宇宙通習生"
      }
    ],
    // Landmark 2 quotes
    [
      {
        text: "人類身體構造和宇宙間的關係，必定是頻繁密切地數據交換及訊息溝通。",
        author: "《超級生命密碼》第三章 世間變數捉弄人"
      },
      {
        text: "生活在地球上，要能過得愈好、愈舒適，當然要按照宇宙的規則。",
        author: "《超級生命密碼》第三章 世間變數捉弄人"
      },
      {
        text: "人世間的事，都是變數在捉弄人，從以前到現在，無數的變數其實都是自己創造的。",
        author: "《超級生命密碼》第三章 世間變數捉弄人"
      }
    ],
    // Landmark 3 quotes
    [
      {
        text: "在我們的星球裡，最重要的兩個生命密碼，就是「愛和感恩」。",
        author: "《超級生命密碼》第四章 最重要的兩個生命密碼"
      },
      {
        text: "我們打這個密碼，不是給別人看的，而是要讓自己真正打對密碼進入到系統裡，得到你應該得到的東西。",
        author: "《超級生命密碼》第四章 最重要的兩個生命密碼"
      },
      {
        text: "愛與感恩這兩項生命密碼，不論是誰只要原意試，總有打對密碼的時候，進入到真正讓你生命發光發熱的成就裡。",
        author: "《超級生命密碼》第四章 最重要的兩個生命密碼"
      }
    ],
    // Landmark 4 quotes
    [
      {
        text: "大家擁有相同的時間，之所以中間的演變到最後產生不一樣的結果，都是看我們在把握和捨放這兩者之間是不是充滿著無窮的智慧。",
        author: "《超級生命密碼》第五章 似好是壞迅速遠離"
      },
      {
        text: "生活中最有福氣的事，就是要讓每一件事情都儘量簡單化。",
        author: "《超級生命密碼》第五章 似好是壞迅速遠離"
      },
      {
        text: "遠離那些看起來很好，實際上對我們迫害深遠的事物。",
        author: "《超級生命密碼》第五章 似好是壞迅速遠離"
      }
    ],
    // Landmark 5 quotes
    [
      {
        text: "《秘密》這本書其中的秘密，就是要讓我們知道解鈴終須繫鈴人。",
        author: "《超級生命密碼》第六章 秘密中的秘密"
      },
      {
        text: "用自己最大的誠意來解決問題，這是一個很重要的關鍵點。",
        author: "《超級生命密碼》第六章 秘密中的秘密"
      },
      {
        text: "如果有可能的機會，大家千萬別客氣，要逼著自己先做好讓這種負能量場能夠軟化下來，無論如何先做一個最「深度的懺悔」。",
        author: "《超級生命密碼》第六章 秘密中的秘密"
      }
    ],
    // Landmark 6 quotes
    [
      {
        text: "若要從太陽公公那裡接收到他那巨大、溫暖有效的正能量，我們必須要達到一個接收點的基本要求。",
        author: "《超級生命密碼》第七章 世上可是無奇不有"
      },
    ]
  ],

  // Helper function to get all quotes for a specific landmark
  getQuoteIndex: (landmarkId) => {
    const landmarkQuotes = landmarkChestQuotes.quotes[landmarkId] || landmarkChestQuotes.quotes[0];
    const randomIndex = Math.floor(Math.random() * landmarkQuotes.length);
    return landmarkQuotes[randomIndex];
  },
  getQuote: (landmarkId) => {
    const landmarkQuotes = landmarkChestQuotes.quotes[landmarkId] || landmarkChestQuotes.quotes[0];
    return landmarkQuotes;
  }
}; 