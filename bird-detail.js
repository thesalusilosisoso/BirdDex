let currentBirdId = null;
const MAX_BIRD = 125;
let audio = null;
let isPlaying = false;
let selectedType = null;


/* =========================
   INTRO
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro-screen");

  const hasSeenIntro = localStorage.getItem("seenIntro");

  if (hasSeenIntro) {
    intro.classList.add("hidden");
  }
});


/* =========================
   PAGE LOAD
========================= */

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    const birdID = params.get("id");
    const id = parseInt(birdID, 10);

    // ✅ NEW
    selectedType = params.get("type");

    if (!id || id < 1 || id > MAX_BIRD) {
        window.location.href = "./index.html";
        return;
    }

    currentBirdId = id;
    loadBird(id);

    /* =========================
       RESET BUTTON
    ========================= */

    const homeBtn = document.querySelector("#homeBtn");

    homeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "./index.html";
    });
});


/* =========================
   LOAD BIRD
========================= */

async function loadBird(id) {
    try {
        const response = await fetch("birdsdata.json");
        const data = await response.json();

        let filteredData = data;

        if (selectedType) {
            filteredData = data.filter(b => {
                const types = Array.isArray(b.type) ? b.type : [b.type];
                return types.includes(selectedType);
            });
        }

        const bird = filteredData.find(b => b.id === id);
        if (!bird) return;

        displayBirdDetails(bird);
        setupNavigation(filteredData, id);

    } catch (error) {
        console.error("Error loading bird:", error);
    }
}

/* =========================
   COLOR HELPERS
========================= */

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;

  return "#" + (
    0x1000000 +
    (R<255?R<0?0:R:255)*0x10000 +
    (G<255?G<0?0:G:255)*0x100 +
    (B<255?B<0?0:B:255)
  ).toString(16).slice(1);
}

function pastelColor(hex, percent) {
  const num = parseInt(hex.replace("#",""),16);

  let R = num >> 16;
  let G = (num >> 8) & 0x00FF;
  let B = num & 0x0000FF;

  R = Math.round(R + (255 - R) * (percent / 100));
  G = Math.round(G + (255 - G) * (percent / 100));
  B = Math.round(B + (255 - B) * (percent / 100));

  return "#" + (
    0x1000000 +
    R * 0x10000 +
    G * 0x100 +
    B
  ).toString(16).slice(1);
}

/* =========================
   DISPLAY DETAILS
========================= */

function displayBirdDetails(bird) {
  const { id, name, weight, wingspan, ability, stats } = bird;

  const formattedName = capitalizeName(name);

  document.title = formattedName;

  const nameWrap = document.querySelector(".name-wrap");
  nameWrap.innerHTML = `
    <h1 class="name">${formattedName}</h1>
    <p class="scientific-name">${bird.scientific_name || ""}</p>
  `;

  document.querySelector(".birds-id-wrap .body2-fonts").textContent =
    `#${String(id).padStart(3, "0")}`;

  /* IMAGE */
  const imageElement = document.querySelector(".detail-img-wrapper img");
  imageElement.src = `./icons/${id}.png`;
  imageElement.alt = formattedName;

  /* WEIGHT + WINGSPAN */
  document.querySelector(".weight").textContent = weight;
  document.querySelector(".height").textContent = wingspan;

  /* DESCRIPTION */
  document.querySelector(".birds-description").textContent = bird.desc;

  /* TYPES */
  const typeWrapper = document.querySelector(".power-wrapper");
  typeWrapper.innerHTML = "";

  const rawType = bird.type;
  const types = Array.isArray(rawType) ? rawType : [rawType];

  types.forEach(type => {
    const el = document.createElement("p");
    el.className = `body3-fonts type ${type.toLowerCase()}`;
    el.textContent = type;

    el.style.cursor = "pointer";

    el.addEventListener("click", () => {
  const encodedType = encodeURIComponent(type);
  window.location.href = `./index.html?type=${encodedType}`;
});

    typeWrapper.appendChild(el);
  });

  /* =========================
     APPLY TYPE CLASS TO PAGE
  ========================= */

  const mainType = types[0].toLowerCase();
  const main = document.querySelector(".detail-main");

  main.classList.forEach(cls => {
    if (cls !== "detail-main" && cls !== "main") {
      main.classList.remove(cls);
    }
  });

  main.classList.add("type", mainType);

  /* =========================
     SOUND BUTTON
  ========================= */

  const soundBtn = document.querySelector(".sound-btn");

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    soundBtn.classList.remove("active");
  }

  audio = new Audio(bird.cry);
  audio.volume = 0.7;

  soundBtn.onclick = () => {
    if (!isPlaying) {
      audio.currentTime = 0;
      audio.play();
      soundBtn.classList.add("active");
      isPlaying = true;
    } else {
      audio.pause();
      audio.currentTime = 0;
      soundBtn.classList.remove("active");
      isPlaying = false;
    }
  };

  audio.onended = () => {
    soundBtn.classList.remove("active");
    isPlaying = false;
  };

  /* TYPE COLOR */
  const mainColor = typeColors[mainType];

  if (mainColor) {
    const lightColor = pastelColor(mainColor, 40);

    document.documentElement.style.setProperty("--type-color", mainColor);
    document.documentElement.style.setProperty("--type-color-dark", lightColor);
  }

  /* SOUND HUE */

  const hueMap = {
    songbird: 210,
    "bird-of-paradise": 60,
    parrot: 140,
    raptor: 20,
    waterfowl: 200,
    wader: 180,
    seabird: 230,
    ground: 30,
    flightless: 260,
    tropical: 330,
    forest: 110,
    corvid: 260,
    domestic: 280,
    urban: 0,
    columbid: 300,
    nectarbird: 40,
    extinct: 340,
    generalist: 160
  };

  const hue = hueMap[mainType] ?? 0;
  soundBtn.style.setProperty("--sound-hue", `${hue}deg`);

  /* ABILITY */
  const abilityContainer = document.querySelector(".birds-detail.ability");
  abilityContainer.innerHTML = "";

  const abilityText = document.createElement("p");
  abilityText.className = "body3-fonts";
  abilityText.textContent = ability;
  abilityContainer.appendChild(abilityText);

  /* STATS */
  const statsWrapper = document.querySelector(".stats-wrapper");
  statsWrapper.innerHTML = "";

  const statsNameMapping = {
    speed: "SPEED",
    agility: "AGILITY",
    song: "SONG",
    endurance: "ENDUR",
    adaptability: "ADAPT"
  };

  Object.entries(stats).forEach(([key, value]) => {
    const statDiv = document.createElement("div");
    statDiv.className = "stats-wrap";

    const statLabel = document.createElement("p");
    statLabel.className = "body3-fonts stats";
    statLabel.textContent = statsNameMapping[key] || key;

    const statValue = document.createElement("p");
    statValue.className = "body3-fonts";
    statValue.textContent = String(value).padStart(3, "0");

    const progress = document.createElement("progress");
    progress.className = "progress-bar";
    progress.value = value;
    progress.max = 100;

    statDiv.appendChild(statLabel);
    statDiv.appendChild(statValue);
    statDiv.appendChild(progress);

    statsWrapper.appendChild(statDiv);
  });

  setTypeBackgroundColor(types[0]);
}

/* =========================
   NAVIGATION
========================= */

function setupNavigation(filteredData, id) {
    const leftArrow = document.querySelector("#leftArrow");
    const rightArrow = document.querySelector("#rightArrow");

    leftArrow.onclick = null;
    rightArrow.onclick = null;

    const currentIndex = filteredData.findIndex(b => b.id === id);

    if (currentIndex === -1) return;

    if (currentIndex > 0) {
        leftArrow.onclick = (e) => {
            e.preventDefault();
            const prevBird = filteredData[currentIndex - 1];
            navigateBird(prevBird.id);
        };
    }

    if (currentIndex < filteredData.length - 1) {
        rightArrow.onclick = (e) => {
            e.preventDefault();
            const nextBird = filteredData[currentIndex + 1];
            navigateBird(nextBird.id);
        };
    }
}

function navigateBird(id) {
    const url = selectedType
        ? `./detail.html?id=${id}&type=${selectedType}`
        : `./detail.html?id=${id}`;

    window.location.href = url; 
}

/* =========================
   TYPE COLORS
========================= */

const typeColors = {
    songbird: "#6FA8DC",
    "bird-of-paradise": "#ddd563",
    parrot: "#518d6f",
    raptor: "#E07A5F",
    waterfowl: "#4F8FBF",
    wader: "#9ED9D2",
    seabird: "#5C7AEA",
    ground: "#8C6D5A",
    flightless: "#7C84A6",
    tropical: "#E5739A",
    forest: "#5C8D63",
    corvid: "#4B4E6D",
    domestic: "#B284E6",
    urban: "#9A9A9A",
    columbid: "#B57FB3",
    nectarbird: "#F4A261",
    extinct: "#9C5C6B",
    generalist: "#48BFA3"
};

function setTypeBackgroundColor(mainType) {
    const color = typeColors[mainType.toLowerCase()];
    if (!color) return;

    const detailMain = document.querySelector(".detail-main");
    detailMain.style.backgroundColor = color;
}

/* =========================
   UTIL
========================= */

function capitalizeName(string) {
    return string
        .toLowerCase()
        .split(" ")
        .map(word =>
            word
                .split("-")
                .map(part =>
                    part.charAt(0).toUpperCase() + part.slice(1)
                )
                .join("-")
        )
        .join(" ");
}