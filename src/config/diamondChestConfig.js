export const diamondChestConfig = {
  // Image configurations
  images: {
    // First diamond chest images
    diamond1: {
      locked: `${process.env.PUBLIC_URL}/icons/diamond.svg`,
      open: `${process.env.PUBLIC_URL}/icons/diamond.svg`,
      completed: `${process.env.PUBLIC_URL}/icons/diamond-light.svg`
    },
    // Second diamond chest images
    diamond2: {
      locked: `${process.env.PUBLIC_URL}/icons/diamond.svg`,
      open: `${process.env.PUBLIC_URL}/icons/diamond.svg`,
      completed: `${process.env.PUBLIC_URL}/icons/diamond-light.svg`
    },
    // Third diamond chest images
    diamond3: {
      locked: `${process.env.PUBLIC_URL}/icons/diamond.svg`,
      open: `${process.env.PUBLIC_URL}/icons/diamond.svg`,
      completed: `${process.env.PUBLIC_URL}/icons/diamond-light.svg`
    }
  },

  // Text configurations
  text: {
    locked: (id) => `鑽石寶箱 ${id + 1}（未解鎖）`,
    open: (id) => `鑽石寶箱 ${id + 1}`,
    completed: (id) => `鑽石寶箱 ${id + 1}（已開啟）`,
  },

  // Position configurations
  positions: {
    portrait: [
      { x: -0.35, y: 0.1 },    // First diamond chest offset
      { x: 0.2, y: 0.28 },     // Second diamond chest offset
      { x: -0.25, y: 0.5 }     // Third diamond chest offset
    ],
    landscape: [
      { x: 0.15, y: -0.3 },    // First diamond chest offset
      { x: 0.4, y: 0.2 },      // Second diamond chest offset
      { x: 0.6, y: -0.1 }      // Third diamond chest offset
    ]
  },

  // Size configurations
  size: {
    icon: 40,  // Base size for the icon
    text: 13   // Base size for the text
  },

  // Helper function to get the correct image for a chest
  getImage: (id, state) => {
    const chestKey = `diamond${id + 1}`;
    return diamondChestConfig.images[chestKey][state];
  }
}; 