// const { stringify } = require("querystring");

document.addEventListener("DOMContentLoaded", function () {
  const EXPONENTIALINCREASE = 1.2;
  const STORAGE_KEYS = {
    count: "boeken",
    clickworth: "clickworth",
    username: "username",
  };

  let bookiespersecond = 0;

  let upgrades = [
    { name: "Jordan", price: 10, bookiesPerSeconde: 1, count: 0 },
    { name: "Pepijn", price: 50, bookiesPerSeconde: 2, count: 0 },
    { name: "Wouter", price: 150, bookiesPerSeconde: 3, count: 0 },
    { name: "Dennis", price: 300, bookiesPerSeconde: 4, count: 0 },
    { name: "Ilse", price: 550, bookiesPerSeconde: 5, count: 0 },
    { name: "Amy", price: 666, bookiesPerSeconde: 6, count: 0 },
    { name: "InDesign", price: 20000, bookiesPerSeconde: 20, count: 0 },
    { name: "Perfectbook", price: 40000, bookiesPerSeconde: 20, count: 0 },
    { name: "Fotocamera", price: 100000, bookiesPerSeconde: 20, count: 0 },
    { name: "DJ", price: 200000, bookiesPerSeconde: 20, count: 0 },
    { name: "Commistiehok", price: 500000, bookiesPerSeconde: 20, count: 0 },
    { name: "Ewi", price: 1000000, bookiesPerSeconde: 20, count: 0 },
    { name: "Tondeuse", price: 1500000, bookiesPerSeconde: 20, count: 0 },
    { name: "JaBo hekje", price: 2000000, bookiesPerSeconde: 20, count: 0 },
    { name: "153 hektometer paal", price: 2500000, bookiesPerSeconde: 20, count: 0 },
    { name: "Schotel", price: 5000000, bookiesPerSeconde: 20, count: 0 }
  ];

  let boosts = [
    { name: "Kikker", price: 660, clickfactor: 1.2, count: 0 },
    { name: "ETVis", price: 3000, clickfactor: 1.5, count: 0 },
    { name: "Capybara", price: 20000, clickfactor: 3, count: 0 },
    { name: "Schotse Hooglander", price: 140000, clickfactor: 6.6, count: 0 }
  ]

  let count = getFromStorage(STORAGE_KEYS.count, 0);
  let clickworth = getFromStorage(STORAGE_KEYS.clickworth, 1);
  let savedUsername = localStorage.getItem(STORAGE_KEYS.username) || "Gast";

  function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID(); 
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }
  function getFromStorage(key, defaultValue) {
    const val = localStorage.getItem(key);
    return val ? parseFloat(val) : defaultValue;
  }
  function setUsernameDisplay(name){
    document.getElementById("displayUsername").textContent = name;
  }
  function loadCounts(items, keyPrefix) {
    items.forEach((item, index) => {
      item.count = parseInt(localStorage.getItem(`${keyPrefix}_${index}`)) || 0;
    });
  }
  function updateCountDisplay() {
    document.getElementById("count").innerText = `${count.toFixed(0)} Bookies/s ${bookiespersecond}`;
  }
  function handleSetUsername(){
    let username = prompt("Vul hier je gebruikersnaam in:") || "Gast";
    savedUsername = username;
    setUsernameDisplay(username);
    localStorage.setItem(STORAGE_KEYS.username, username);
  }
  function handleClick(){
    showClickEffect();
    count += clickworth;
    updateCountDisplay(count);
    localStorage.setItem(STORAGE_KEYS.count, count);
  }
  function toggleShop(){
    const shop = document.getElementById('shop');
    shop.classList.toggle('expanded');
  }
  function showClickEffect() {
    const container = document.getElementById("falling-books-container");
    new FadingText(clickworth, document.getElementById("clicker"));
    new FallingBook(container);

  }

  function updateUI(items, containerId, buyHandler, keyPrefix) {
    let container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear before re-rendering

    items.forEach((item, index) => {
      const thirdValue = Object.keys(item)[2];


      let text = "";
      if (thirdValue === "clickfactor") {
        text = `(${item.clickfactor} Klikfactor)`;
      } else if (thirdValue === "bookiesPerSeconde") {
        text = `(${item.bookiesPerSeconde} Bookies/s)`;
      }

      const price = calculatePrice(item.price, item.count);
      let btn = document.createElement("button");
      btn.className = keyPrefix;
      btn.innerText = `${item.name} ${text} - ${price} boeken. Gekocht: ${item.count}`;
      btn.onclick = (event) => {      /*this prevents top scrolling*/
        event.preventDefault();
        buyHandler(index);
      };
      container.appendChild(btn);
    });
  }

  function calculatePrice(basePrice, count) {
    return Math.floor(basePrice * Math.pow(EXPONENTIALINCREASE, count));
  }
  function buyItem(items, index, keyPrefix, updateUIFunc, boostCallback) {
    const item = items[index];
    const price = calculatePrice(item.price, item.count);

    if (count >= price) {
      count -= price;
      item.count++;
      localStorage.setItem(STORAGE_KEYS.count, count);
      localStorage.setItem(`${keyPrefix}_${index}`, item.count);
      updateCountDisplay();
      updateUIFunc();
      if (boostCallback) boostCallback(item);
    }
  }
  function applyBoost(boost) {
    clickworth *= boost.clickfactor; // Increase click value based on boost effect
    localStorage.setItem(STORAGE_KEYS.clickworth, clickworth);
  }
  function getbookiesPerSeconde() {
    let initialcount = count;
    upgrades.forEach(upgrade => {
      count += upgrade.count * upgrade.bookiesPerSeconde;
    });
    bookiespersecond = count - initialcount;
  }
  function autoClick() {
    getbookiesPerSeconde();
    updateCountDisplay();
    localStorage.setItem(STORAGE_KEYS.count, count);
  }

  const updateUpgradesUI = () => updateUI(upgrades, "upgradesContainer", buyUpgrade, "upgrade");
  const updateBoostUI = () => updateUI(boosts, "boostsContainer", buyBoost, "boost");

  // Buy handlers
  const buyUpgrade = (index) => buyItem(upgrades, index, "upgrade", updateUpgradesUI);
  const buyBoost = (index) => buyItem(boosts, index, "boost", updateBoostUI, applyBoost);

  async function submitHighscore(username, score) {
    const device_id = getDeviceId();
    score = Number(score);
        
    try {
      const response = await fetch('http://localhost:3000/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score, device_id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit score');
      }

      const result = await response.json();
      console.log('Score submitted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error submitting highscore:', error);
    }
  }

    //initialization
  setUsernameDisplay(savedUsername);
  loadCounts(boosts, "boost");
  loadCounts(upgrades, "upgrade");
  updateCountDisplay();
  updateUpgradesUI();
  updateBoostUI();

  document.getElementById("setUsernameButton").addEventListener("click", handleSetUsername);
  document.getElementById("clicker").addEventListener("click", handleClick);
  document.getElementById('shopToggleBtn').addEventListener('click', toggleShop);
  document.getElementById("highscores").addEventListener("click", function () {
    submitHighscore(savedUsername, count);
  });
  
  setInterval(autoClick, 1000);


});

function toggleHelp() {
  const overlay = document.getElementById("helpOverlay");
  overlay.style.display = overlay.style.display === "block" ? "none" : "block";
}

async function toggleHighscores() {
  const overlay = document.getElementById('highscoreOverlay');
  const list = document.getElementById('highscoreList');

  if (overlay.style.display === 'none' || overlay.style.display === '') {
    // Show overlay
    overlay.style.display = 'block';

    // Clear old list items
    list.innerHTML = 'Loading...';

    try {
      const response = await fetch('http://localhost:3000/highscores');
      if (!response.ok) throw new Error('Failed to fetch highscores');

      const highscores = await response.json();

      if (highscores.length === 0) {
        list.innerHTML = '<li>Er zijn nog geen scores geplaatst.</li>';
      } else {
        list.innerHTML = highscores.map((entry, i) =>
          `<li>${i + 1}. ${entry.username} — ${entry.score}</li>`
        ).join('');
      }
    } catch (error) {
      list.innerHTML = `<li>Error loading highscores: ${error.message}</li>`;
    }
  } else {
    // Hide overlay
    overlay.style.display = 'none';
  }
}

class FallingBook {
  constructor(container) {
    this.container = container;
    this.book = document.createElement("div");
    this.book.className = "book";

    // Starting position
    this.x = Math.random() * window.innerWidth;
    this.y = -80; // Above screen

    // Speed
    this.speedY = 2 + Math.random() * 3;
    this.speedX = -1 + Math.random() * 2;

    this.updatePosition();
    container.appendChild(this.book);

    this.fallInterval = setInterval(() => this.fall(), 16); 
  }

  updatePosition() {
    this.book.style.left = `${this.x}px`;
    this.book.style.top = `${this.y}px`;
  }

  fall() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.updatePosition();

    // Remove if out of view
    if (this.y > window.innerHeight || this.x < -100 || this.x > window.innerWidth + 100) {
      this.destroy();
    }
  }

  destroy() {
    clearInterval(this.fallInterval);
    this.book.remove();
  }
}

class FadingText {
  constructor(clickworth, imageElement) {
    this.text = "+" + clickworth.toFixed(0);
    this.image = imageElement;
    this.createElement();
    this.setPosition();
    this.fadeAndRemove();
  }

  createElement() {
    this.el = document.createElement("div");
    this.el.innerText = this.text;
    this.el.style.position = "absolute";
    this.el.style.opacity = "1";
    this.el.style.display = "inline";
    this.el.style.transition = "opacity 0.5s ease";
    this.el.style.pointerEvents = "none";
    this.el.style.color = "#000"; // Customize as needed
    this.el.style.fontSize = "24px";  // or any size you want
    document.body.appendChild(this.el);
  }

  setPosition() {
    const rect = this.image.getBoundingClientRect();
    const offsetX = Math.random() * this.image.offsetWidth;
    const offsetY = Math.random() * this.image.offsetHeight;

    // Position relative to viewport
    const x = rect.left + offsetX;
    const y = rect.top + offsetY;

    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
  }

  fadeAndRemove() {
    setTimeout(() => {
      this.el.style.opacity = "0";
    }, 300);

    setTimeout(() => {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    }, 2000);
  }
}