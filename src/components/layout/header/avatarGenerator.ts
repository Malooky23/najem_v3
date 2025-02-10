function hashUUID(uuid: string) {
  if (!uuid || typeof uuid !== "string") {
    throw new Error("A valid UUID string must be provided");
  }

  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = (hash << 5) - hash + uuid.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function generateAvatar(seed: number) {
  // Seeded random number generator
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  // console.log(seededRandom());
  // Bolder color palette
  const colors = [
    "hsl(180, 80%, 70%)", // Vibrant mint
    "hsl(350, 80%, 75%)", // Vibrant pink
    "hsl(45, 80%, 75%)", // Vibrant yellow
    "hsl(280, 70%, 75%)", // Vibrant lavender
    "hsl(15, 80%, 75%)", // Vibrant peach
    "hsl(140, 70%, 75%)", // Vibrant sage
    "hsl(200, 80%, 75%)", // Vibrant sky blue
    "hsl(330, 70%, 70%)", // Vibrant rose
  ];

  const randomColor = () => colors[Math.floor(seededRandom() * colors.length)];

  // Generate random position within constraints
  const randomPosition = (min: number, max: number) =>
    min + seededRandom() * (max - min);

  // Shape generators
  const shapeGenerators = [
    // Circle
    () => {
      const cx = randomPosition(30, 70);
      const cy = randomPosition(30, 70);
      const r = 30 + seededRandom() * 20 * 5; // Larger shapes
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${randomColor()}" />`;
    },
    // Square
    () => {
      const size = 50 + seededRandom() * 30 * 1; // Larger shapes
      const x = randomPosition(20, 60);
      const y = randomPosition(20, 60);
      const rotation = seededRandom() * 360; // Full rotation range
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" 
      fill="${randomColor()}" rx="30" ry="30"
      transform="rotate(${rotation}, ${x + size / 2}, ${y + size / 2})" />`;
},
    // Triangle
    () => {
      const centerX = randomPosition(30, 70);
      const centerY = randomPosition(30, 70);
      const size = 60 + seededRandom() * 20 * 1; // Larger shapes
      const rotation = seededRandom() * 360; // Full rotation range
      const points = [
        [centerX, centerY - size],
        [centerX - size * 0.866, centerY + size * 0.5],
        [centerX + size * 0.866, centerY + size * 0.5],
      ]
        .map(([x, y]) => `${x},${y}`)
        .join(" ");
      return `<polygon points="${points}" fill="${randomColor()}"
                transform="rotate(${rotation}, ${centerX}, ${centerY})" />`;
    },
  ];

  // Eye configurations
  const eyeStyles = [
    // Normal happy eyes
    (
      x: any,
      y: any,
      angle: any
    ) => `<circle cx="${x}" cy="${y}" r="4" fill="black" 
                            transform="rotate(${angle}, ${x}, ${y})" />`,
    // Closed happy eyes
    (x: number, y: number, angle: any) => `<path d="M${x - 4},${y} Q${x},${
      y - 3
    } ${x + 4},${y}" 
                            stroke="black" fill="none" stroke-width="2" 
                            transform="rotate(${angle}, ${x}, ${y})" />`,
    // Sparkly eyes
    (
      x: number,
      y: number,
      angle: any
    ) => `<g transform="rotate(${angle}, ${x}, ${y})">
        <circle cx="${x}" cy="${y}" r="4" fill="black" />
        <circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.5" fill="white" />
      </g>`,
  ];

  // Mouth configurations
  const mouthStyles = [
    // Big smile
    (x: number, y: number, angle: any) => `<path d="M${x - 12},${y} Q${x},${
      y + 12
    } ${x + 12},${y}" 
                            stroke="black" fill="none" stroke-width="3" 
                            transform="rotate(${angle}, ${x}, ${y})" />`,
    // Gentle smile
    (x: number, y: number, angle: any) => `<path d="M${x - 10},${y} Q${x},${
      y + 6
    } ${x + 10},${y}" 
                            stroke="black" fill="none" stroke-width="3" 
                            transform="rotate(${angle}, ${x}, ${y})" />`,
    // Wide smile
    (x: number, y: number, angle: any) => `<path d="M${x - 15},${y} Q${x},${
      y + 8
    } ${x + 15},${y}" 
                            stroke="black" fill="none" stroke-width="3" 
                            transform="rotate(${angle}, ${x}, ${y})" />`,
    // Open smile
    (x: number, y: number, angle: any) => `<path d="M${x - 12},${y} Q${x},${
      y + 12
    } ${x + 12},${y} 
                            Q${x},${y + 6} ${x - 12},${y}" fill="black" 
                            transform="rotate(${angle}, ${x}, ${y})" />`,
  ];

  // Generate base shapes
  const numShapes = 2 + Math.floor(seededRandom() * 2); // 2 to 3 shapes
  const shapes = [];

  // Always start with a circle as the base
  shapes.push(shapeGenerators[0]());

  // Add additional random shapes
  for (let i = 1; i < numShapes; i++) {
    const shapeIndex =
      1 + Math.floor(seededRandom() * (shapeGenerators.length - 1));
    shapes.push(shapeGenerators[shapeIndex]());
  }

  // Position features with more randomness
  const leftEyeX = randomPosition(30, 45);
  const rightEyeX = randomPosition(55, 70);
  const eyesY = randomPosition(35, 50);
  const mouthY = randomPosition(55, 70);

  // Randomize eye and mouth angles
  const leftEyeAngle = seededRandom() * 45 - 22.5; // -22.5° to +22.5°
  const rightEyeAngle = seededRandom() * 45 - 22.5; // -22.5° to +22.5°
  const mouthAngle = seededRandom() * 45 - 22.5; // -22.5° to +22.5°

  // Select random eye and mouth styles
  const eyeStyle = eyeStyles[Math.floor(seededRandom() * eyeStyles.length)];
  const mouthStyle =
    mouthStyles[Math.floor(seededRandom() * mouthStyles.length)];

  // Generate SVG with circular clipping
  const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="circleClip">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clip-path="url(#circleClip)">
        ${shapes.join("\n      ")}
        ${eyeStyle(leftEyeX, eyesY, leftEyeAngle)}
        ${eyeStyle(rightEyeX, eyesY, rightEyeAngle)}
        ${mouthStyle(50, mouthY, mouthAngle)}
      </g>
    </svg>`;

  return svg;
}

export function customAvatar(seed: string) {
  const randomNumber = 0.3236;
  // console.log("randomNumber", randomNumber);
  const seedNumber = hashUUID(seed)/randomNumber;
  const output = generateAvatar(seedNumber);
  
  return () => output;
}
