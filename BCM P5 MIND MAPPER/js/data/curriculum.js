// Singapore MOE Primary Science Syllabus (2023) - Official P5 Topics & Success Criteria
// Sourced from: https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023.pdf

export const CURRICULUM = {
  "Cycles in Plants and Animals (Reproduction)": {
    theme: "Cycles",
    description: "Understand that living things reproduce to ensure continuity of their kind, passing on characteristics to offspring, with the cell as the basic unit of life.",
    concepts: {
      "Reproduction in flowering plants": {
        overview: "Sexual reproduction in flowering plants through pollination, fertilisation, seed dispersal, and germination.",
        suggestedKeywords: [
          "continuity of kind", "flowering plants", "stamen", "anther", "filament", "pollen grain",
          "pistil / carpel", "stigma", "style", "ovary", "ovule", "male reproductive cell",
          "female reproductive cell", "pollination", "wind-pollinated", "insect-pollinated",
          "fertilisation", "seed production", "fruit", "seed dispersal", "wind dispersal",
          "water dispersal", "animal dispersal", "explosive action / splitting", "germination",
          "reproduction by spores", "reproduction by seeds"
        ],
        successCriteria: [
          "I can explain that living things reproduce to ensure the continuity of their kind.",
          "I can identify the male (stamen: anther, filament) and female (pistil: stigma, style, ovary, ovule) reproductive parts of a flower.",
          "I can state the function of the anther (produces pollen grains) and stigma (receives pollen grains).",
          "I can describe the 4 key stages in the sexual reproduction of flowering plants: pollination, fertilisation, seed dispersal, and germination.",
          "I can explain pollination as the transfer of pollen grains from the anther to the stigma.",
          "I can explain that fertilisation occurs when a male reproductive cell fuses with a female reproductive cell in the ovule to produce seeds.",
          "I can describe methods of seed/fruit dispersal (wind, water, animal, explosive splitting action) and why dispersal is necessary (reduces competition for space, sunlight, water, and minerals).",
          "I can compare the ways non-flowering and flowering plants reproduce (spores vs seeds)."
        ],
        hints: [
          "Can you sequence the 4 stages from flower pollination to a new seedling?",
          "Which parts of the flower contain the male and female reproductive cells?",
          "What happens during fertilisation in flowering plants?",
          "Why must seeds be dispersed far away from the parent plant?"
        ],
        checks: [
          { key: "pollination", prompt: "Did you describe pollination as the transfer of pollen from anther to stigma?" },
          { key: "fertilisation", prompt: "Did you explain fertilisation as the fusion of male and female reproductive cells?" },
          { key: "dispersal", prompt: "Did you include methods of seed dispersal (wind, animal, water, splitting)?" },
          { key: "spore", prompt: "Did you contrast flowering plants (seeds) with non-flowering plants (spores)?" }
        ],
        linkVerbs: ["produces pollen at", "transfers pollen to", "fuses with", "develops into seed in", "dispersed by", "germinates into"]
      },
      "Reproduction in humans": {
        overview: "Sexual reproduction in humans, male and female reproductive organs, and fertilisation in the womb.",
        suggestedKeywords: [
          "human reproduction", "continuity of kind", "testes", "sperm", "male reproductive cells",
          "penis", "ovaries", "eggs / ova", "female reproductive cells", "womb / uterus",
          "fertilisation", "single sperm fuses with egg", "fertilised egg", "develops in the womb",
          "characteristics passed from parents to offspring", "heredity"
        ],
        successCriteria: [
          "I can state that living things reproduce to ensure the continuity of their kind.",
          "I can identify that many characteristics of an organism are passed on from parents to offspring (heredity).",
          "I can identify that the testes produce sperms (male reproductive cells).",
          "I can identify that the ovaries produce eggs (female reproductive cells).",
          "I can explain that fertilisation occurs when a sperm fuses with an egg.",
          "I can state that the fertilised egg develops in the womb."
        ],
        hints: [
          "Which organs produce sperms and which organs produce eggs?",
          "What is fertilisation in humans, and where does the fertilised egg develop?",
          "Why do children inherit traits (e.g. eye colour, hair type) from their parents?"
        ],
        checks: [
          { key: "testes", prompt: "Did you mention the testes as the organs that produce sperms?" },
          { key: "ovary", prompt: "Did you mention the ovaries as the organs that produce eggs?" },
          { key: "fertilisation", prompt: "Did you explain fertilisation as a sperm fusing with an egg?" },
          { key: "womb", prompt: "Did you include the womb as the place where the fertilised egg develops?" }
        ],
        linkVerbs: ["produces", "fuses with", "develops in", "passes characteristics to", "ensures continuity of"]
      },
      "Cells & Continuity of life": {
        overview: "The cell as the basic unit of life and comparing fertilisation in plants and humans.",
        suggestedKeywords: [
          "cell as basic unit of life", "building blocks of organisms", "heredity",
          "characteristics passed from parents", "offspring", "continuity of kind",
          "similarity in fertilisation", "male reproductive cell", "female reproductive cell",
          "fusion of sex cells", "flowering plants vs humans"
        ],
        successCriteria: [
          "I can recognise that a cell is the basic unit of life for all living things.",
          "I can explain that many characteristics of an organism are passed on from parents to offspring.",
          "I can recognise the similarity in fertilisation between flowering plants and humans (both involve the fusion of a male reproductive cell with a female reproductive cell).",
          "I can explain why reproduction is essential to prevent extinction of a species."
        ],
        hints: [
          "What is the fundamental building block (basic unit) of all living things?",
          "What fundamental similarity exists between plant and human sexual reproduction?",
          "How does reproduction ensure the continuity of life?"
        ],
        checks: [
          { key: "cell", prompt: "Did you state that a cell is the basic unit of life?" },
          { key: "similarity", prompt: "Did you compare fertilisation in plants and humans (fusion of male & female sex cells)?" },
          { key: "characteristic", prompt: "Did you explain that characteristics are passed from parents to offspring?" }
        ],
        linkVerbs: ["is the basic unit of", "fuses during", "passes on traits to", "prevents extinction of"]
      }
    }
  },

  "Cycles in Matter and Water (Water)": {
    theme: "Cycles",
    description: "Explore the three interchangeable states of water, changes of state via heat exchange, evaporation variables, and the water cycle.",
    concepts: {
      "Changes of state in water": {
        overview: "Interchangeable states (solid, liquid, gas) driven by heat gain or heat loss at fixed/variable temperatures.",
        suggestedKeywords: [
          "three interchangeable states", "solid (ice)", "liquid (water)", "gas (steam / water vapour)",
          "melting", "freezing", "boiling", "evaporation", "condensation",
          "heat gain", "heat loss", "melting point of ice (0°C)", "freezing point of water (0°C)",
          "boiling point of water (100°C)", "temperature remains constant during change of state",
          "invisible water vapour", "tiny water droplets (clouds / mist / steam)"
        ],
        successCriteria: [
          "I can recognise that water can exist in three interchangeable states of matter (solid, liquid, gas).",
          "I can explain melting as a change from solid to liquid at 0°C due to heat gain.",
          "I can explain freezing as a change from liquid to solid at 0°C due to heat loss.",
          "I can state that the melting point of ice and the freezing point of water are both 0°C.",
          "I can explain boiling as a rapid change from liquid to gas throughout the liquid at 100°C due to heat gain.",
          "I can state that the boiling point of pure water is 100°C.",
          "I can explain evaporation as liquid water changing to water vapour at any temperature below 100°C due to heat gain.",
          "I can explain condensation as water vapour changing to liquid water due to heat loss when touching a cooler surface.",
          "I can distinguish between invisible water vapour and visible clouds/mist/steam (tiny water droplets)."
        ],
        hints: [
          "Which changes of state require heat gain, and which require heat loss?",
          "At what fixed temperature does ice melt and pure water boil?",
          "How does evaporation differ from boiling?",
          "Is steam or water vapour invisible gas or tiny liquid droplets?"
        ],
        checks: [
          { key: "heat gain", prompt: "Did you show which processes involve heat gain (melting, boiling, evaporation)?" },
          { key: "heat loss", prompt: "Did you show which processes involve heat loss (freezing, condensation)?" },
          { key: "0°C", prompt: "Did you specify 0°C for melting/freezing point and 100°C for boiling point?" },
          { key: "condensation", prompt: "Did you explain condensation when water vapour loses heat to a cooler surface?" }
        ],
        linkVerbs: ["gains heat to melt into", "loses heat to freeze into", "boils at 100°C into", "evaporates into", "loses heat and condenses into"]
      },
      "Evaporation and factors": {
        overview: "Investigating how temperature, wind, and exposed surface area affect the rate of evaporation in fair tests.",
        suggestedKeywords: [
          "rate of evaporation", "temperature", "wind / air movement", "exposed surface area",
          "humidity", "fair test", "changed variable (independent)", "measured variable (dependent)",
          "constant variables (kept the same)", "surface of the liquid", "drying of clothes"
        ],
        successCriteria: [
          "I can explain that evaporation occurs only at the surface of liquid water at any temperature below 100°C.",
          "I can investigate how wind/air movement affects the rate of evaporation (higher wind = faster evaporation).",
          "I can investigate how temperature affects the rate of evaporation (higher temperature = faster evaporation).",
          "I can investigate how exposed surface area affects the rate of evaporation (greater surface area = faster evaporation).",
          "I can identify the changed variable, measured variable, and constant variables to ensure a fair test."
        ],
        hints: [
          "What are the three syllabus factors that affect how fast water evaporates?",
          "How does spreading out wet laundry (increasing exposed surface area) speed up drying?",
          "What variables must you keep the same to ensure a fair test?"
        ],
        checks: [
          { key: "wind", prompt: "Did you include wind/air movement as a factor affecting evaporation rate?" },
          { key: "temperature", prompt: "Did you include temperature as a factor affecting evaporation rate?" },
          { key: "surface", prompt: "Did you include exposed surface area as a factor affecting evaporation rate?" },
          { key: "variable", prompt: "Did you distinguish changed, measured, and constant variables in investigations?" }
        ],
        linkVerbs: ["increases rate with higher", "decreases rate with lower", "tested by changing", "kept constant to ensure fair test"]
      },
      "The Water cycle": {
        overview: "Roles of evaporation and condensation in the water cycle, importance to life, and water conservation.",
        suggestedKeywords: [
          "water cycle", "sun as heat source", "evaporation from water bodies", "warm water vapour rises",
          "cooler surrounding air at higher altitudes", "condensation into tiny water droplets",
          "clouds", "precipitation / rain", "groundwater / rivers / seas", "continuous cycle",
          "importance of water to life processes", "water pollution", "water conservation", "limited resource"
        ],
        successCriteria: [
          "I can explain the role of evaporation in the water cycle (sun heats water bodies, water evaporates into warm water vapour).",
          "I can explain the role of condensation in the water cycle (warm water vapour rises, cools, and condenses into droplets forming clouds).",
          "I can explain that water returns to Earth's surface as precipitation (rain).",
          "I can recognise the importance of the water cycle in ensuring a continuous supply of fresh water.",
          "I can recognise the importance of water to life processes (digestion, transport, cooling, photosynthesis).",
          "I can describe the impact of water pollution and why water conservation is essential."
        ],
        hints: [
          "What role does the Sun play in driving the water cycle?",
          "Why do clouds form high up in the sky?",
          "Why is the water cycle called a continuous cycle?",
          "Why must we conserve water if the water cycle is endless?"
        ],
        checks: [
          { key: "evaporation", prompt: "Did you explain evaporation powered by heat from the Sun?" },
          { key: "condensation", prompt: "Did you explain how water vapour rises, cools, and condenses to form clouds?" },
          { key: "precipitation", prompt: "Did you include precipitation (rain) returning water to the ground?" },
          { key: "conservation", prompt: "Did you link the water cycle to water purity and conservation?" }
        ],
        linkVerbs: ["heated by Sun to evaporate into", "rises, cools and condenses into", "falls as rain to replenish", "essential for life process of"]
      }
    }
  },

  "Plant System (Transport & Gaseous Exchange)": {
    theme: "Systems",
    description: "Understand transport of food and water through plant tubes and compare gaseous exchange and transport with humans and animals.",
    concepts: {
      "Transport in plants": {
        overview: "Plant transport system: water-carrying tubes and food-carrying tubes, comparing with human circulation.",
        suggestedKeywords: [
          "plant transport system", "roots", "root hairs", "stem", "leaves",
          "water-carrying tubes (xylem)", "food-carrying tubes (phloem)",
          "transport of water and mineral salts (upwards from roots to leaves)",
          "transport of food (from leaves to all parts, upwards and downwards)",
          "bark ringing / girdling investigation", "swelling above the cut (food accumulation)",
          "celery in coloured water investigation", "comparing plant and human transport systems"
        ],
        successCriteria: [
          "I can identify the parts of the plant transport system (roots, stem, leaves) and describe their functions.",
          "I can explain that water-carrying tubes transport water and mineral salts from the roots to all parts of the plant (upwards).",
          "I can explain that food-carrying tubes transport food made in the leaves to all parts of the plant (upwards and downwards).",
          "I can describe investigations showing transport in plants (e.g. stalk in coloured dye, or removing an outer ring of stem causing food to accumulate and swell above the cut).",
          "I can compare the ways substances are transported in plants and humans (plants: tubes without a pump; humans: blood vessels with a muscular heart pump)."
        ],
        hints: [
          "What do water-carrying tubes transport, and in what direction does water travel?",
          "Where is food made in a plant, and where do food-carrying tubes deliver it?",
          "Why does removing an outer ring of bark cause the stem above the cut to swell?",
          "How does transport in plants differ from transport in humans?"
        ],
        checks: [
          { key: "water-carrying", prompt: "Did you describe water-carrying tubes transporting water and mineral salts from roots to leaves?" },
          { key: "food-carrying", prompt: "Did you describe food-carrying tubes transporting food made in leaves to all plant parts?" },
          { key: "investigation", prompt: "Did you explain evidence from plant transport investigations (swelling above cut or dyed water)?" },
          { key: "compare", prompt: "Did you compare plant tubes (no pump) with human blood vessels (heart pump)?" }
        ],
        linkVerbs: ["absorbs water for", "transports water upwards to", "transports food to all parts from", "swells due to trapped food at", "compared with human"]
      },
      "Gaseous exchange in plants": {
        overview: "Intake of oxygen and release of carbon dioxide in plants, comparing with humans and fish.",
        suggestedKeywords: [
          "gaseous exchange", "oxygen", "carbon dioxide", "leaves", "tiny openings (stomata)",
          "plants take in oxygen and give out carbon dioxide during respiration (all the time)",
          "comparing gas exchange: plants (stomata on leaves)",
          "comparing gas exchange: fish (gills)",
          "comparing gas exchange: humans (lungs / air sacs)"
        ],
        successCriteria: [
          "I can recognise that plants take in oxygen and give out carbon dioxide during respiration.",
          "I can identify that gaseous exchange in plants takes place through tiny openings (stomata) found mainly on leaves.",
          "I can compare how plants, fish, and humans take in oxygen and give out carbon dioxide:",
          "- Plants take in gases through tiny openings on leaves (stomata).",
          "- Fish take in dissolved oxygen from water through gills.",
          "- Humans take in oxygen from air through the lungs."
        ],
        hints: [
          "Where does gaseous exchange take place on a plant leaf?",
          "Do plants need oxygen to survive just like animals do?",
          "How do breathing organs differ between humans (lungs), fish (gills), and plants (stomata)?"
        ],
        checks: [
          { key: "stomata", prompt: "Did you identify tiny openings on leaves as the site of gas exchange in plants?" },
          { key: "oxygen", prompt: "Did you state that plants take in oxygen and give out carbon dioxide during respiration?" },
          { key: "fish", prompt: "Did you compare gaseous exchange organs: plants (leaf openings), fish (gills), humans (lungs)?" }
        ],
        linkVerbs: ["takes in oxygen through", "gives out carbon dioxide through", "compared with fish gills that", "compared with human lungs that"]
      }
    }
  },

  "Human System (Respiratory and Circulatory Systems)": {
    theme: "Systems",
    description: "Investigate organs of breathing and circulation, the composition of air, and how digestive, respiratory, and circulatory systems integrate to sustain life.",
    concepts: {
      "Respiratory system": {
        overview: "Parts of the human respiratory system, composition of air, and gaseous exchange.",
        suggestedKeywords: [
          "gases in air", "nitrogen", "oxygen", "carbon dioxide", "water vapour",
          "human respiratory system", "nose", "windpipe", "lungs",
          "inhaled air (higher O2, lower CO2)", "exhaled air (lower O2, higher CO2, more water vapour)",
          "gaseous exchange in lungs", "oxygen absorbed into blood", "carbon dioxide expelled from blood",
          "breathing rate increases during exercise"
        ],
        successCriteria: [
          "I can recognise that air is a mixture of gases: nitrogen, oxygen, carbon dioxide, and water vapour.",
          "I can identify the parts of the human respiratory system: nose, windpipe, and lungs, and describe their functions.",
          "I can trace the pathway of air into the lungs: nose → windpipe → lungs.",
          "I can explain that gaseous exchange takes place in the lungs, where oxygen enters the bloodstream and carbon dioxide leaves.",
          "I can compare the composition of inhaled air and exhaled air (exhaled air contains less oxygen, more carbon dioxide, and more water vapour).",
          "I can explain why breathing rate increases during exercise (muscles need more energy, requiring more oxygen and faster removal of carbon dioxide)."
        ],
        hints: [
          "What are the main gases that make up air?",
          "What path does air take from the moment you breathe in through your nose?",
          "What happens between the air and the blood inside the lungs?",
          "How does exhaled air differ from the air around you?"
        ],
        checks: [
          { key: "gases", prompt: "Did you state that air contains nitrogen, oxygen, carbon dioxide, and water vapour?" },
          { key: "nose", prompt: "Did you identify the nose, windpipe, and lungs and their roles?" },
          { key: "gaseous exchange", prompt: "Did you explain gaseous exchange (oxygen enters blood, carbon dioxide leaves)?" },
          { key: "inhaled", prompt: "Did you contrast the composition of inhaled vs exhaled air?" }
        ],
        linkVerbs: ["breathes in air through", "flows down windpipe to", "exchanges gases with blood in", "expels carbon dioxide from"]
      },
      "Circulatory system": {
        overview: "The heart, blood, and blood vessels, and the substances transported throughout the human body.",
        suggestedKeywords: [
          "human circulatory system", "heart (muscular pump)", "blood", "blood vessels",
          "circulates blood", "transports oxygen", "transports digested food", "transports water",
          "removes carbon dioxide", "removes waste materials", "oxygen-rich blood",
          "oxygen-poor blood", "heart rate increases during exercise", "body cells"
        ],
        successCriteria: [
          "I can identify the parts of the human circulatory system: heart, blood, and blood vessels, and describe their functions.",
          "I can explain that the heart acts as a muscular pump to circulate blood continuously to all parts of the body.",
          "I can identify the substances transported by blood: oxygen, digested food, water, carbon dioxide, and waste materials.",
          "I can trace the flow of blood: oxygen-poor blood is pumped to lungs for oxygen, and oxygen-rich blood is pumped to all body cells.",
          "I can explain why heart rate increases during exercise (to pump oxygen and digested food faster to active muscles)."
        ],
        hints: [
          "What is the main pumping organ of the circulatory system?",
          "What five substances does blood transport throughout the body?",
          "Where does blood pick up oxygen, and where does it pick up digested food?",
          "Why does your pulse rate increase when you are exercising?"
        ],
        checks: [
          { key: "heart", prompt: "Did you identify the heart as a muscular pump circulating blood?" },
          { key: "blood", prompt: "Did you list what blood transports (oxygen, digested food, carbon dioxide, wastes)?" },
          { key: "vessels", prompt: "Did you include blood vessels carrying blood to and from body cells?" },
          { key: "exercise", prompt: "Did you explain why heart rate increases during physical activity?" }
        ],
        linkVerbs: ["pumps blood through", "transports oxygen and digested food to", "picks up carbon dioxide from", "returns blood to heart from"]
      },
      "Integration of human systems": {
        overview: "How digestive, respiratory, and circulatory systems work together to sustain life and release energy.",
        suggestedKeywords: [
          "integration of body systems", "digestive system (breaks down food into simple nutrients)",
          "respiratory system (takes in oxygen, removes carbon dioxide)",
          "circulatory system (transports nutrients and oxygen to body cells)",
          "body cells / muscle cells", "release energy", "exercise response",
          "breathing rate and heart rate increase together"
        ],
        successCriteria: [
          "I can recognise the integration of different human systems (digestive, respiratory, circulatory) in carrying out life processes.",
          "I can explain how the digestive and circulatory systems work together (small intestine absorbs digested food into blood to be transported to all body parts).",
          "I can explain how the respiratory and circulatory systems work together (lungs take in oxygen into blood, which delivers it to cells and removes carbon dioxide).",
          "I can explain that body cells use oxygen and digested food to release energy for life processes.",
          "I can explain why breathing rate and heart rate both increase during physical exercise."
        ],
        hints: [
          "How do digested food from the gut and oxygen from the lungs reach your leg muscles?",
          "What do body cells produce when oxygen and digested food combine?",
          "Why do your lungs and heart coordinate their rates during a race?"
        ],
        checks: [
          { key: "digestive", prompt: "Did you link digested food absorption into the circulatory system?" },
          { key: "respiratory", prompt: "Did you link oxygen from the respiratory system into the circulatory system?" },
          { key: "energy", prompt: "Did you explain that cells combine oxygen and food to release energy?" },
          { key: "exercise", prompt: "Did you explain how breathing rate and heart rate rise together during exercise?" }
        ],
        linkVerbs: ["supplies digested food to", "supplies oxygen to", "transports nutrients to body cells for", "releases energy with", "speeds up during exercise with"]
      }
    }
  },

  "Electrical System": {
    theme: "Systems",
    description: "Circuit components forming an electrical system, closed circuits, conductors and insulators, series vs parallel circuits, and fair test investigations.",
    concepts: {
      "Simple circuits & components": {
        overview: "Electric circuit as a system: energy source (battery), wires, bulb, and switch; closed vs open circuits.",
        suggestedKeywords: [
          "electrical system", "electric circuit", "energy source (battery / dry cell)",
          "positive terminal", "negative terminal", "circuit components", "connecting wires",
          "bulb (filament, metal casing, metal tip)", "switch (open / closed)",
          "closed circuit (complete, current flows, bulb lights)",
          "open circuit (incomplete, gap, current does not flow, bulb does not light)",
          "circuit diagrams", "circuit symbols"
        ],
        successCriteria: [
          "I can recognise that an electric circuit consisting of an energy source (battery) and other circuit components (wire, bulb, switch) forms an electrical system.",
          "I can show an understanding that a closed (complete) circuit allows electric current to flow, causing the bulb to light up.",
          "I can explain that an open circuit (gap, open switch, loose wire, or fused bulb) prevents electric current from flowing.",
          "I can identify the two connection points on a light bulb (metal casing and metal tip) that must be connected.",
          "I can construct simple circuits from circuit diagrams using standard science symbols."
        ],
        hints: [
          "What essential components make up an electrical system?",
          "What is the difference between a closed circuit and an open circuit?",
          "Where are the two contact points on a light bulb?",
          "What happens to current flow when a switch is opened?"
        ],
        checks: [
          { key: "battery", prompt: "Did you identify the battery as the energy source of the circuit system?" },
          { key: "closed circuit", prompt: "Did you explain that a closed circuit allows electric current to flow?" },
          { key: "open circuit", prompt: "Did you explain that an open circuit prevents current from flowing?" },
          { key: "diagram", prompt: "Did you mention circuit symbols and circuit diagrams?" }
        ],
        linkVerbs: ["provides energy to", "allows current to flow in", "breaks circuit when open in", "lights up when closed in", "represented by symbol"]
      },
      "Conductors and insulators": {
        overview: "Materials that allow electric current to flow versus materials that do not, and electrical safety.",
        suggestedKeywords: [
          "electrical conductors", "allow electric current to flow", "metals (copper, iron, aluminium, steel)",
          "graphite / pencil lead", "electrical insulators", "do not allow current to flow",
          "plastics", "rubber", "glass", "wood", "circuit tester",
          "proper handling of electricity", "electrical safety", "prevent electric shocks", "conservation of electricity"
        ],
        successCriteria: [
          "I can identify electrical conductors as materials that allow electric current to flow through them.",
          "I can identify electrical insulators as materials that do not allow electric current to flow through them.",
          "I can classify everyday materials into electrical conductors (metals, graphite) and insulators (plastics, rubber, glass, wood).",
          "I can describe how to test materials using a circuit tester.",
          "I can explain the proper use, safety, and handling of electricity (e.g. plastic coating prevents electric shocks).",
          "I can show concern for the need to conserve electricity in daily life."
        ],
        hints: [
          "What makes a material a good electrical conductor versus an insulator?",
          "Why are electrical wires made of copper on the inside and plastic on the outside?",
          "How can you use a tester circuit to identify whether an object is a conductor?"
        ],
        checks: [
          { key: "conductor", prompt: "Did you define and give examples of electrical conductors (metals, graphite)?" },
          { key: "insulator", prompt: "Did you define and give examples of electrical insulators (plastic, rubber, glass)?" },
          { key: "safety", prompt: "Did you link electrical insulators to proper safety and preventing shocks?" },
          { key: "conserve", prompt: "Did you mention proper handling and conservation of electricity?" }
        ],
        linkVerbs: ["allows electric current to flow through", "blocks current flow as", "used to test materials in", "coats wires to prevent shock with"]
      },
      "Series and parallel circuits": {
        overview: "Investigating variables affecting current: batteries in series, bulbs in series, bulbs in parallel, and pathways.",
        suggestedKeywords: [
          "series circuit (single pathway)", "parallel circuit (multiple pathways / branches)",
          "bulb brightness", "adding batteries in series (increases current and brightness)",
          "adding bulbs in series (decreases current and brightness)",
          "adding bulbs in parallel (brightness remains the same)",
          "bulb fuses in series (circuit opens, all bulbs go out)",
          "bulb fuses in parallel (other branches remain closed, bulbs stay lit)",
          "investigating variables on current", "fair test"
        ],
        successCriteria: [
          "I can investigate the effect of the number of batteries arranged in series on circuit current (more batteries in series increase current and bulb brightness).",
          "I can investigate the effect of the number of bulbs arranged in series on circuit current (more bulbs in series share current and become dimmer).",
          "I can investigate the effect of the number of bulbs arranged in parallel on circuit current (bulbs in parallel remain equally bright).",
          "I can distinguish between series circuits (one pathway) and parallel circuits (more than one pathway).",
          "I can predict and explain what happens when one bulb fuses in a series circuit (all bulbs go out) versus in a parallel circuit (bulbs in other branches stay lit)."
        ],
        hints: [
          "How many pathways for current flow exist in a series circuit compared to a parallel circuit?",
          "What happens to bulb brightness when you add more batteries in series?",
          "What happens to bulb brightness when you add more bulbs in series versus in parallel?",
          "If one bulb fuses in a parallel circuit, why do the other bulbs stay lit?"
        ],
        checks: [
          { key: "battery", prompt: "Did you explain that adding batteries in series increases current and brightness?" },
          { key: "series bulb", prompt: "Did you explain that adding bulbs in series decreases bulb brightness?" },
          { key: "parallel", prompt: "Did you explain that bulbs in parallel maintain brightness and independent pathways?" },
          { key: "fuse", prompt: "Did you compare what happens when a bulb fuses in series vs parallel?" }
        ],
        linkVerbs: ["has single pathway in", "has multiple branches in", "increases brightness when adding batteries in", "maintains equal brightness in parallel", "keeps other bulbs lit when fused in"]
      }
    }
  }
};
