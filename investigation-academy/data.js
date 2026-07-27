// P5 Science Investigation Academy Curriculum Database
// Structured by Inquiry Skills, featuring examples from multiple P5 topics.

const AcademyModules = [
  {
    id: 1,
    title: "Asking Scientific Questions",
    badge: "Junior Question Explorer",
    badgeIcon: "🔍",
    xpReward: 100,
    coinReward: 50,
    objectives: [
      "Distinguish between simple observations and testable scientific questions.",
      "Understand what makes a scientific question investigable in a primary school lab.",
      "Identify the changed and measured variables hidden within a scientific question."
    ],
    teaching: {
      concept: "A <strong>Scientific Question</strong> is a question that can be answered by conducting an experiment and gathering evidence. Unlike everyday questions or general facts, a good scientific question is <strong>testable</strong>. It usually looks at how changing one thing (the cause) affects another thing (the effect).",
      workedExamples: [
        {
          topic: "Magnets",
          scenario: "You observe that some magnets can pick up more steel paperclips than others.",
          conceptModel: "Instead of asking a general question like 'Why are magnets magnetic?', a scientist asks a testable question: 'How does the <strong>size of a magnet</strong> affect the <strong>number of steel paperclips</strong> it can attract?' This has a clear cause (size) and effect (number of paperclips) that we can measure."
        },
        {
          topic: "Light",
          scenario: "You notice that the shadow of a toy changes size when you move a flashlight.",
          conceptModel: "A poor question is: 'Why do shadows look dark?' A good scientific question is: 'How does the <strong>distance between the light source and the object</strong> affect the <strong>height of the shadow</strong> cast on the screen?'"
        }
      ]
    },
    practice: [
      {
        id: "p1_1",
        topic: "Heat",
        type: "sort",
        questionText: "Drag the questions into the correct categories: <strong>Investigable (Testable)</strong> or <strong>Non-Investigable</strong>.",
        items: [
          { text: "How does the type of material affect the rate of heat loss from hot water?", category: "investigable" },
          { text: "How does the temperature of water affect how fast sugar dissolves?", category: "investigable" },
          { text: "Why is heat energy so warm and nice?", category: "non_investigable" },
          { text: "Who invented the thermometer?", category: "non_investigable" }
        ],
        hint: "Ask yourself: Can I set up a school science experiment to measure this? Investigable questions always have a cause (changed variable) and an effect (measured variable) you can test!"
      },
      {
        id: "p1_2",
        topic: "Forces",
        type: "select",
        questionText: "Which of the following is the best <strong>scientific question</strong> to investigate how friction works?",
        options: [
          "Why does rubber slip on wet surfaces?",
          "How does the type of surface affect the frictional force acting on a moving block?",
          "What is the friction force between a shoe and the floor?",
          "Does friction make surfaces hotter?"
        ],
        correctIndex: 1,
        explanation: "This question is the best because it clearly identifies a changed variable (type of surface) and a measured variable (frictional force) that can be easily compared in an experiment.",
        hint: "Look for a question that has a clear 'cause' (changed variable) and a 'measurable effect' (measured variable) that we can test."
      },
      {
        id: "p1_3",
        topic: "Plant Transport",
        type: "scramble",
        questionText: "Rearrange the words to form a correct, testable scientific question about plants.",
        scrambledWords: ["How", "does", "the", "number", "of", "leaves", "affect", "the", "rate", "of", "water", "absorption?"],
        correctOrder: ["How", "does", "the", "number", "of", "leaves", "affect", "the", "rate", "of", "water", "absorption?"],
        hint: "Start with 'How does...', then specify what changes (number of leaves), then 'affect the...', and finish with what we measure."
      }
    ],
    quiz: [
      {
        question: "What is the key feature of an investigable scientific question?",
        options: [
          "It can be answered by reading a science book.",
          "It starts with 'Why' and asks about feelings.",
          "It links a changed variable to a measured variable that can be tested.",
          "It must always contain the word 'plant' or 'electricity'."
        ],
        correctIndex: 2,
        explanation: "Scientific questions link a changed variable (cause) to a measured variable (effect) and can be tested through experimentation."
      },
      {
        question: "Which of these is a NON-INVESTIGABLE question?",
        options: [
          "How does the thickness of a wire affect the brightness of the bulb?",
          "Which material is the prettiest to look at under sunlight?",
          "How does temperature affect the rate of evaporation of water?",
          "How does the mass of a toy car affect the distance it travels down a ramp?"
        ],
        correctIndex: 1,
        explanation: "'Prettiest' is a personal opinion and cannot be measured scientifically, making the question non-investigable."
      },
      {
        question: "Convert the observation 'Wet clothes dry faster on windy days' into a scientific question.",
        options: [
          "Why do we wash clothes on windy days?",
          "How does the surrounding wind speed affect the rate of evaporation of water?",
          "Does wind make clothes smell fresh?",
          "How long does it take for clothes to dry?"
        ],
        correctIndex: 1,
        explanation: "Wind speed represents the wind, and rate of evaporation represents the drying clothes. This forms a testable cause-and-effect question."
      }
    ]
  },
  {
    id: 2,
    title: "Writing the Aim",
    badge: "Aim Architect",
    badgeIcon: "🎯",
    xpReward: 100,
    coinReward: 50,
    objectives: [
      "Understand the purpose of a scientific aim.",
      "Learn the standard sentence structure of an aim: 'To find out if ______ affects ______'.",
      "Convert scientific questions into clear, actionable aims."
    ],
    teaching: {
      concept: "The <strong>Aim</strong> of an investigation tells everyone what the scientist hopes to discover. Scientists write down the aim to stay focused. A standard scientific aim follows a strict template:<br><br><div class='p-3 bg-slate-100 rounded-lg text-center font-bold text-slate-800 border-l-4 border-indigo-500'>To find out if [Changed Variable] affects [Measured Variable].</div>",
      workedExamples: [
        {
          topic: "Electricity",
          scenario: "You want to test if adding more batteries makes a bulb glow brighter.",
          conceptModel: "Identify the variables:<br>- Changed Variable: Number of batteries<br>- Measured Variable: Brightness of the bulb<br>Standard Aim: <strong>To find out if the number of batteries affects the brightness of the bulb.</strong>"
        },
        {
          topic: "Properties of Materials",
          scenario: "You want to test if thicker plastic sheets can support heavier weights without tearing.",
          conceptModel: "Changed Variable: Thickness of the plastic sheet<br>Measured Variable: Maximum weight supported<br>Standard Aim: <strong>To find out if the thickness of the plastic sheet affects the maximum weight it can support.</strong>"
        }
      ]
    },
    practice: [
      {
        id: "p2_1",
        topic: "Heat",
        type: "scramble",
        questionText: "Arrange the words to form a correct <strong>scientific aim</strong> about heat conductivity.",
        scrambledWords: ["To", "find", "out", "if", "the", "type", "of", "material", "affects", "the", "rate", "of", "heat", "conduction"],
        correctOrder: ["To", "find", "out", "if", "the", "type", "of", "material", "affects", "the", "rate", "of", "heat", "conduction"],
        hint: "A standard aim starts with 'To find out if...' then state the changed variable (type of material) then 'affects...' followed by the measured variable."
      },
      {
        id: "p2_2",
        topic: "Magnets",
        type: "select",
        questionText: "A pupil wants to investigate if the number of turns of wire around an iron nail affects the strength of the electromagnet. What is the correct <strong>aim</strong>?",
        options: [
          "To make a very strong electromagnet using an iron nail.",
          "To find out if the number of turns of wire around the iron nail affects the number of paperclips attracted.",
          "To find out if wire turns make magnets look cooler.",
          "To count how many paperclips are attracted to the nail."
        ],
        correctIndex: 1,
        explanation: "This aim identifies 'number of turns of wire' as the changed variable and 'number of paperclips attracted' as the measured indicator of electromagnet strength.",
        hint: "The aim must match the variables: Changed = turns of wire; Measured = electromagnet strength (measured by paperclips attracted)."
      },
      {
        id: "p2_3",
        topic: "Water Cycle",
        type: "fill_blank",
        questionText: "Fill in the blanks to complete the aim for an investigation testing if temperature changes evaporation rates: <br><br><strong>To find out if the ____________ of water affects the ____________ of water evaporated.</strong>",
        blanks: ["temperature", "amount"],
        options: ["temperature", "amount", "volume", "color"],
        hint: "What variable is being changed? (Heat/warmth = temperature). What is being measured? (amount/volume evaporated)."
      }
    ],
    quiz: [
      {
        question: "Which of the following is the standard formula for writing a scientific aim?",
        options: [
          "If we change X, then Y will happen because of science.",
          "To find out if the changed variable affects the measured variable.",
          "I want to see if my experiment works and gets a high score.",
          "This experiment is designed to show how magnets attract metal."
        ],
        correctIndex: 1,
        explanation: "'To find out if [Changed Variable] affects [Measured Variable]' is the standard framework used in Singapore P5 Science to write aims."
      },
      {
        question: "If the scientific question is: 'How does the mass of a toy car affect the distance it travels?', what is the aim?",
        options: [
          "To see if a heavy car goes fast.",
          "To find out if the mass of the toy car affects the distance it travels.",
          "To find out if the distance traveled affects the mass of the toy car.",
          "To run a fair test using a ramp, toy car, and meter ruler."
        ],
        correctIndex: 1,
        explanation: "The aim directly mirrors the scientific question, starting with 'To find out if...' and preserving the cause-effect variable ordering."
      },
      {
        question: "Why is a scientific aim written before starting an experiment?",
        options: [
          "So the teacher can grade the handwriting.",
          "To buy the correct experimental apparatus from the store.",
          "To define a clear purpose and identify exactly what variables will be changed and measured.",
          "To write a long hypothesis about the results."
        ],
        correctIndex: 2,
        explanation: "Writing the aim clarifies the purpose of the experiment, ensuring that the investigator knows exactly what variables to isolate and monitor."
      }
    ]
  },
  {
    id: 3,
    title: "Writing a Hypothesis",
    badge: "Prediction Pro",
    badgeIcon: "🧠",
    xpReward: 100,
    coinReward: 50,
    objectives: [
      "Understand the difference between a random guess and a scientific hypothesis.",
      "Learn the structure of a hypothesis: 'If... Then... Because...'.",
      "Support predictions with sound P5 scientific concepts."
    ],
    teaching: {
      concept: "A <strong>Hypothesis</strong> is a scientific prediction that can be tested. It is not a guess! It explains what you think will happen in the experiment and <strong>why</strong>, using scientific knowledge. A good hypothesis follows this structure:<br><br><div class='p-3 bg-slate-100 rounded-lg text-slate-800 border-l-4 border-amber-500 text-xs font-semibold'>If the [Changed Variable] increases/decreases, then the [Measured Variable] will increase/decrease because [Scientific Reasoning].</div>",
      workedExamples: [
        {
          topic: "Water Cycle",
          scenario: "You are testing how wind speed affects the rate of evaporation.",
          conceptModel: "Hypothesis: <strong>If the wind speed increases, then the amount of water evaporated will increase because moving air carries away water vapour quickly, allowing more liquid water to evaporate.</strong>"
        },
        {
          topic: "Electricity",
          scenario: "You are testing how the number of bulbs in series affects their brightness.",
          conceptModel: "Hypothesis: <strong>If the number of bulbs connected in series increases, then the brightness of each bulb will decrease because the electric current from the battery is shared among more bulbs, reducing current flow.</strong>"
        }
      ]
    },
    practice: [
      {
        id: "p3_1",
        topic: "Heat",
        type: "select",
        questionText: "Choose the best <strong>scientific hypothesis</strong> for an investigation about how insulation thickness affects heat loss.",
        options: [
          "If we add more bubble wrap, the hot water will stay hot because bubble wrap is cute.",
          "If the thickness of the wrapping material increases, then the temperature drop of the hot water will decrease because thicker insulation traps more pocketed air, which is a poor conductor of heat.",
          "Bubble wrap keeps water hot, but metal wraps make it cold.",
          "Thicker wrapping keeps things hot because heat cannot get through plastic easily."
        ],
        correctIndex: 1,
        explanation: "This option is a complete hypothesis because it uses the 'If... then... because...' structure and explains the science using P5 concepts (trapped air is a poor conductor of heat).",
        hint: "Look for the option that gives a clear prediction ('If X increases, then Y will decrease...') AND explains the reason using correct science ('...because trapped air is a poor conductor of heat')."
      },
      {
        id: "p3_2",
        topic: "Forces",
        type: "fill_blank",
        questionText: "Complete the hypothesis about spring extension:<br><br><strong>If the mass of the load hung on the spring increases, then the extension of the spring will ____________ because a larger gravitational force ____________ on the spring.</strong>",
        blanks: ["increase", "pulls"],
        options: ["increase", "decrease", "pulls", "pushes"],
        hint: "More mass means more weight. What does weight do to a spring? It stretches it longer (increases extension) because gravity pulls downward."
      },
      {
        id: "p3_3",
        topic: "Plant Transport",
        type: "select",
        questionText: "Identify the scientific reasoning to complete this hypothesis: 'If the number of leaves on a branch increases, the amount of water absorbed will increase because...'",
        options: [
          "...leaves are green and absorb a lot of yellow sunlight.",
          "...leaves have stomata that lose water vapour through transpiration, creating a suction force that pulls more water up.",
          "...plants love water and use leaves to drink it from the air.",
          "...branches grow bigger when they have leaves."
        ],
        correctIndex: 1,
        explanation: "The scientific explanation for water uptake in plants is transpiration pull occurring through stomata on leaves.",
        hint: "Why do leaves cause a plant to absorb more water? Think about transpiration pull and stomata."
      }
    ],
    quiz: [
      {
        question: "What is the difference between a prediction and a hypothesis?",
        options: [
          "A prediction is a guess, while a hypothesis includes scientific reasoning.",
          "They are exactly the same thing.",
          "Predictions are only for weather, hypotheses are for school.",
          "A hypothesis is always correct, but predictions are usually wrong."
        ],
        correctIndex: 0,
        explanation: "A simple prediction only states what will happen. A hypothesis predicts the direction of change AND provides a scientific explanation (reasoning) for why it happens."
      },
      {
        question: "Which of the following is a POOR hypothesis?",
        options: [
          "If the temperature of water increases, it will evaporate faster because water molecules gain heat and change into gas quicker.",
          "I think the block will slide fast on glass because glass is very shiny and bright.",
          "If the number of batteries in series increases, the electric current increases because more batteries provide more electrical energy to push the current.",
          "If the distance between the lamp and a plant increases, the rate of photosynthesis decreases because light intensity decreases."
        ],
        correctIndex: 1,
        explanation: "'Glass is shiny and bright' is not a sound scientific explanation for why a block slides fast (which is due to low friction on smooth surfaces)."
      },
      {
        question: "In the hypothesis: 'If the surface area of a magnet increases, then the magnetic strength will increase because there is a larger surface to create magnetic fields', what is the measured variable?",
        options: [
          "Surface area of the magnet",
          "Magnetic strength",
          "Color of the magnet",
          "Size of the paperclips attracted"
        ],
        correctIndex: 1,
        explanation: "The measured variable is the effect predicted after 'then...' which is the 'magnetic strength'."
      }
    ]
  },
  {
    id: 4,
    title: "Identifying Variables",
    badge: "Variable Detective",
    badgeIcon: "🕵️",
    xpReward: 100,
    coinReward: 50,
    objectives: [
      "Define Changed, Measured, and Controlled variables.",
      "Understand the 'Fair Test' rule: only ONE variable is changed in an experiment.",
      "Identify correct variables for various Primary 5 Science setups."
    ],
    teaching: {
      concept: "To test a cause-and-effect relationship, scientists must isolate variables. There are three types of variables:<br><ol><li><strong>Changed Variable (Independent)</strong>: The one factor you change on purpose to test.</li><li><strong>Measured Variable (Dependent)</strong>: The factor that changes as a result. This is what you observe or measure.</li><li><strong>Controlled Variables</strong>: All other factors that must be kept identical to ensure a <strong>fair test</strong>.</li></ol>",
      workedExamples: [
        {
          topic: "Forces",
          scenario: "You slide a wooden block across grass, wood, and plastic tiles to see how far it goes.",
          conceptModel: "Variables:<br>- Changed Variable: <strong>Type of surface</strong><br>- Measured Variable: <strong>Distance traveled by the block</strong><br>- Controlled Variables: <strong>Mass of the block, starting force, angle of the surface.</strong>"
        },
        {
          topic: "Plant Reproduction",
          scenario: "You place seeds in 3 dishes with water. Dish A is in the fridge (5°C), Dish B is in the room (28°C), Dish C is in an oven (50°C).",
          conceptModel: "Variables:<br>- Changed Variable: <strong>Surrounding temperature</strong><br>- Measured Variable: <strong>Number of seeds germinated</strong><br>- Controlled Variables: <strong>Amount of water, type of seeds, presence of oxygen.</strong>"
        }
      ]
    },
    practice: [
      {
        id: "p4_1",
        topic: "Water Cycle",
        type: "sort",
        questionText: "An experiment is set up to find out how the exposed surface area of a container affects the rate of water evaporation. Match the variable tags to their roles.",
        items: [
          { text: "Exposed surface area of container", category: "changed" },
          { text: "Amount of water evaporated", category: "measured" },
          { text: "Initial volume of water", category: "controlled" },
          { text: "Location and temperature of environment", category: "controlled" }
        ],
        hint: "What is the cause we vary on purpose? (exposed surface area: narrow, medium, wide). What is the outcome we measure? (volume of water evaporated). What must stay identical for a fair test?"
      },
      {
        id: "p4_2",
        topic: "Heat",
        type: "select",
        questionText: "A student wants to compare the heat conductivity of different metals. She heats metal rods of Copper, Iron, and Aluminium. To make it a <strong>fair test</strong>, which of the following variables MUST be kept the same?",
        options: [
          "Type of metal rod",
          "Length and thickness of the metal rods",
          "Time taken for thumbtacks to fall off",
          "Temperature of the rods when heated"
        ],
        correctIndex: 1,
        explanation: "To compare the metals fairly, the rods must have the exact same physical dimensions (length and thickness), otherwise thicker or shorter rods might conduct heat faster regardless of their material.",
        hint: "We are changing the metal type on purpose. The time taken is what we measure. What dimensions of the rods must be identical?"
      },
      {
        id: "p4_3",
        topic: "Magnets",
        type: "select",
        questionText: "In an experiment testing how distance affects magnetic attraction strength, a student moves a bar magnet closer to a steel paperclip until it jumps. What is the <strong>measured variable</strong>?",
        options: [
          "The size of the bar magnet",
          "The distance at which the paperclip is attracted to the magnet",
          "The type of paperclip used",
          "The strength of the magnet"
        ],
        correctIndex: 1,
        explanation: "The measured variable is the distance where the attraction takes place, which tells us how strong the magnetic field is at range.",
        hint: "What value are we reading with a ruler when the paperclip moves?"
      }
    ],
    quiz: [
      {
        question: "Why can there only be ONE changed variable in a scientific experiment?",
        options: [
          "Because school laboratories do not have enough equipment.",
          "To ensure the experiment is a fair test, so that any change in the measured variable is caused only by the changed variable.",
          "It makes recording data in tables much faster.",
          "So the hypothesis is always correct."
        ],
        correctIndex: 1,
        explanation: "If you change more than one variable, you won't know which of the changed variables caused the result, making the test unfair and invalid."
      },
      {
        question: "A student tests seed germination. He sets up Beaker A (dry cotton wool, warm room) and Beaker B (wet cotton wool, cold fridge). Is this a fair test?",
        options: [
          "Yes, because both beakers have seeds.",
          "No, because he changed two variables: water (dry vs wet) and temperature (warm vs cold).",
          "Yes, because seeds in Beaker B will germinate.",
          "No, because the beakers are not the same size."
        ],
        correctIndex: 1,
        explanation: "Changing both moisture and temperature makes it impossible to tell whether seeds failed to grow due to lack of water or cold temperatures."
      },
      {
        question: "Which of the following is a controlled variable in an investigation of liquid evaporation rates in containers of different surface areas?",
        options: [
          "Amount of water evaporated",
          "Exposed surface area of the container",
          "Initial volume of water in each container",
          "Width of the container mouth"
        ],
        correctIndex: 2,
        explanation: "Initial volume must be controlled (kept identical) across all containers. Exposed surface area is the changed variable, and amount evaporated is measured."
      }
    ]
  },
  {
    id: 5,
    title: "Designing the Experiment",
    badge: "Experiment Designer",
    badgeIcon: "🛠️",
    xpReward: 120,
    coinReward: 60,
    objectives: [
      "Select appropriate apparatus for scientific investigations.",
      "Understand the need for a 'Control Setup' to compare results.",
      "Spot errors, fair-test violations, or safety issues in experiment layouts."
    ],
    teaching: {
      concept: "<strong>Designing an Experiment</strong> involves choosing the right apparatus and arranging them to test your hypothesis fairly. Often, scientists set up a <strong>Control Setup</strong>. A control setup is identical to the experimental setup in every way, <i>except</i> it does not receive the changed variable. This proves that the changed variable is what actually caused the results.",
      workedExamples: [
        {
          topic: "Plant Transport",
          scenario: "To prove leaves absorb water, you set up Beaker A (plant with leaves, water, oil).",
          conceptModel: "Control Setup: You must set up Beaker B (identical beaker, same water volume, oil, but a <strong>plant with NO leaves</strong> or just a stick). If water drops in Beaker A but not in B, it proves leaves take in water, not just the stem."
        },
        {
          topic: "Electricity",
          scenario: "You want to test if saltwater conducts electricity.",
          conceptModel: "Setup: Construct a closed circuit with batteries, a bulb, wires, and two electrodes dipped in a beaker of saltwater. If the bulb lights up, it indicates current is flowing."
        }
      ]
    },
    practice: [
      {
        id: "p5_1",
        topic: "Water Cycle",
        type: "select",
        questionText: "To prove that a <strong>layer of oil</strong> prevents water from evaporating, which control setup should you use alongside a beaker with 100ml water and a layer of oil?",
        options: [
          "A beaker with 200ml water and a layer of oil.",
          "An identical beaker with 100ml water but NO layer of oil, placed in the same location.",
          "A plastic container with 50ml water and oil placed inside a dark cupboard.",
          "A beaker with oil only (no water)."
        ],
        correctIndex: 1,
        explanation: "The control setup must be identical (same 100ml water, same beaker, same location) but lack the oil layer. The difference in water loss will prove if oil prevents evaporation.",
        hint: "The control setup must be identical in every way except for the variable you want to test (presence of the oil layer)."
      },
      {
        id: "p5_2",
        topic: "Electricity",
        type: "sim_layout",
        questionText: "Identify the mistake in the circuit builder setup below that prevents the bulb from lighting up: <br><br><i>[Visual: A battery connected to a bulb, but the switch is open, and one wire is connected to the glass bulb rather than the metal casing.]</i>",
        options: [
          "The battery is reversed.",
          "The switch is open, and a wire terminal is connected to the non-conducting glass bulb instead of the metal casing.",
          "There is no electric current in batteries.",
          "Bulbs do not conduct electricity."
        ],
        correctIndex: 1,
        explanation: "Electric current can only flow through a closed circuit made of conductors. Glass is an insulator, and open switches create gaps.",
        hint: "Look at the switch state and where the wire touches the bulb. Glass is an insulator!"
      },
      {
        id: "p5_3",
        topic: "Light",
        type: "select",
        questionText: "A student wants to compare the transparency of cardboard, clear glass, and tracing paper. What apparatus should they use to get a fair, measurable comparison?",
        options: [
          "A torch, a light sensor, a ruler, and identical sheets of the three materials.",
          "A magnifying glass and a sunlight beam.",
          "A beaker of water and a thermometer.",
          "A bar magnet and a compass."
        ],
        correctIndex: 0,
        explanation: "A torch acts as the source, the materials are the changed variable, the ruler controls the distance, and the light sensor measures light transmission objectively.",
        hint: "Transparency is about how much light passes through. What sensor measures light brightness?"
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of a 'Control Setup' in an experiment?",
        options: [
          "To have a backup in case the first setup breaks.",
          "To double the amount of data collected.",
          "To compare results and prove that changes in the measured variable are solely due to the changed variable.",
          "To show how to build experiments safely."
        ],
        correctIndex: 2,
        explanation: "A control setup provides a baseline, proving that the changed variable is indeed the sole cause of the observed effect."
      },
      {
        question: "To test if warmth is needed for germination, a student sets up Dish A (wet cotton, warm room) and Dish B (dry cotton, cold fridge). What correction is needed?",
        options: [
          "Dish B must be placed in a warm room too.",
          "Dish B must have wet cotton wool so that only temperature differs.",
          "Dish A must have dry cotton wool.",
          "No correction is needed."
        ],
        correctIndex: 1,
        explanation: "To test temperature (warmth), moisture must be kept identical (wet cotton in both dishes) to ensure a fair test."
      },
      {
        question: "When testing magnet strength by attracting steel pins, why is it important to use identical pins?",
        options: [
          "Different pins might have different masses or magnetic properties, which would make the test unfair.",
          "Identical pins look better in diagrams.",
          "Steel pins are the only pins that magnets can attract.",
          "It does not matter; any pins can be used."
        ],
        correctIndex: 0,
        explanation: "Pins of different weights or materials would require different magnetic forces to lift, ruining the comparison between magnets."
      }
    ]
  },
  {
    id: 6,
    title: "Writing the Procedure",
    badge: "Procedure Planner",
    badgeIcon: "📋",
    xpReward: 120,
    coinReward: 60,
    objectives: [
      "Write experimental instructions in a logical, numbered sequence.",
      "Understand why repeating trials (at least 3 times) is essential for reliable results.",
      "Identify missing steps or safety actions in a procedure."
    ],
    teaching: {
      concept: "A <strong>Procedure</strong> is a set of step-by-step instructions for conducting the experiment. It must be written so clearly that another scientist can repeat your experiment exactly and get the same results. A good procedure is always:<br><ul><li>Written in numbered, logical steps.</li><li>Uses precise measurements and apparatus names.</li><li>Includes a step to <strong>repeat the experiment</strong> (usually 3 times) to ensure the results are <strong>reliable</strong>.</li></ul>",
      workedExamples: [
        {
          topic: "Heat",
          scenario: "Writing a procedure to test heat conduction in different metal rods.",
          conceptModel: "Logical steps:<br>1. Set up rods of equal length.<br>2. Attach a thumbtack to the end of each rod with wax.<br>3. Heat the opposite ends with a Bunsen burner.<br>4. Record the time taken for each thumbtack to fall.<br>5. <strong>Repeat steps 1-4 three times and calculate the average time.</strong>"
        },
        {
          topic: "Forces",
          scenario: "Measuring frictional force on different surfaces.",
          conceptModel: "Key step: 'Use a spring balance to pull a wooden block across the surface at a steady speed. Record the reading when the block starts moving. Repeat 3 times to get an average.'"
        }
      ]
    },
    practice: [
      {
        id: "p6_1",
        topic: "Plant Reproduction",
        type: "sort",
        questionText: "Arrange these scrambled steps of a <strong>germination procedure</strong> into the correct logical order (1 to 5).",
        itemsOrder: [
          { text: "Label three identical petri dishes as A, B, and C.", stepNum: 1 },
          { text: "Place 10 seeds on moist cotton wool in each of the three petri dishes.", stepNum: 2 },
          { text: "Place Dish A in the dark cupboard, Dish B in a bright cupboard, and Dish C in a sunny room.", stepNum: 3 },
          { text: "Record the number of germinated seeds in each dish daily for 5 days.", stepNum: 4 },
          { text: "Repeat the entire experiment three times to ensure reliability.", stepNum: 5 }
        ],
        hint: "Start by preparing and labelling your containers, then add seeds, then place them in different conditions (the changed variable), then observe, and finally repeat."
      },
      {
        id: "p6_2",
        topic: "Magnets",
        type: "select",
        questionText: "In a procedure testing electromagnet strength, why do we include the step: 'Repeat the measurement of attracted paperclips three times'?",
        options: [
          "To occupy the student for the full science period.",
          "To check if the batteries run out of electrical energy.",
          "To reduce experimental errors and calculate an average, making the results more reliable.",
          "To show that magnets get stronger the more you use them."
        ],
        correctIndex: 2,
        explanation: "Repeating trials helps identify anomalies and averages out small errors, making the conclusion far more reliable.",
        hint: "Think about why scientists don't rely on a single test. What if a paperclip got stuck by accident?"
      },
      {
        id: "p6_3",
        topic: "Heat",
        type: "select",
        questionText: "Which instruction is written with the best <strong>scientific precision</strong>?",
        options: [
          "Pour some warm water into a container and wait a bit.",
          "Pour 100 ml of water at 80°C into a glass beaker and record the temperature every 2 minutes for 10 minutes using a thermometer.",
          "Put a thermometer in hot water and watch the mercury line move.",
          "Heat up some water on a stove and check if it is hot."
        ],
        correctIndex: 1,
        explanation: "This step is precise because it specifies the exact volume (100 ml), initial temperature (80°C), time interval (2 minutes), total duration (10 minutes), and apparatus (thermometer).",
        hint: "Look for numbers, units (ml, °C, minutes), and specific apparatus names (beaker, thermometer)."
      }
    ],
    quiz: [
      {
        question: "Why should procedure steps be numbered and written in order?",
        options: [
          "It is a school rule for exams.",
          "So that anyone else can replicate the experiment exactly in the same sequence.",
          "To make the report look shorter.",
          "Because computers can only read numbered lists."
        ],
        correctIndex: 1,
        explanation: "A procedure is a recipe. To replicate the results, another researcher must follow the exact same steps in the exact same order."
      },
      {
        question: "What does repeating an experiment 3 times do?",
        options: [
          "It makes the test fair.",
          "It changes the variables.",
          "It improves the reliability of the results by allowing us to identify anomalies and calculate averages.",
          "It proves the hypothesis is correct."
        ],
        correctIndex: 2,
        explanation: "Fairness is about isolating one changed variable. Reliability is about consistency, which is improved by repeating trials."
      },
      {
        question: "Which of the following steps is missing from this friction experiment procedure: '1. Place block on surface. 2. Pull with spring balance. 3. Record force.'?",
        options: [
          "Clean the block with a cloth.",
          "Change the mass of the block.",
          "Repeat the pull three times to get an average, and repeat for different surfaces.",
          "Color the surfaces to see them better."
        ],
        correctIndex: 2,
        explanation: "Without repeating and testing other surfaces (the changed variable), we cannot draw a reliable conclusion about surface types."
      }
    ]
  },
  {
    id: 7,
    title: "Collecting and Presenting Data",
    badge: "Data Collector",
    badgeIcon: "📊",
    xpReward: 120,
    coinReward: 60,
    objectives: [
      "Construct neat data tables with headings and units.",
      "Calculate averages from repeated trials.",
      "Select and plot appropriate graphs (bar graphs vs line graphs) to represent data."
    ],
    teaching: {
      concept: "Scientists record measurements in a <strong>Data Table</strong>. A proper table has clear headers with units (like grams, cm, or ml). In P5 Science, you must repeat trials and calculate the **Average**. To present data visually, we use:<br><ul><li><strong>Bar Graphs</strong>: For comparing separate categories (e.g. types of materials, different surfaces).</li><li><strong>Line Graphs</strong>: For showing continuous changes over time (e.g. temperature drop of water, seed growth over days).</li></ul>",
      workedExamples: [
        {
          topic: "Plant Transport",
          scenario: "You measure water taken in (ml) for 0, 3, and 6 leaves over 3 trials.",
          conceptModel: "Table design:<br>Headers: 'Number of Leaves', 'Trial 1 (ml)', 'Trial 2 (ml)', 'Trial 3 (ml)', 'Average Volume taken in (ml)'.<br>Average calculation: (Trial 1 + 2 + 3) / 3."
        },
        {
          topic: "Heat",
          scenario: "Plotting cooling rates of water over 10 minutes.",
          conceptModel: "Use a **Line Graph** because time and temperature are continuous values. X-axis shows Time (mins), Y-axis shows Temperature (°C)."
        }
      ]
    },
    practice: [
      {
        id: "p7_1",
        topic: "Water Cycle",
        type: "calculate",
        questionText: "Calculate the **average volume** of water evaporated from three containers over 3 trials. Fill in the average column in the table below:<br><br><i>Narrow Container: Trial 1 = 4ml, Trial 2 = 6ml, Trial 3 = 5ml. Average = ?</i><br><i>Medium Container: Trial 1 = 9ml, Trial 2 = 11ml, Trial 3 = 10ml. Average = ?</i><br><i>Wide Container: Trial 1 = 14ml, Trial 2 = 16ml, Trial 3 = 15ml. Average = ?</i>",
        tableData: [
          { container: "Narrow", t1: 4, t2: 6, t3: 5, expectedAvg: 5 },
          { container: "Medium", t1: 9, t2: 11, t3: 10, expectedAvg: 10 },
          { container: "Wide", t1: 14, t2: 16, t3: 15, expectedAvg: 15 }
        ],
        hint: "To find the average, add the three trials together and divide by 3! Example: (4 + 6 + 5) = 15. 15 / 3 = 5."
      },
      {
        id: "p7_2",
        topic: "Forces",
        type: "select",
        questionText: "A pupil measures the frictional force (in Newtons) required to pull a block across four different surfaces: Sandpaper, Wood, Glass, and Plastic. What is the best way to represent this data?",
        options: [
          "A line graph, because the surfaces are categories and friction changes over time.",
          "A bar graph, because the surfaces are distinct, separate categories.",
          "A pie chart showing percentage of surface area.",
          "No graph is needed; a text list is sufficient."
        ],
        correctIndex: 1,
        explanation: "Bar graphs compare separate, distinct categories (Sandpaper, Wood, Glass, Plastic) rather than continuous changes.",
        hint: "Are the surfaces continuous numbers (like time or temperature), or are they separate distinct categories (names of surfaces)?"
      },
      {
        id: "p7_3",
        topic: "Circulatory System",
        type: "graph_plot",
        questionText: "Examine the circulatory system simulation. Click each activity level tab (Resting, 1 Min, 2 Min) to read the pulse rate. Then, plot the bar values on the graph controls:<br><br><strong>• Resting = 75 bpm</strong><br><strong>• 1 Min = 95 bpm</strong><br><strong>• 2 Min = 120 bpm</strong>",
        bars: [
          { x: "Resting", targetY: 75 },
          { x: "1 Min", targetY: 95 },
          { x: "2 Min", targetY: 120 }
        ],
        hint: "Match the height of each bar to the pulse rate: Resting = 75, 1 Min = 95, 2 Min = 120."
      }
    ],
    quiz: [
      {
        question: "How do you calculate the average of three trial readings: 12, 17, and 16?",
        options: [
          "Add them up and multiply by 3.",
          "Pick the middle number (16).",
          "Add them up: 12 + 17 + 16 = 45, then divide by 3 to get 15.",
          "Subtract the smallest from the largest."
        ],
        correctIndex: 2,
        explanation: "Average is the sum of all values divided by the number of trials: (12+17+16)/3 = 15."
      },
      {
        question: "When is a line graph preferred over a bar graph?",
        options: [
          "When comparing different kinds of food in a food chain.",
          "When the changed variable is continuous, such as recording changes over time or temperature.",
          "When there are only two categories to show.",
          "When the values are very large."
        ],
        correctIndex: 1,
        explanation: "Line graphs show trends in continuous numerical data (like temperature over time) rather than comparing separate categories."
      },
      {
        question: "What is missing from a graph axis labelled 'Water Lost (ml)' and an axis labelled 'Time'?",
        options: [
          "The Time axis needs a unit, such as 'Time (minutes)' or 'Time (hours)'.",
          "A title explaining who drew the graph.",
          "Different colors for each point.",
          "Grid lines are missing."
        ],
        correctIndex: 0,
        explanation: "All axes with physical quantities must include units in parentheses so readers know what the numbers represent."
      }
    ]
  },
  {
    id: 8,
    title: "Drawing Conclusions",
    badge: "Young Scientist",
    badgeIcon: "🎓",
    xpReward: 150,
    coinReward: 80,
    objectives: [
      "Identify patterns and trends in data sheets.",
      "Relate findings back to the experimental aim and hypothesis.",
      "Formulate conclusions using scientific evidence and explanations."
    ],
    teaching: {
      concept: "A **Conclusion** is the final statement of what was learned. To write an excellent P5 conclusion, you must:<br><ol><li><strong>State the Trend</strong>: How does the changed variable affect the measured variable? (e.g., 'As X increases, Y increases').</li><li><strong>Relate to the Aim</strong>: Did you answer the aim?</li><li><strong>Evaluate the Hypothesis</strong>: State if the data supports or rejects your hypothesis.</li><li><strong>Scientific Reasoning</strong>: Link the final results to scientific concepts.</li></ol>",
      workedExamples: [
        {
          topic: "Magnets",
          scenario: "Electromagnet test results show: 10 turns = 2 pins, 20 turns = 5 pins, 30 turns = 8 pins.",
          conceptModel: "Conclusion: <strong>As the number of turns of wire around the iron nail increases, the magnetic strength of the electromagnet increases, attracting more paperclips. This supports the hypothesis.</strong>"
        },
        {
          topic: "Plant Transport",
          scenario: "Plant with leaves took in 50ml of water, plant with no leaves took in 2ml.",
          conceptModel: "Conclusion: <strong>The plant with leaves took in significantly more water than the plant without leaves. This is because transpiration occurs through leaves, drawing water up the stems.</strong>"
        }
      ]
    },
    practice: [
      {
        id: "p8_1",
        topic: "Water Cycle",
        type: "select",
        questionText: "An experiment compared evaporation from containers A (surface area 20cm²) and B (surface area 80cm²). A lost 5ml water, and B lost 20ml water. What is the most complete <strong>conclusion</strong>?",
        options: [
          "Container B dried out very quickly because it was in the sun.",
          "As the exposed surface area of the water increases, the rate of evaporation of water increases. This is shown by Container B losing 15 ml more water than Container A.",
          "Water changed state from liquid to gas because of heat.",
          "Evaporation is part of the water cycle."
        ],
        correctIndex: 1,
        explanation: "This conclusion states the trend clearly ('As surface area increases, rate of evaporation increases') and supports it using the data evidence.",
        hint: "A good conclusion state the pattern (As X changes, Y changes) and uses data values as evidence."
      },
      {
        id: "p8_2",
        topic: "Electricity",
        type: "fill_blank",
        questionText: "Complete the conclusion for series circuits: <br><br><strong>As the number of bulbs in series increases, the brightness of each bulb ____________. This ____________ the hypothesis that series circuits share current.</strong>",
        blanks: ["decreases", "supports"],
        options: ["increases", "decreases", "supports", "rejects"],
        hint: "More bulbs in series = dimmer bulbs (decreases). If the prediction matched this, it 'supports' the hypothesis."
      },
      {
        id: "p8_3",
        topic: "Forces",
        type: "select",
        questionText: "Select the correct explanation to complete this conclusion: 'The wooden block required 5N to move on concrete but only 1N on glass because...'",
        options: [
          "...concrete is a darker color than glass.",
          "...concrete has a rougher surface than glass, creating a larger frictional force that opposes the motion.",
          "...glass is fragile and breaks easily under load.",
          "...forces are always larger on concrete pavements."
        ],
        correctIndex: 1,
        explanation: "Frictional force depends on surface texture. Rougher surfaces (concrete) produce more friction than smooth ones (glass).",
        hint: "Think about surface roughness and frictional force."
      }
    ],
    quiz: [
      {
        question: "What must a scientist do if their experimental data does NOT support their hypothesis?",
        options: [
          "Change the data numbers so they match the hypothesis.",
          "Throw away the experiment and start again in secret.",
          "State honestly that the hypothesis is rejected by the evidence, and seek a new scientific explanation.",
          "Ignore the conclusion step."
        ],
        correctIndex: 2,
        explanation: "Science relies on honesty and evidence. If data contradicts a hypothesis, the hypothesis is rejected or refined, never the data."
      },
      {
        question: "Which conclusion matches the aim: 'To find out how temperature affects the rate of dissolving'?",
        options: [
          "Dissolving sugar makes the water sweet.",
          "As the temperature of the water increases, the rate of dissolving of sugar increases.",
          "Warm water has more heat energy than cold water.",
          "We used a stirrer to dissolve the sugar faster."
        ],
        correctIndex: 1,
        explanation: "The conclusion must directly answer the aim, linking the temperature (changed variable) to the rate of dissolving (measured variable)."
      },
      {
        question: "What is data evidence in a conclusion?",
        options: [
          "The science text from a textbook.",
          "Using actual measured values from the experiment to support your claim.",
          "Drawing a bar graph.",
          "A list of the apparatus used."
        ],
        correctIndex: 1,
        explanation: "Data evidence means quoting specific numerical readings or measurements from your data table to prove your conclusion is correct."
      }
    ]
  }
];

// 5 Practice scenarios mapped to topics to load simulations
const SimulatorLabs = {
  water_cycle: {
    title: "Evaporation Rates",
    topic: "Cycles in Water",
    question: "How does the exposed surface area of water affect the rate of evaporation?",
    type: "evaporation",
    vars: { changed: "Exposed surface area", measured: "Volume of water evaporated" }
  },
  electrical: {
    title: "Circuit Connections",
    topic: "Electrical Systems",
    question: "How does the layout of components affect bulb lighting?",
    type: "circuit",
    vars: { changed: "Circuit connections", measured: "Bulb state (on/off)" }
  },
  reproduction: {
    title: "Seed Germination",
    topic: "Reproduction in Plants",
    question: "How does the presence of water affect seed germination?",
    type: "germination",
    vars: { changed: "Presence of water", measured: "Seed growth stages" }
  },
  respiratory: {
    title: "Breathing Rates",
    topic: "Human Respiratory System",
    question: "How does the duration of exercise affect breathing rates?",
    type: "respiratory",
    vars: { changed: "Duration of exercise", measured: "Breathing rate (breaths per min)" }
  },
  circulatory: {
    title: "Heart Pulse Rates",
    topic: "Human Circulatory System",
    question: "How does the intensity of exercise affect pulse rates?",
    type: "circulatory",
    vars: { changed: "Intensity of exercise", measured: "Pulse rate (beats per min)" }
  }
};

// Mock student progress data for the Teacher Dashboard
const MockStudentProgress = [
  { name: "Isaac Newton", completedModules: 4, averageQuizScore: 92, xp: 450, misconceptions: ["Variable confusion"] },
  { name: "Marie Curie", completedModules: 8, averageQuizScore: 98, xp: 980, misconceptions: [] },
  { name: "Albert Einstein", completedModules: 7, averageQuizScore: 88, xp: 820, misconceptions: ["Control setup error"] },
  { name: "Ada Lovelace", completedModules: 6, averageQuizScore: 94, xp: 680, misconceptions: [] },
  { name: "Charles Darwin", completedModules: 3, averageQuizScore: 78, xp: 320, misconceptions: ["Aim formatting", "Hypothesis reasoning"] },
  { name: "Tu Youyou", completedModules: 5, averageQuizScore: 85, xp: 520, misconceptions: [] }
];

// Export to window if running in browser, or module.exports if in node.js testing
if (typeof window !== "undefined") {
  window.AcademyModules = AcademyModules;
  window.SimulatorLabs = SimulatorLabs;
  window.MockStudentProgress = MockStudentProgress;
} else {
  module.exports = { AcademyModules, SimulatorLabs, MockStudentProgress };
}
