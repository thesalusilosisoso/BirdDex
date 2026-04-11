
localStorage.removeItem("seenIntro");


const MAX_BIRD = 125;

const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const introScreen = document.querySelector("#intro-screen")

document.addEventListener("DOMContentLoaded", () => {

  if(localStorage.getItem("seenIntro") == "true") {
    introScreen.style.display = "none" 
}});

  const startBtn = document.querySelector("#start-btn");
  const helpBtn  = document.querySelector("#help-btn");
  const infoBtn  = document.querySelector("#info-btn");
  const infoText = document.querySelector("#info-text");
  const helpText = document.querySelector("#help-text");
  const helpBtn2 = document.getElementById("help-toggle");
  const overlay = document.getElementById("help-overlay")

const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const typeFilter = document.querySelector("#type");
const typeSelect = document.querySelector("#type-select");

const notFoundMessage = document.querySelector("#not-found-message");
const closeButton = document.querySelector(".search-close-icon");

let allBirds = []; // ✅ FIXED (was undeclared before)


  if (startBtn) {
  startBtn.addEventListener("click", () => {
    const content = document.querySelector(".intro-content");

    // play exit animation
    content.classList.add("intro-exit");
    introScreen.classList.add("fade-out");

    localStorage.setItem("seenIntro", "true");

    // wait, then hide screen
    setTimeout(() => {
      introScreen.style.display = "none";
    }, 600);
  });
}

helpBtn.addEventListener("click", () => {
  const isOpen = !helpText.classList.contains("hidden");

  // close everything first
  helpText.classList.add("hidden");
  infoText.classList.add("hidden");

  // reopen ONLY if it wasn’t already open
  if (!isOpen) {
    helpText.classList.remove("hidden");
  }
});

infoBtn.addEventListener("click", () => {
  const isOpen = !infoText.classList.contains("hidden");

  // close everything first
  helpText.classList.add("hidden");
  infoText.classList.add("hidden");

  // reopen ONLY if it wasn’t already open
  if (!isOpen) {
    infoText.classList.remove("hidden");
  }
});



// ===============================
// FETCH DATA
// ===============================
fetch("birdsdata.json")
  .then(response => response.json())
  .then(data => {
  allBirds = data;

  const params = new URLSearchParams(window.location.search);
  const typeFromURL = params.get("type");

  if (typeFromURL) {
    applyTypeFromURL(typeFromURL);
  } else {
    displayBirds(allBirds);
  }
});

function applyTypeFromURL(typeValue) {
  const selectedType = typeValue.toLowerCase();

  // check the Type radio
  if (typeFilter) typeFilter.checked = true;

  // set dropdown if it exists
  if (typeSelect) typeSelect.value = selectedType;

  const filteredBirds = allBirds.filter((bird) => {
    if (Array.isArray(bird.type)) {
      return bird.type.some(t =>
        t.toLowerCase() === selectedType
      );
    } else {
      return bird.type.toLowerCase() === selectedType;
    }
  });

  displayBirds(filteredBirds);

  notFoundMessage.style.display =
    filteredBirds.length === 0 ? "block" : "none";
}


// ===============================
// DISPLAY BIRDS
// ===============================
function displayBirds(birds) {
  listWrapper.innerHTML = "";

  birds.forEach((bird) => {
    const listItem = document.createElement("div");
    listItem.className = "list-item";

    listItem.innerHTML = `
      <div class="number-wrap">
        <p class="caption-home">#${bird.id}</p>
      </div>

      <div class="img-wrap">
        <img src="./icons/${bird.id}.png" 
             alt="${bird.name}" 
             width="210" 
             height="210"/>
      </div>

      <div class="name-wrap">
        <p class="name-home">${bird.name}</p>
      </div>
    `;

    listItem.addEventListener("click", async () => {
      const success = await fetchBirdDataBeforeRedirect(bird.id);
      if (success) {
        window.location.href = `./detail.html?id=${bird.id}`;
      }
    });

    listWrapper.appendChild(listItem);
  });
}


// ===============================
// SEARCH + FILTER LOGIC
// ===============================
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  let filteredBirds = [...allBirds];

const helpToggle = document.querySelector("#help-toggle");
const helpOverlay = document.querySelector("#help-overlay");

helpToggle.addEventListener("click", () => {
  helpOverlay.classList.remove("hidden");
});

helpOverlay.addEventListener("click", (e) => {
  if (e.target === helpOverlay) {
    helpOverlay.classList.add("hidden");
  }
});

// OPEN
helpBtn2.addEventListener("click", () => {
  overlay.classList.add("active");
});

// CLOSE when clicking outside box
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.remove("active");
  }
});

  // =========================
  // FILTERING
  // =========================

  // NUMBER filter (search)
  if (numberFilter.checked && searchTerm !== "") {
    filteredBirds = filteredBirds.filter(bird =>
      bird.id.toString().startsWith(searchTerm)
    );
  }

  // NAME filter (search)
  if (nameFilter.checked && searchTerm !== "") {
    filteredBirds = filteredBirds.filter(bird =>
      bird.name.toLowerCase().includes(searchTerm)
    );
  }

  // TYPE filter (checkbox now!)
  if (typeFilter.checked && typeSelect.value !== "") {
    const selectedType = typeSelect.value.toLowerCase();

    filteredBirds = filteredBirds.filter(bird => {
      const types = Array.isArray(bird.type) ? bird.type : [bird.type];
      return types.some(t => t.toLowerCase() === selectedType);
    });
  }

  // =========================
  // SORTING
  // =========================

  // Default → NUMBER
  if (numberFilter.checked) {
    filteredBirds.sort((a, b) => a.id - b.id);
  }

  // If NAME selected → alphabetical
  if (nameFilter.checked) {
    filteredBirds.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  // fallback (if nothing selected)
  if (!numberFilter.checked && !nameFilter.checked) {
    filteredBirds.sort((a, b) => a.id - b.id);
  }

  // =========================
  // DISPLAY
  // =========================

  displayBirds(filteredBirds);

  notFoundMessage.style.display =
    filteredBirds.length === 0 ? "block" : "none";
}


// ===============================
// CLEAR SEARCH
// ===============================
function clearSearch() {
  searchInput.value = "";
  displayBirds(allBirds);
  notFoundMessage.style.display = "none";
}


// ===============================
// EVENTS
// ===============================
searchInput.addEventListener("keyup", handleSearch);
closeButton.addEventListener("click", clearSearch);

// Make filters react immediately
numberFilter.addEventListener("change", handleSearch);
nameFilter.addEventListener("change", handleSearch);
typeFilter.addEventListener("change", handleSearch);
typeSelect.addEventListener("change", handleSearch);


// ===============================
// REDIRECT HELPER
// ===============================
async function fetchBirdDataBeforeRedirect(id) {
  try {
    const response = await fetch("birdsdata.json");
    const data = await response.json();
    const bird = data.find(b => b.id == id);

    if (!bird) return false;

    localStorage.setItem("selectedBird", JSON.stringify(bird));
    return true;

  } catch (error) {
    console.error("Failed to search bird data before redirect");
    return false;
  }
}

const homeLogo = document.querySelector("intro-logo");

homeLogo.addEventListener("click", () => {
  searchInput.value = "";

  nameFilter.checked = true;
  numberFilter.checked = false;
  typeFilter.checked = false;

  if (typeSelect) {
    typeSelect.value = "";
  }

  window.history.pushState({}, "", "index.html");
  displayBirds(allBirds);
  notFoundMessage.style.display = "none";
});