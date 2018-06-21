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
  var table = document.getElementById("form_table").value;
  getCurrentStage(table, function (response) {
    document.cookie = `table=${table}`;
    setStage(response["stage"]);
  });
}

function setHeader(table) {
  var header = "";
  if (table) {
    header = `
  <h3>Welcome Table ${table}</h3>
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
  var page = `
<div>
  <p class="story">Oh no! What?!?! How can this be?! The wedding ring is missing! In all of the excitement and chaos, the Bridal party has misplaced the wedding ring and has no idea where it could be. They’ve looked high; they’ve looked low; they’ve even looked in between a few places but have come up empty handed. They’ve managed to keep the newly weds from finding out their blunder but the night is quickly coming to an end, and they need your help! The Maid of Honor remembers seeing the bride with the ring right after the ceremony, so they know it’s somewhere here. Retrace all the steps of the bridal party and put on your deerstalker cap. Piece together the clues to find the missing ring and return it to the new bride before she even notices.</p>
  <p class="story">Which table are you part of?</p>
  <div id="form">
    <input type="text" id="form_table" name="table">
    <input type="button" value="Submit" onClick="submitTable()">
  </div>
</div>
`;
  setContent(page);
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
  }
  setFooter(stage);
}

// Main
function main() {
  var table = getTableFromCookie();

  // Check for notifications every 30 seconds
  setInterval(function() {
    getNotifications(table);
  }, 30000);

  if (table) {
    getCurrentStage(table, function (response) {
      setStage(response["stage"]);
    });
  } else {
    setStage(0);
  }
}

main();
