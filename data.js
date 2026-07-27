// Data structure containing the scientific investigations, quizzes, and scenario configurations

const PlantTransportLab = {
  title: "Leaves and Water Uptake",
  question: "How does the number of leaves affect the amount of water taken in by a plant?",
  aim: "To find out how the number of leaves affects the amount of water taken in by a plant.",
  hypothesis: "If the number of leaves on a plant increases, the amount of water taken in by the plant will increase because leaves lose water through transpiration, causing the plant to take in more water to replace it.",
  changedVariable: "Number of leaves on the plant",
  measuredVariable: "Change in the volume of water in the container (Amount of water taken in)",
  controlledVariables: [
    "Type of plant",
    "Initial volume of water",
    "Layer of oil on the water surface (to prevent evaporation)",
    "Location/Surrounding conditions (temperature, humidity, wind)",
    "Duration of the experiment"
  ],
  setup: {
    description: "Three similar plants placed in identical beakers filled with the same volume of water. A layer of oil is added to prevent water loss through evaporation.",
    groups: [
      { id: "A", leaves: 0, initialVol: 200, finalVol: 200, absorbed: 0 },
      { id: "B", leaves: 3, initialVol: 200, finalVol: 180, absorbed: 20 },
      { id: "C", leaves: 6, initialVol: 200, finalVol: 155, absorbed: 45 }
    ]
  },
  procedure: [
    "Select three similar plants and remove leaves to set up different leaf counts (0, 3, and 6 leaves).",
    "Pour 200 ml of water into three identical beakers.",
    "Place each plant into a beaker.",
    "Add a thin layer of oil on top of the water in each beaker.",
    "Place all three beakers in the same sunny location.",
    "Measure and record the final volume of water in each beaker after 24 hours.",
    "Calculate the volume of water taken in by subtracting the final volume from the initial volume."
  ],
  results: [
    { label: "Plant A (0 leaves)", changed: 0, initial: 200, final: 200, output: 0 },
    { label: "Plant B (3 leaves)", changed: 3, initial: 200, final: 180, output: 20 },
    { label: "Plant C (6 leaves)", changed: 6, initial: 200, final: 155, output: 45 }
  ],
  conclusion: "As the number of leaves on the plant increases, the amount of water taken in by the plant increases."
};

const PracticeLabs = {
  water_cycle: {
    id: "water_cycle",
    title: "The Disappearing Water Mystery",
    topic: "Cycles in Water",
    question: "How does the exposed surface area of water affect the amount of water that evaporates in a fixed period?",
    aim: "To find out how the exposed surface area of water affects the amount of water evaporated in a fixed period.",
    changedVariable: "Exposed surface area of the water",
    measuredVariable: "Amount of water evaporated after a fixed period",
    controlledVariables: [
      "Initial volume of water",
      "Duration of the experiment",
      "Location of the containers",
      "Surrounding temperature",
      "Type of water"
    ],
    hypothesis: "If the exposed surface area of the water increases, the amount of water evaporated in a fixed period will increase because more water is exposed to the surroundings.",
    containers: [
      { id: "narrow", name: "Narrow Container", surfaceArea: "Small", initialVol: 100, finalVol: 95, evaporated: 5 },
      { id: "medium", name: "Medium Container", surfaceArea: "Medium", initialVol: 100, finalVol: 90, evaporated: 10 },
      { id: "wide", name: "Wide Container", surfaceArea: "Large", initialVol: 100, finalVol: 84, evaporated: 16 }
    ],
    results: [
      { label: "Narrow Container", changed: "Small", initial: 100, final: 95, output: 5 },
      { label: "Medium Container", changed: "Medium", initial: 100, final: 90, output: 10 },
      { label: "Wide Container", changed: "Large", initial: 100, final: 84, output: 16 }
    ],
    conclusion: "As the exposed surface area increased, the amount of water evaporated in the same period increased.",
    misconceptionInfo: "Notice that the water did not disappear completely! It changed from liquid water into water vapour, which is an invisible gas that entered the surrounding air.",
    quiz: {
      mcq: {
        question: "Which variable must be kept the same (controlled) to ensure a fair test?",
        options: [
          "Exposed surface area of the water",
          "Initial volume of water in each container",
          "Amount of water evaporated",
          "Width of each container"
        ],
        correctIndex: 1,
        hint: "To make the test fair, only the changed variable (surface area) should differ. What volume do we start with in all containers?"
      },
      structured: {
        question: "Explain why all the containers must be placed in the same location.",
        hint: "Consider what would happen if one container was placed in the sun and another in a dark cupboard. Would the test be fair?",
        sentenceFrame: "They must be placed in the same location so that they experience the same ________ conditions. Therefore, any difference in the amount of water evaporated is caused only by the ________.",
        expectedKeywords: ["surrounding", "conditions", "surface", "area"],
        expectedAnswers: [
          "They must be placed in the same location so that they experience the same surrounding conditions. Therefore, any difference in the amount of water evaporated is caused only by the exposed surface area."
        ]
      }
    }
  },

  electrical: {
    id: "electrical",
    title: "The Bulb Brightness Challenge",
    topic: "Electrical Systems",
    question: "How does the number of identical bulbs connected in series affect the brightness of each bulb?",
    aim: "To find out how the number of identical bulbs connected in series affects the brightness of each bulb.",
    changedVariable: "Number of bulbs connected in series",
    measuredVariable: "Brightness of each bulb",
    controlledVariables: [
      "Number of batteries",
      "Type of batteries",
      "Type of bulbs",
      "Condition of batteries",
      "Type and length of connecting wires"
    ],
    hypothesis: "If the number of bulbs connected in series increases, the brightness of each bulb will decrease.",
    results: [
      { label: "Circuit A (1 bulb)", changed: 1, output: 90 }, // units
      { label: "Circuit B (2 bulbs)", changed: 2, output: 55 },
      { label: "Circuit C (3 bulbs)", changed: 3, output: 35 }
    ],
    conclusion: "As the number of bulbs connected in series increases, the brightness of each bulb decreases.",
    teachPoints: [
      "A bulb lights up only when there is a complete circuit for current to flow.",
      "The comparison must use identical bulbs.",
      "The number and condition of batteries must remain the same.",
      "Only the number of bulbs should be changed (our changed variable)."
    ],
    circuitBuilder: {
      elements: ["Battery", "Bulb", "Switch", "Wire"],
      hotspots: ["power", "bulb1", "switch", "bulb2"]
    },
    errorDetections: [
      {
        id: "open_switch",
        description: "Why is the bulb not lighting up in this circuit?",
        imageType: "circuit_open_switch",
        options: [
          "The batteries are facing the wrong direction.",
          "The switch is open, breaking the circuit.",
          "There are too many bulbs in series.",
          "The wires are not conducting electricity."
        ],
        correctIndex: 1,
        explanation: "An open switch creates a break in the circuit, preventing electric current from flowing through."
      },
      {
        id: "disconnected_wire",
        description: "Identify the problem with this setup.",
        imageType: "circuit_disconnected_wire",
        options: [
          "The bulb is broken.",
          "The circuit is closed.",
          "A wire is disconnected from the battery terminal, breaking the complete circuit.",
          "The switch is on."
        ],
        correctIndex: 2,
        explanation: "Electric current can only flow through a complete loop. A disconnected wire breaks the path."
      },
      {
        id: "battery_wrong_way",
        description: "Why does the bulb in this multi-cell circuit remain unlit?",
        imageType: "circuit_battery_wrong_way",
        options: [
          "One of the batteries is facing the wrong direction, so current cannot flow properly.",
          "The bulbs are not identical.",
          "A wire is broken.",
          "There is no switch connected."
        ],
        correctIndex: 0,
        explanation: "Batteries must be connected in series with opposite terminals touching (+ to -). If a battery faces the wrong way, their chemical pushes oppose each other."
      },
      {
        id: "terminal_mismatch",
        description: "Look closely at the bulb connection here. Why won't it light up?",
        imageType: "circuit_terminal_mismatch",
        options: [
          "The battery is dead.",
          "Both wires are connected to the metal casing of the bulb, rather than one to the casing and one to the metal tip.",
          "The switch is closed.",
          "Bulbs connected in series cannot light up."
        ],
        correctIndex: 1,
        explanation: "For current to flow through the filament, one wire must connect to the metal casing (side terminal) and the other to the metal tip (bottom terminal)."
      }
    ],
    quiz: {
      mcq: {
        question: "In this experiment, why must we use the same type and number of batteries?",
        options: [
          "To change the brightness of the bulbs",
          "To measure the voltage drop",
          "To ensure the investigation is a fair test by keeping them as controlled variables",
          "To allow the circuit to remain open"
        ],
        correctIndex: 2,
        hint: "If we change both the number of bulbs and the batteries, can we tell which one caused the change in brightness?"
      },
      structured: {
        question: "Tom used one battery for Circuit A and two batteries for Circuit B. Explain why this was not a fair test.",
        hint: "A fair test changes ONLY one variable at a time. What did Tom change?",
        sentenceFrame: "He changed both the number of ________ and the number of ________. Therefore, he would not know whether the difference in brightness was caused by the number of bulbs or the number of ________.",
        expectedKeywords: ["bulbs", "batteries"],
        expectedAnswers: [
          "He changed both the number of bulbs and the number of batteries. Therefore, he would not know whether the difference in brightness was caused by the number of bulbs or the number of batteries."
        ]
      }
    }
  },

  reproduction: {
    id: "reproduction",
    title: "The Germinating Seed Investigation",
    topic: "Reproduction in Plants",
    question: "Does the presence of water affect seed germination?",
    aim: "To find out if the presence of water affects seed germination.",
    changedVariable: "Presence of water",
    measuredVariable: "Number of seeds that germinate after a fixed number of days",
    controlledVariables: [
      "Type of seeds",
      "Number of seeds used in each dish",
      "Size of the seeds",
      "Type and amount of cotton wool",
      "Type of container",
      "Location and surrounding temperature",
      "Duration of the experiment"
    ],
    hypothesis: "If seeds are provided with water, more seeds will germinate because water is necessary for germination.",
    dishes: [
      { id: "A", name: "Dish A (Moist Cotton)", water: true, initialSeeds: 10, germinated: 9 },
      { id: "B", name: "Dish B (Dry Cotton)", water: false, initialSeeds: 10, germinated: 0 }
    ],
    results: [
      { label: "Dish A (Moist cotton wool)", changed: "Present", initial: 10, final: 1, output: 9 }, // output is germinated
      { label: "Dish B (Dry cotton wool)", changed: "Absent", initial: 10, final: 10, output: 0 }
    ],
    conclusion: "As seeds in Dish A were provided with water, they germinated, while seeds in Dish B without water did not. Hence, water is necessary for seed germination.",
    teachPoints: [
      "Germination is the process of a seed developing into a young plant (seedling).",
      "Water, oxygen (air), and suitable warmth are the three conditions required for germination (remember: W.O.W.).",
      "Light is NOT required for the germination of all seeds. Do not assume seeds need light to germinate!"
    ],
    quiz: {
      mcq: {
        question: "Which of the following is NOT a necessary condition for seed germination?",
        options: [
          "Suitable warmth",
          "Oxygen (air)",
          "Light",
          "Water"
        ],
        correctIndex: 2,
        hint: "Seeds are often buried deep underground in the dark to germinate. Do they need light to start germinating?"
      },
      structured: {
        question: "Why must the same type of seed be used in both dishes?",
        hint: "What if we used green bean seeds in Dish A and apple seeds in Dish B? Would we be testing only water?",
        sentenceFrame: "The same type of seed must be used so that any difference in the number of seeds that germinate is caused by the presence of ________ and not by the use of different types of ________.",
        expectedKeywords: ["water", "seeds"],
        expectedAnswers: [
          "The same type of seed must be used so that any difference in the number of seeds that germinate is caused by the presence of water and not by the use of different types of seeds."
        ]
      },
      extension: {
        question: "Why did the investigator place ten seeds in each dish instead of only one seed?",
        hint: "What if the single seed we used in Dish A was damaged inside?",
        sentenceFrame: "Using more seeds makes the results more ________ and reduces the effect of one seed that may be ________ or unable to germinate.",
        expectedKeywords: ["reliable", "damaged"],
        expectedAnswers: [
          "Using more seeds makes the results more reliable and reduces the effect of one seed that may be damaged or unable to germinate."
        ]
      }
    }
  },

  respiratory: {
    id: "respiratory",
    title: "The Breathing-Rate Investigation",
    topic: "Human Respiratory System",
    question: "How does the duration of exercise affect a person's breathing rate?",
    aim: "To find out how the duration of exercise affects a person's breathing rate.",
    changedVariable: "Duration of exercise",
    measuredVariable: "Breathing rate immediately after exercise",
    controlledVariables: [
      "Same person exercising",
      "Same type of exercise (e.g., light jogging)",
      "Same pace of exercise",
      "Same method of counting breaths",
      "Same recovery conditions",
      "Same time interval used for counting"
    ],
    hypothesis: "If the duration of exercise increases, breathing rate immediately after exercise will increase.",
    results: [
      { label: "Resting", changed: 0, count30s: 8, output: 16 }, // rate = count30s * 2
      { label: "1 minute exercise", changed: 1, count30s: 12, output: 24 },
      { label: "2 minutes exercise", changed: 2, count30s: 15.5, output: 31 },
      { label: "3 minutes exercise", changed: 3, count30s: 19, output: 38 }
    ],
    conclusion: "As the duration of exercise increases, the breathing rate immediately after exercise increases.",
    scientificExplanation: "During exercise, our muscles work harder and need more energy. To release this energy, the body respire faster, requiring more oxygen and producing more carbon dioxide. The breathing rate increases to take in more oxygen and remove more carbon dioxide quickly. (Note: Do not say we breathe faster simply because we are tired!)",
    safetyNotice: "Important Safety Notice: This is an on-screen simulation. Do not attempt strenuous physical exercise without teacher supervision, especially if you have a medical condition. No breath-holding activities should be conducted.",
    quiz: {
      mcq: {
        question: "Which of the following is the correct biological explanation for an increased breathing rate during exercise?",
        options: [
          "The body breathes faster to show that the person is tired.",
          "The muscles need more energy, so the body takes in more oxygen and removes more carbon dioxide.",
          "The lungs expand to make the body lighter.",
          "Breathing faster creates energy inside the windpipe."
        ],
        correctIndex: 1,
        hint: "Why do cells need oxygen? Oxygen is used in respiration to release energy from digested food."
      },
      structured: {
        question: "Ali compared his breathing rate with Mei Lin's breathing rate after exercise. Explain why using two different people may make the comparison less reliable.",
        hint: "Do different people have the exact same lung capacity, fitness levels, and resting rates?",
        sentenceFrame: "Different people may naturally have different ________ rates or ________ levels. The same person should be used so that the effect of exercise duration can be compared more ________.",
        expectedKeywords: ["breathing", "fitness", "fairly"],
        expectedAnswers: [
          "Different people may naturally have different breathing rates or fitness levels. The same person should be used so that the effect of exercise duration can be compared more fairly."
        ]
      }
    }
  },

  circulatory: {
    id: "circulatory",
    title: "The Pulse-Rate Investigation",
    topic: "Human Circulatory System",
    question: "How does exercise duration affect a person's pulse rate?",
    aim: "To find out how exercise duration affects a person's pulse rate.",
    changedVariable: "Duration of exercise",
    measuredVariable: "Pulse rate immediately after exercise",
    controlledVariables: [
      "Same person exercising",
      "Same type of exercise",
      "Same pace of exercise",
      "Same method of measuring pulse (e.g., wrist radial pulse)",
      "Same measurement duration (15 seconds)",
      "Same time between stopping exercise and taking pulse"
    ],
    hypothesis: "If exercise duration increases, pulse rate immediately after exercise will increase.",
    results: [
      { label: "Resting", changed: 0, count15s: 18, output: 72 }, // pulse = count15s * 4
      { label: "1 minute exercise", changed: 1, count15s: 23, output: 92 },
      { label: "2 minutes exercise", changed: 2, count15s: 28, output: 112 },
      { label: "3 minutes exercise", changed: 3, count15s: 32, output: 128 }
    ],
    conclusion: "As exercise duration increases, pulse rate immediately after exercise increases.",
    scientificExplanation: "During exercise, our muscles respire more rapidly to release more energy. The heart must beat faster to pump blood faster, transporting more oxygen and digested food to the active muscles, and transporting carbon dioxide and other waste products away from them. (Remember: The heart does not create oxygen or energy itself; it is a muscular pump that circulates blood, which acts as the transport medium!)",
    quiz: {
      mcq: {
        question: "What is the primary function of the heart during exercise?",
        options: [
          "To produce oxygen for the muscles",
          "To release energy from digested food",
          "To pump blood faster, transporting oxygen and digested food to muscles, and removing waste products like carbon dioxide",
          "To filter carbon dioxide out of the blood directly"
        ],
        correctIndex: 2,
        hint: "Is the heart a producer of oxygen, or is it a muscular pump that moves blood around?"
      },
      structured: {
        question: "Why must pulse rate be measured immediately after each exercise period?",
        hint: "What happens to your heart rate as soon as you sit down and rest?",
        sentenceFrame: "Pulse rate begins to ________ when the person rests. It must be measured immediately so that the recorded pulse rate represents the effect of that ________ period.",
        expectedKeywords: ["decrease", "exercise"],
        expectedAnswers: [
          "Pulse rate begins to decrease when the person rests. It must be measured immediately so that the recorded pulse rate represents the effect of that exercise period."
        ]
      }
    }
  }
};

const InvestigateScenarios = [
  {
    id: "transpiration_wind",
    title: "The Wind and the Leaf",
    topic: "Plant Transport (Transpiration)",
    scenario: "You want to find out how wind speed affects the rate of water loss (transpiration) from a leafy plant. You have a fan with three speed settings (Low, Medium, High), identical leafy shoots, beakers, water, oil, and a weighing scale.",
    question: "How does the wind speed affect the amount of water lost by a plant in a fixed period?",
    aim: "To find out how wind speed affects the amount of water lost by a plant in a fixed period.",
    hypothesis: "If the wind speed increases, the amount of water lost by the plant will increase because moving air removes water vapour from the leaves faster, increasing transpiration.",
    changedVariable: "Wind speed from the fan",
    measuredVariable: "Change in the mass of the set-up (Amount of water lost)",
    controlledVariables: [
      "Type of plant shoot",
      "Number of leaves on the shoot",
      "Initial volume of water",
      "Layer of oil on the water surface",
      "Location and surrounding temperature",
      "Duration of the experiment"
    ],
    setupOptions: [
      { id: "correct", text: "Three identical leafy shoots in identical beakers of water, each beaker covered with a layer of oil, placed at different distances from fans running at Low, Medium, and High speeds.", isCorrect: true },
      { id: "wrong_no_oil", text: "Three identical leafy shoots in beakers without any oil layer, placed in different wind speeds.", isCorrect: false, feedback: "Without oil, water will evaporate directly from the beaker surface, making it an unfair test!" },
      { id: "wrong_different_leaves", text: "Shoots with different numbers of leaves placed in different wind speeds.", isCorrect: false, feedback: "The number of leaves must be controlled (kept the same), otherwise it affects the rate of transpiration." }
    ],
    procedure: [
      "Prepare three identical leafy shoots with the same number of leaves.",
      "Place each shoot in a beaker filled with 200 ml of water.",
      "Add a layer of oil to cover the water surface in each beaker.",
      "Record the initial mass of each beaker setup.",
      "Place one setup in front of a fan on Low speed, one on Medium speed, and one on High speed in the same room.",
      "After 6 hours, measure and record the final mass of each setup.",
      "Calculate the amount of water lost by subtracting the final mass from the initial mass."
    ],
    results: [
      { label: "Low Wind Speed", changed: "Low", initial: 350, final: 342, output: 8 }, // grams
      { label: "Medium Wind Speed", changed: "Medium", initial: 350, final: 335, output: 15 },
      { label: "High Wind Speed", changed: "High", initial: 350, final: 326, output: 24 }
    ],
    conclusion: "As the wind speed increases, the amount of water lost by the plant increases."
  },
  {
    id: "electromagnet_coils",
    title: "The Iron Claw Electromagnet",
    topic: "Electrical Systems (Electromagnets)",
    scenario: "You want to find out how the number of turns of wire around an iron nail affects the magnetic strength of an electromagnet. You have a battery, connecting wires, an iron nail, and a box of identical paperclips.",
    question: "How does the number of wire turns around an iron nail affect the number of paperclips attracted by the electromagnet?",
    aim: "To find out how the number of wire turns around an iron nail affect the number of paperclips attracted by the electromagnet.",
    hypothesis: "If the number of wire turns around the iron nail increases, the number of paperclips attracted will increase because a greater number of turns increases the magnetic strength.",
    changedVariable: "Number of wire turns around the iron nail",
    measuredVariable: "Number of paperclips attracted by the electromagnet",
    controlledVariables: [
      "Number of batteries used",
      "Type of batteries",
      "Material of the nail (iron)",
      "Size and thickness of the nail",
      "Type of wire used",
      "Size and weight of the paperclips"
    ],
    setupOptions: [
      { id: "correct", text: "Three electromagnets made with identical iron nails, using 10, 20, and 30 turns of wire respectively, connected to the same number of identical batteries.", isCorrect: true },
      { id: "wrong_different_batteries", text: "Electromagnets with 10, 20, and 30 turns of wire, but connected to 1, 2, and 3 batteries respectively.", isCorrect: false, feedback: "You changed both the number of turns and the number of batteries. This is not a fair test!" },
      { id: "wrong_different_nails", text: "Using an iron nail for 10 turns, a copper nail for 20 turns, and a steel nail for 30 turns.", isCorrect: false, feedback: "The type of nail material must be controlled. Copper is not even magnetic!" }
    ],
    procedure: [
      "Wrap a wire around an iron nail 10 times to make Electromagnet A.",
      "Wrap wire around an identical iron nail 20 times for Electromagnet B, and 30 times for Electromagnet C.",
      "Connect each electromagnet to a fresh D-cell battery.",
      "Hold Electromagnet A over a pile of paperclips and record the number of paperclips attracted.",
      "Repeat the process using Electromagnets B and C.",
      "Compare the numbers of paperclips attracted to determine magnetic strength."
    ],
    results: [
      { label: "10 Turns of Wire", changed: 10, initial: 0, final: 4, output: 4 }, // paperclips
      { label: "20 Turns of Wire", changed: 20, initial: 0, final: 9, output: 9 },
      { label: "30 Turns of Wire", changed: 30, initial: 0, final: 15, output: 15 }
    ],
    conclusion: "As the number of wire turns around the iron nail increases, the magnetic strength (number of paperclips attracted) of the electromagnet increases."
  },
  {
    id: "sugar_temp",
    title: "The Sweet Speed Test",
    topic: "Cycles / Matter (Rate of Dissolving)",
    scenario: "You want to find out how the temperature of water affects the time taken for a spoonful of sugar to dissolve completely. You have a kettle, water, identical glass beakers, white fine sugar, a spoon, a thermometer, and a stopwatch.",
    question: "How does the temperature of water affect the time taken for a spoonful of sugar to dissolve?",
    aim: "To find out how the temperature of water affects the time taken for a spoonful of sugar to dissolve.",
    hypothesis: "If the temperature of the water increases, the time taken for the sugar to dissolve will decrease because higher temperatures cause water molecules to move faster, helping sugar dissolve more quickly.",
    changedVariable: "Temperature of the water",
    measuredVariable: "Time taken for the sugar to dissolve completely",
    controlledVariables: [
      "Amount of water in each beaker",
      "Amount of sugar (one level teaspoon)",
      "Type of sugar (fine white sugar)",
      "Rate of stirring (e.g., 2 stirs per second)",
      "Type and size of beaker"
    ],
    setupOptions: [
      { id: "correct", text: "Three identical beakers containing 150 ml of water at 20°C, 40°C, and 60°C respectively. One teaspoon of fine sugar is added to each, stirred at the same speed.", isCorrect: true },
      { id: "wrong_no_stirring_control", text: "Beakers with water at different temperatures, but stirring beaker A very fast, not stirring B, and stirring C slowly.", isCorrect: false, feedback: "Stirring rate is a key controlled variable. If it changes, it ruins the fairness of the test!" },
      { id: "wrong_sugar_amount", text: "Using 1 teaspoon of sugar in 20°C water, 2 teaspoons in 40°C water, and 3 teaspoons in 60°C water.", isCorrect: false, feedback: "The amount of sugar must be kept constant to isolate the effect of water temperature." }
    ],
    procedure: [
      "Measure 150 ml of water into three identical beakers.",
      "Adjust the water temperature in the beakers to 20°C, 40°C, and 60°C respectively.",
      "Add exactly one level teaspoon of fine white sugar into the 20°C beaker.",
      "Stir the water continuously at a steady rate of 2 stirs per second, and start the stopwatch.",
      "Stop the stopwatch as soon as all sugar crystals disappear, and record the time.",
      "Repeat the steps for the 40°C and 60°C beakers using the same amount of sugar and stirring rate."
    ],
    results: [
      { label: "Cold Water (20°C)", changed: 20, initial: 0, final: 120, output: 120 }, // seconds
      { label: "Warm Water (40°C)", changed: 40, initial: 0, final: 70, output: 70 },
      { label: "Hot Water (60°C)", changed: 60, initial: 0, final: 35, output: 35 }
    ],
    conclusion: "As the temperature of the water increases, the time taken for the sugar to dissolve completely decreases."
  }
];

const MixedQuizQuestions = [
  // 8 MCQs
  {
    type: "mcq",
    topic: "Electrical Systems",
    question: "A pupil wants to investigate whether the number of batteries connected in series affects the brightness of a bulb. What is the measured variable in this experiment?",
    options: [
      "The type of battery used",
      "The number of batteries in series",
      "The brightness of the bulb",
      "The length of the connecting wires"
    ],
    correctIndex: 2,
    explanation: "The measured (dependent) variable is the outcome you observe or measure. In this case, it is the bulb's brightness. The number of batteries is the changed variable."
  },
  {
    type: "mcq",
    topic: "Cycles in Water",
    question: "Three identical glasses containing 200 ml of water were placed in a garden. Glass X was left open, Glass Y was partially covered with cardboard, and Glass Z was completely sealed with plastic wrap. Which glass will have the most water remaining after 12 hours?",
    options: [
      "Glass X",
      "Glass Y",
      "Glass Z",
      "They will all have the same amount of water left."
    ],
    correctIndex: 2,
    explanation: "Glass Z is completely sealed, which blocks evaporated water vapour from escaping into the surrounding air. Water vapour condenses back into liquid water inside, meaning almost no water is lost, leaving the most remaining water."
  },
  {
    type: "mcq",
    topic: "Reproduction in Plants",
    question: "Which of the following describes the correct order of developmental stages during seed germination?",
    options: [
      "Seed -> root emerges -> shoot emerges -> seedling",
      "Seed -> shoot emerges -> root emerges -> seedling",
      "Seed -> seedling -> seed coat splits -> root emerges",
      "Seed -> leaves emerge -> root emerges -> stem splits"
    ],
    correctIndex: 0,
    explanation: "During germination, the seed absorbs water and swells, causing the seed coat to split. The root (radicle) always emerges first to anchor the plant and absorb water, followed by the shoot (plumule)."
  },
  {
    type: "mcq",
    topic: "Human Respiratory System",
    question: "Why does a person's chest move up and down faster during and immediately after exercise?",
    options: [
      "The lungs are resting to recover from tiredness.",
      "The body is taking in more oxygen and removing carbon dioxide faster to meet the energy demands of muscles.",
      "The blood needs more space in the chest cavity to expand.",
      "Exercising makes the windpipe narrower, so air must be pumped faster."
    ],
    correctIndex: 1,
    explanation: "Active muscles respire faster to release energy, which requires more oxygen and produces more carbon dioxide waste. Faster chest movement represents faster breathing to exchange these gases."
  },
  {
    type: "mcq",
    topic: "Human Circulatory System",
    question: "Which of the following statements about the circulatory system is correct?",
    options: [
      "The heart creates energy and distributes it to the muscles.",
      "Blood only transports oxygen and does not transport digested food.",
      "The heart pumps blood, which transports oxygen, digested food, and carbon dioxide around the body.",
      "Pulse rate decreases during exercise to conserve blood cells."
    ],
    correctIndex: 2,
    explanation: "The heart functions strictly as a muscular pump. The blood inside blood vessels carries oxygen, digested food to cells, and carbon dioxide waste away from cells."
  },
  {
    type: "mcq",
    topic: "Plant Transport System",
    question: "A celery stalk is placed in red-coloured water. After a few hours, the leaves turn red. What does this experiment demonstrate?",
    options: [
      "Leaves produce food that is red in colour.",
      "The stem has water-carrying tubes that transport water upwards from the base to the leaves.",
      "Red dye causes the plant to photosynthesize faster.",
      "Plants absorb water through their leaves to turn stem cells red."
    ],
    correctIndex: 1,
    explanation: "The transport of red water up the celery stalk to the leaves shows that the stem contains water-carrying tubes that transport water and dissolved minerals upwards."
  },
  {
    type: "mcq",
    topic: "Cycles in Water",
    question: "Why does water evaporate faster on a warm, windy day than on a cool, calm day?",
    options: [
      "Wind creates water particles from air.",
      "Higher surrounding temperature provides more heat to evaporate water faster, and wind sweeps away water vapour so evaporation continues quickly.",
      "Water vapour condenses faster when the wind blows.",
      "Cool air contains more water vapour, which prevents liquid water from turning into steam."
    ],
    correctIndex: 1,
    explanation: "Higher temperatures provide heat energy for liquid particles to escape, and wind sweeps away water vapour from above the water surface, preventing the air from becoming saturated."
  },
  {
    type: "mcq",
    topic: "Electrical Systems",
    question: "In a circuit with two bulbs connected in series, what happens if one bulb fuses (breaks)?",
    options: [
      "The other bulb stays lit and gets brighter.",
      "The other bulb stays lit but gets dimmer.",
      "The other bulb also goes out because the circuit is broken.",
      "The battery explodes because of a short circuit."
    ],
    correctIndex: 2,
    explanation: "Bulbs in series are connected along a single electrical path. If one bulb fuses, it breaks the filament, creating an open circuit. No current can flow anywhere in the path, so the other bulb goes out."
  },

  // 6 Structured Questions
  {
    type: "structured",
    topic: "Reproduction in Plants",
    question: "Dry seeds were placed on dry cotton wool in a beaker. After a week, none of the seeds germinated, even though the beaker was placed in a warm room next to a window. Explain why the seeds did not germinate.",
    hint: "Think about the conditions needed for germination (W.O.W.). Which condition was missing in the setup?",
    expectedKeywords: ["water", "necessary", "germination"],
    expectedAnswers: [
      "Water was missing. Seeds need water, oxygen, and warmth to germinate. Since the cotton wool was dry, there was no water for germination.",
      "The seeds did not germinate because water is required for germination, and the cotton wool was dry."
    ]
  },
  {
    type: "structured",
    topic: "Human Circulatory System",
    question: "Describe how the circulatory system and the respiratory system work together during exercise to support the body.",
    hint: "The respiratory system takes in a gas, and the circulatory system transports it. What is this gas and where does it go?",
    expectedKeywords: ["respiratory", "oxygen", "circulatory", "pumps", "muscles"],
    expectedAnswers: [
      "The respiratory system takes in oxygen into the lungs, and the circulatory system pumps blood to transport this oxygen and digested food to the working muscles.",
      "The respiratory system absorbs oxygen from the air, and the circulatory system transports this oxygen to the muscles while removing carbon dioxide back to the lungs."
    ]
  },
  {
    type: "structured",
    topic: "Plant Transport System",
    question: "Explain why adding oil to the water surface is a necessary step when conducting an experiment to measure water uptake by plant roots.",
    hint: "What happens to exposed water over time, even without plants? How does the oil prevent this?",
    expectedKeywords: ["oil", "evaporation", "fair", "roots"],
    expectedAnswers: [
      "The oil prevents water from evaporating directly into the air. This ensures that any decrease in water volume is caused only by the roots absorbing it, making it a fair test.",
      "It prevents evaporation so we know the water was taken in by the plant."
    ]
  },
  {
    type: "structured",
    topic: "Electrical Systems",
    question: "A pupil connects two identical bulbs in series to a battery. She then adds a third identical bulb in series. State the change in the brightness of the first two bulbs and explain why this happens.",
    hint: "When more bulbs are added in series, how does it affect the flow of electrical current from the battery?",
    expectedKeywords: ["dimmer", "current", "series", "share"],
    expectedAnswers: [
      "The bulbs will become dimmer. Adding more bulbs in series increases the path's resistance, reducing the current flow, and the electrical energy must be shared among more bulbs.",
      "They become dimmer because the current in the circuit decreases when another bulb is added in series."
    ]
  },
  {
    type: "structured",
    topic: "Cycles in Water",
    question: "A student hangs a wet towel flat on a clothesline in the sun. She hangs an identical wet towel folded in quarters in the same spot. Explain which towel dries faster.",
    hint: "Compare the exposed surface area of the flat towel to the folded towel. How does surface area affect evaporation?",
    expectedKeywords: ["flat", "surface", "area", "evaporate", "faster"],
    expectedAnswers: [
      "The flat towel dries faster because it has a larger exposed surface area, allowing water to evaporate into the air at a faster rate.",
      "The towel hung flat dries faster because its exposed surface area is larger, which increases the rate of evaporation."
    ]
  },
  {
    type: "structured",
    topic: "Human Respiratory System",
    question: "Explain why Ali's breathing rate increases when he runs compared to when he is sitting down.",
    hint: "What do Ali's muscles need when he runs? How does breathing help deliver it?",
    expectedKeywords: ["muscles", "energy", "oxygen", "respire", "carbon", "dioxide"],
    expectedAnswers: [
      "Ali's muscles need more energy during running. His body must take in oxygen faster for aerobic respiration to release energy, and remove carbon dioxide waste faster.",
      "Running requires his muscles to release more energy. Breathing rate increases to supply more oxygen and remove carbon dioxide rapidly."
    ]
  },

  // 2 Variable Identification Questions
  {
    type: "variable_id",
    topic: "Cycles in Water",
    question: "Identify the variables for an investigation studying: 'How does the surrounding temperature affect the rate of evaporation of water?'",
    variables: {
      changed: "Surrounding temperature",
      measured: "Rate of evaporation (amount of water evaporated in a fixed period)",
      controlled: ["Exposed surface area", "Initial volume of water", "Type of water", "Duration of test"]
    },
    hint: "What are we deliberately changing (heating up/cooling down)? What is the outcome we measure?"
  },
  {
    type: "variable_id",
    topic: "Electrical Systems",
    question: "Identify the variables for an investigation studying: 'How does the number of batteries connected in series affect the brightness of a single bulb?'",
    variables: {
      changed: "Number of batteries connected in series",
      measured: "Brightness of the bulb",
      controlled: ["Type of bulb used", "Type of battery", "Length of wires", "State of the switch"]
    },
    hint: "What is being added or removed (number of batteries)? What change are we observing in the bulb?"
  },

  // 2 Fair Test Questions
  {
    type: "fair_test",
    topic: "Reproduction in Plants",
    question: "Ben wants to test if light is needed for germination. Setup A has moist cotton wool, seeds, and is placed in a dark cupboard. Setup B has dry cotton wool, seeds, and is placed in a bright room. Is this a fair test? Explain.",
    hint: "Check how many variables Ben changed. Did he change only light, or did he change water too?",
    expectedKeywords: ["not", "fair", "changed", "two", "variables", "water", "light"],
    expectedAnswers: [
      "No, it is not a fair test. Ben changed two variables: the presence of water and the presence of light. Therefore, he cannot determine whether light or water affected the germination.",
      "It is not a fair test because he did not control the water. Both setups should have moist cotton wool."
    ]
  },
  {
    type: "fair_test",
    topic: "Human Circulatory System",
    question: "Devi wants to compare how pulse rate changes with exercise. She measures her own pulse rate at rest, and then measures her brother's pulse rate after he runs for 3 minutes. Explain why this setup makes the comparison unfair.",
    hint: "To compare resting vs active pulse fairly, who should be measured?",
    expectedKeywords: ["different", "people", "control", "same", "person"],
    expectedAnswers: [
      "The comparison is unfair because she is comparing two different people. Different people have different fitness levels and heart sizes. She should measure the pulse rate of the same person at rest and after exercise.",
      "Using two different people makes it unfair. She should test the same person to keep fitness level and natural pulse rate constant."
    ]
  },

  // 2 Graph Questions
  {
    type: "graph_reading",
    topic: "Plant Transport System",
    question: "Based on the graph showing water uptake by plants with 0, 3, and 6 leaves (absorbing 0 ml, 20 ml, and 45 ml of water respectively after 24 hours), how much water would you estimate a plant with 4 leaves would take in over the same duration?",
    options: [
      "0 ml",
      "10 ml",
      "30 ml",
      "60 ml"
    ],
    correctIndex: 2,
    explanation: "A plant with 3 leaves takes in 20 ml, and 6 leaves takes in 45 ml. The water uptake for 4 leaves should lie between 20 ml and 45 ml. 30 ml is the only reasonable value in that range."
  },
  {
    type: "graph_reading",
    topic: "Cycles in Water",
    question: "Look at the graph showing evaporation rates. Container P (narrow) evaporated 5 ml, Container Q (medium) evaporated 10 ml, and Container R (wide) evaporated 16 ml. Which container represents the one with the smallest exposed surface area?",
    options: [
      "Container P",
      "Container Q",
      "Container R",
      "They all have the same surface area."
    ],
    correctIndex: 0,
    explanation: "Container P evaporated the least amount of water (5 ml). A smaller exposed surface area leads to a slower rate of evaporation, so Container P is the narrowest container."
  },

  // 2 Conclusion Writing Questions
  {
    type: "conclusion_writing",
    topic: "General Science Inquiry",
    question: "If a pupil's experimental results do not support their original hypothesis, what is the correct scientific action to take?",
    options: [
      "Change the experimental results so that they match the hypothesis.",
      "Report the conclusion honestly according to the results, investigate if the experiment was fair, and repeat to check reliability.",
      "Ignore the results and write the conclusion that was expected.",
      "Delete the hypothesis and pretend the experiment never happened."
    ],
    correctIndex: 1,
    explanation: "Integrity is crucial in science. You must report actual results, draw conclusions based on those results, and run repeat trials to ensure reliability, rather than fabricating data."
  },
  {
    type: "conclusion_writing",
    topic: "Electrical Systems",
    question: "An experiment measures bulb brightness with different battery counts in series: 1 battery = 20 units, 2 batteries = 45 units, 3 batteries = 80 units. Write the conclusion describing the relationship between the variables.",
    hint: "As the number of batteries increases, what happens to the bulb brightness?",
    expectedKeywords: ["number", "batteries", "increases", "brightness", "increases"],
    expectedAnswers: [
      "As the number of batteries connected in series increases, the brightness of the bulb increases.",
      "Increasing the number of batteries in series causes the bulb to become brighter."
    ]
  }
];

// If using ES6 modules in browser directly, we export them. But since we import via script tags,
// we expose them globally.
window.PlantTransportLab = PlantTransportLab;
window.PracticeLabs = PracticeLabs;
window.InvestigateScenarios = InvestigateScenarios;
window.MixedQuizQuestions = MixedQuizQuestions;
