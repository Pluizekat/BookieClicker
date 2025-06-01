// const { stringify } = require("querystring");

document.addEventListener("DOMContentLoaded", function () {
  const EXPONENTIALINCREASE = 1.2;
  const STORAGE_KEYS = {
    count: "boeken",
    clickworth: "clickworth",
    username: "username",
  };

  let bps = 0;

  names = [
      " ",
      "duizend",       
      "miljoen",       
      "miljard",       
      "biljoen",       
      "biljard",       
      "triljoen",      
      "triljard",      
      "quadriljoen",   
      "quadriljard",   
      "quintiljoen",   
      "quintiljard",   
      "sextiljoen",    
      "sextiljard",    
      "septiljoen",    
      "septiljard",    
      "octiljoen",     
      "octiljard",     
      "noniljoen",     
      "noniljard",     
      "deciljoen",     
      "deciljard"      
  ]

  let upgrades = [
    { name: "Jordan", price: 10, bookiesPerSeconde: 1, count: 0 },
    { name: "Pepijn", price: 50, bookiesPerSeconde: 3, count: 0 },
    { name: "Wouter", price: 150, bookiesPerSeconde: 7, count: 0 },
    { name: "Dennis", price: 300, bookiesPerSeconde: 12, count: 0 },
    { name: "Ilse", price: 600, bookiesPerSeconde: 20, count: 0 },
    { name: "Amy", price: 1200, bookiesPerSeconde: 30, count: 0 },
    { name: "InDesign", price: 5000, bookiesPerSeconde: 70, count: 0 },
    { name: "De schijf", price: 10000, bookiesPerSeconde: 120, count: 0 },
    { name: "Perfectbook", price: 25000, bookiesPerSeconde: 250, count: 0 },
    { name: "Fotocamera", price: 70000, bookiesPerSeconde: 600, count: 0 },
    { name: "DJ", price: 150000, bookiesPerSeconde: 1100, count: 0 },
    { name: "Commistiehok", price: 400000, bookiesPerSeconde: 2500, count: 0 },
    { name: "Ewi", price: 900000, bookiesPerSeconde: 4500, count: 0 },
    { name: "Tondeuse", price: 1800000, bookiesPerSeconde: 9000, count: 0 },
    { name: "JaBo hekje", price: 3500000, bookiesPerSeconde: 15000, count: 0 },
    { name: "153 hektometer paal", price: 7000000, bookiesPerSeconde: 28000, count: 0 },
    { name: "Schotel", price: 15000000, bookiesPerSeconde: 60000, count: 0 },
    { name: "Werkende computer", price: 30000000, bookiesPerSeconde: 120000, count: 0 }
  ];

  let boosts = [
    { name: "Kikker", price: 660, clickfactor: 1.2, count: 0 },
    { name: "ETVis", price: 5000, clickfactor: 1.5, count: 0 },
    { name: "Capybara", price: 20000, clickfactor: 2.5, count: 0 },
    { name: "Schotse Hooglander", price: 100000, clickfactor: 4.5, count: 0 }
  ];

  let count = getFromStorage(STORAGE_KEYS.count, 0);
  let clickworth = getFromStorage(STORAGE_KEYS.clickworth, 1);
  let savedUsername = load_data(STORAGE_KEYS.username) || "Anoniem";

  function hashKeyName(name) {
      return CryptoJS.SHA256(name).toString();
  }
  function store_data(name, data) {
      const uuid = getDeviceId();
      const encryptionKey = `enc-${uuid}`;
      const hmacKey = `hmac-${uuid}`;

      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();
      const hmac = CryptoJS.HmacSHA256(encrypted, hmacKey).toString();

      const hashedName = hashKeyName(name);
      localStorage.setItem(`data_${hashedName}`, encrypted);
      localStorage.setItem(`hmac_${hashedName}`, hmac);
  }

  // Load and verify encrypted data
  function load_data(name) {
      const uuid = getDeviceId();
      const encryptionKey = `enc-${uuid}`;
      const hmacKey = `hmac-${uuid}`;
      const hashedName = hashKeyName(name);

      const encrypted = localStorage.getItem(`data_${hashedName}`);
      const hmac = localStorage.getItem(`hmac_${hashedName}`);

      if (!encrypted || !hmac) return null;

      const calculatedHmac = CryptoJS.HmacSHA256(encrypted, hmacKey).toString();
      if (calculatedHmac !== hmac) {
          console.warn("Tampered or mismatched data for:", name);
          resetGame();
          return null;
      }

      const bytes = CryptoJS.AES.decrypt(encrypted, encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
  }

  // Deze functie is wel tricky dus we moeten ff checken of het werkt
  function resetGame(){
    count = 1;
    store_data(STORAGE_KEYS.count, count);

    items = boosts;
    keyPrefix = "boost";
    items.forEach((item, index) => {
      item.count = 0;
      store_data(`${keyPrefix}_${index}`, 0);
    });
    items = upgrades;
    keyPrefix = "upgrade";
    items.forEach((item, index) => {
      item.count = 0;
      store_data(`${keyPrefix}_${index}`, 0);
    });
    clickworth = 1;
    store_data(STORAGE_KEYS.clickworth,1);
  }
    
  function numbertoname(number){
    let counter = 0;
    let newnumber = number;
    while (newnumber >= 10){
      newnumber /= 10;
      counter++;
    }
    let category = Math.floor(counter/3);
    let extra = Math.floor(number / (10**(category*3)));
    let name = names[category] || "zoek een leven";

    let result = `${extra} ${name}`;
    return result;
  }

  function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID(); 
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }
  function getFromStorage(key, defaultValue) {
    const val = load_data(key);
    return val ? parseFloat(val) : defaultValue;
  }
  function setUsernameDisplay(name){
    document.getElementById("displayUsername").textContent = name;
  }
  function loadCounts(items, keyPrefix) {
    items.forEach((item, index) => {
      item.count = parseInt(load_data(`${keyPrefix}_${index}`)) || 0;
    });
  }
  function updateCountDisplay() {
    let counttext = numbertoname(count);
    document.getElementById("count").innerText = `${counttext} \n Bookies/s: ${bps}`;
  }
  function handleSetUsername(){
    let username = prompt("Vul hier je gebruikersnaam in:") || savedUsername;
    savedUsername = username;
    setUsernameDisplay(username);
    store_data(STORAGE_KEYS.username, username);
  }
  function handleClick(){
    showClickEffect();
    count += clickworth;
    updateCountDisplay(count);
    store_data(STORAGE_KEYS.count, count);
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

      const price = numbertoname(calculatePrice(item.price, item.count));
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
      store_data(STORAGE_KEYS.count, count);
      store_data(`${keyPrefix}_${index}`, item.count);
      updateCountDisplay();
      updateUIFunc();
      if (boostCallback) boostCallback(item);
    }
  }


  function applyBoost(boost) {
    clickworth *= boost.clickfactor; // Increase click value based on boost effect
    store_data(STORAGE_KEYS.clickworth, clickworth);
  }
  function getbookiesPerSeconde() {
    let extrabookiesonesecond = 0;
    upgrades.forEach(upgrade => {
      extrabookiesonesecond += upgrade.count * upgrade.bookiesPerSeconde;
    });
    bps = extrabookiesonesecond;
    return extrabookiesonesecond;
  }
  function autoClick() {
    let extra_count = getbookiesPerSeconde();
    count += (extra_count);
    updateCountDisplay();
    store_data(STORAGE_KEYS.count, count);
  }

  const updateUpgradesUI = () => updateUI(upgrades, "upgradesContainer", buyUpgrade, "upgrade");
  const updateBoostUI = () => updateUI(boosts, "boostsContainer", buyBoost, "boost");

  // Buy handlers
  const buyUpgrade = (index) => buyItem(upgrades, index, "upgrade", updateUpgradesUI);
  const buyBoost = (index) => buyItem(boosts, index, "boost", updateBoostUI, applyBoost);

  async function submitHighscore(username, score) {
    const device_id = getDeviceId();
    score = Math.floor(score);
    const status = document.getElementById("statusMsg");
    
    try {
      const response = await fetch('https://backend-bookie.onrender.com/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score, device_id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        status.textContent = "⏳ Wacht 30 seconden voor je het opnieuw probeert.";
        status.style.color = "red";
        setTimeout(() => {
          status.textContent = "";
        }, 3000);
        throw new Error(errorData.error || 'Failed to submit score');
      }

      const result = await response.json();
      console.log('Score submitted successfully:', result);
      status.textContent = "✅ Success!";
      status.style.color = "green";
      setTimeout(() => {
        status.textContent = "";
      }, 3000);
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
    list.innerHTML = 'Loading... (this could take up to 50s)';

    try {
      const response = await fetch('https://backend-bookie.onrender.com/highscores');
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