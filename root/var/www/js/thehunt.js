var URL = "http://thinkingalaud.com/api/";

function setToaster(value) {
  var toaster = document.getElementById("toaster");
  var toast = `
  <div class="toaster-content">
    ${value}
    <span onClick="hideToaster()" class="toaster-hide">❌</span>
  <div>
`;
  toaster.innerHTML = toast;
}

function hideToaster() {
  var toaster = document.getElementById("toaster");
  toaster.innerHTML = "";
}

function ajax(method, url, callback) {
  console.log(url);
  var xhttp = new XMLHttpRequest();
  xhttp.open(method, url, true);
  xhttp.addEventListener("load", function (result) {
    console.log(result.target.response);
    if (this.status === 404) {
      setToaster(result.target.response);
    } else {
      var response = JSON.parse(result.target.response);
      if (response["message"]) {
        setToaster(response["message"]);
      }
      callback(response);
    }
  });
  xhttp.send();
}

// Server requests
function getCurrentStage(table, callback) {
  var url = URL + "table/" + table;
  ajax("GET", url, callback);
}

function getNotifications(table) {
  var url = URL + "notification/" + table;
  ajax("GET", url, function(response) {
    if (response["upcoming_table"]) {
      setToaster("Andy and Melanie are visiting your table soon! Please head back over!");
    }
  });
}

function submit() {
  var elements = document.getElementById("form").children;
  var values = [];
  for(var i = 0; i < elements.length; i++){
    var item = elements.item(i);
    if (item.type !== "button") {
      values.push(item.name + "=" + item.value);
    }
  }
  var url = URL + "submit" + "?" + values.join("&");
  ajax("POST", url, function (response) {
    if (response["correct"]) {
      setStage(response["stage"]);
    }
  });
}

function getStageOneCode(table, callback) {
  var url = URL + "stageOneCode?table=" + table;
  ajax("GET", url, callback);
}

// Helpers
function getTableFromCookie() {
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].split("=");
    if (cookie[0].trim() === "table") {
      return parseInt(cookie[1]);
    }
  }
  return null;
}

function clear() {
  var content = document.getElementById("content");
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  hideToaster();
}

function submitTable() {
  var height = getComputedStyle(document.getElementById("table-1")).height;
  var interval = Math.round(parseFloat(height.substring(0, height.length - 2))); // Removes 'px' from the end
  var table = Math.round(document.getElementById("scroll-container").scrollTop / interval) + 1;
  getCurrentStage(table, function (response) {
    document.cookie = `table=${table}`;
    setStage(response["stage"]);
  });
}

function setHeader(table) {
  var header = "";
  if (table) {
    header = `
  <h3>Table ${table}</h3>
    `;
  } else {
    header = `
  <h2>Welcome to the The Hunt!</h2>
    `;
  }
  var headerElement = document.getElementById("header");
  headerElement.innerHTML = header;
}

function setContent(content) {
  var contentElement = document.getElementById("content");
  contentElement.innerHTML = content;
}

function setFooter(stage) {
  var footerElement = document.getElementById("footer");
  footerElement.innerHTML = stage;
}

function createSubmitForm(table, stage) {
  return `
<div id="form">
  <input type="text" id="form_table" name="answer">
  <input type="hidden" value=${table} name="table">
  <input type="hidden" value=${stage} name="stage">
  <input type="button" value="Submit" onClick="submit()">
</div>
  `;
}

// Stages
function setStageZero() {
  var tableElements = '';
  var numTables = 28;
  for (var i = 1; i < numTables + 1; i++) {
    var classNames = "scroll-page";
    if (i == 1) {
      classNames += " top";
    }
    if (i == numTables) {
      classNames += " bottom";
    }
    tableElements += `<div class="${classNames}" id=table-${i}>${i}</div>`;
  }

  var page = `
<div>
  <p class="story">Oh no! What?!?! How can this be?! The wedding ring is missing! In all of the excitement and chaos, the Bridal party has misplaced the wedding ring and has no idea where it could be. They’ve looked high; they’ve looked low; they’ve even looked in between a few places but have come up empty handed. They’ve managed to keep the newly weds from finding out their blunder but the night is quickly coming to an end, and they need your help! The Maid of Honor remembers seeing the bride with the ring right after the ceremony, so they know it’s somewhere here. Retrace all the steps of the bridal party and put on your deerstalker cap. Piece together the clues to find the missing ring and return it to the new bride before she even notices.</p>
  <p class="story">Which table are you part of?</p>

  <div id="form_table">
    <div class="box"></div>
    <div id="scroll-container">
      ${tableElements}
    </div>
    <input type="button" value="Submit" onClick="submitTable()">
  </div>
</div>
`;
  setContent(page);

  // snap to table numbers when scrolling
  var container = document.getElementById("scroll-container");
  var scrollHandle = null;
  document.body.lastTableScroll = 0;
  container.onscroll = function() {
    var height = getComputedStyle(document.getElementById("table-1")).height;
    var interval = Math.round(parseFloat(height.substring(0, height.length - 2))); // Removes 'px' from the end
    var scrolled = container.scrollTop;
    var round = document.body.lastTableScroll < scrolled ? Math.ceil : Math.floor;
    var scrollDestination = round(scrolled / interval) * interval;
    clearTimeout(scrollHandle);
    scrollHandle = setTimeout(function() {
      container.scrollTop = scrollDestination;
      document.body.lastTableScroll = scrollDestination;
    }, 150);
  }
}

function setStageOne(table) {
  var page = `
<div>
  <p class="story">Bryan, a groomsman, had to place the table numbers on the table when he got to the venue. He found some peculiar letters at your table but didn’t think too much of it.</p>
  <div id="stageOneCode"></div>
${createSubmitForm(table, 1)}
</div>
  `;
  setContent(page);

  getStageOneCode(table, function (response) {
    var element = document.getElementById("stageOneCode");
    element.innerHTML = response["code"];
  });
}

function setStageTwo(table) {
  var page = `
<div>
  <div class="picture-cipher">
    <img class="picture-cipher-img" src="/images/thehunt/cold.jpg" />
    <span>+</span>
    <img class="picture-cipher-img" src="/images/thehunt/cold-water.jpg" />
    <span>+</span>
  </div>
  <div class="picture-cipher">
    <img class="picture-cipher-img" src="/images/thehunt/cow.jpg" />
    <span>+</span>
    <img class="picture-cipher-img" src="/images/thehunt/whisk.jpg" />
    <span>=</span>
  </div>
${createSubmitForm(table, 2)}
</div>
  `;
  setContent(page);
}

function setStageThree(table) {
  var page = `
<div>
  <p class="story">Look under your chair.</p>
${createSubmitForm(table, 3)}
</div>
  `;
  setContent(page);
}

function setStageFour(table) {
  var page = `
<div>
  <p class="story">
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent egestas elit eget ipsum tincidunt faucibus. Vestibulum eu condimentum turpis. Curabitur congue lectus diam, iaculis interdum elit tincidunt quis. Vivamus gravida vulputate suscipit. Nunc porta est tellus, commodo iaculis dolor gravida et. Nunc eget lectus eget augue interdum pharetra. Morbi tincidunt accumsan efficitur. Integer bibendum velit in urna eleifend facilisis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
  <p class="story">Sed a risus at ante dignissim sodales eu ut neque. Nunc hendrerit laoreet libero nec sagittis. In sit amet orci ut nunc imperdiet ornare sed nec dolor. Nulla quis nisl condimentum sapien placerat molestie ut sit amet arcu. Nunc elementum tortor dignissim, fermentum est quis, consequat felis. Vivamus rhoncus quam non tristique rutrum. In dui est, luctus at efficitur nec, vehicula id erat. Pellentesque commodo magna a tortor laoreet, molestie vulputate arcu volutpat.</p>
  <p class="story">Curabitur at turpis velit. Proin tristique ligula sem, eget ornare dolor tristique a. Curabitur accumsan neque justo, ullamcorper convallis dui faucibus sed. Donec metus massa, rutrum non elit vel, dapibus tempus purus. Sed at nisl sem. Suspendisse placerat libero sit amet libero volutpat, id iaculis turpis feugiat. Integer ut purus ac lectus ornare euismod ut sit amet metus. Curabitur in erat rutrum, facilisis nibh ut, maximus nulla. Vestibulum suscipit neque nunc, suscipit tincidunt diam pharetra finibus. Phasellus pharetra leo non nulla rhoncus, eget rhoncus nibh varius. Nulla ultrices feugiat nisl, quis placerat mauris volutpat a. Praesent mollis enim commodo consequat scelerisque. Vivamus vitae velit erat. Nunc faucibus aliquet justo, sed rutrum nunc. Vivamus tortor lacus, pretium ut lacinia sit amet, lacinia et leo.</p>
${createSubmitForm(table, 4)}
</div>
  `;
  setContent(page);
}

function setStageFive(table) {
  var page = `
<div>
${createSubmitForm(table, 5)}
</div>
  `;
  setContent(page);
}

function setStageSix(table) {
  var page = `
<div>
${createSubmitForm(table, 6)}
</div>
  `;
  setContent(page);
}

function setStage(stage) {
  var table = getTableFromCookie();
  clear();
  setHeader(table);
  if (stage === 0) {
    setStageZero();
  } else if (stage === 1) {
    setStageOne(table);
  } else if (stage === 2) {
    setStageTwo(table);
  } else if (stage === 3) {
    setStageThree(table);
  } else if (stage === 4) {
    setStageFour(table);
  } else if (stage === 5) {
    setStageFive(table);
  } else if (stage === 6) {
    setStageSix(table);
  }

  setFooter(stage);
}

// Main
function main() {
  // Check for notifications every 30 seconds
  setInterval(function() {
    var table = getTableFromCookie();
    if (table) {
      getNotifications(table);
    }
  }, 30000);

  var table = getTableFromCookie();
  if (table) {
    getCurrentStage(table, function (response) {
      setStage(response["stage"]);
    });
  } else {
    setStage(0);
  }
}

main();
