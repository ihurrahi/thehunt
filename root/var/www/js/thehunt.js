var URL = "http://thinkingalaud.com/api/";

// Cause js modulo is stupid
function mod(x, n) {
  return ((x % n) + n) % n;
}
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

function _ajax(method, url, callback) {
  console.log(url);
  var xhttp = new XMLHttpRequest();
  xhttp.open(method, url, true);
  xhttp.addEventListener("load", function (result) {
    console.log(result.target.response);
    if (this.status === 404) {
      setToaster(result.target.response);
    } else if (this.status === 413) {
      setToaster('File too large.')
    } else {
      var response = JSON.parse(result.target.response);
      if (response["message"]) {
        setToaster(response["message"]);
      }
      callback(response);
    }
  });
  return xhttp;
}

function ajax(method, url, callback) {
  var req = _ajax(method, url, callback);
  req.send();
}

// Server requests
function getCurrentStage(callback) {
  var url = URL + "game_state";
  ajax("GET", url, callback);
}

function setTable(table, callback) {
  var url = URL + "table?table=" + table;
  ajax("POST", url, callback);
}

function getNotifications() {
  var url = URL + "notification";
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

function submitLock(stage) {
  var dials = [
    document.getElementById("dial-0"),
    document.getElementById("dial-1"),
    document.getElementById("dial-2"),
    document.getElementById("dial-3"),
  ]
  var answer = '';
  for (var i = 0; i < dials.length; i++) {
    answer += getLockElement(dials[i]).innerHTML;
  }

  var values = [`answer=${answer}`, `stage=${stage}`];
  var url = URL + "submit" + "?" + values.join("&");
  ajax("POST", url, function (response) {
    if (response["correct"]) {
      setStage(response["stage"]);
    } else {
      for (var i = 0; i < dials.length; i++) {
        resetLock(dials[i]);
      }
    }
  });
}

function getStageOneCode(callback) {
  var url = URL + "stageOneCode";
  ajax("GET", url, callback);
}

// Helpers
function clear() {
  var content = document.getElementById("content");
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  hideToaster();
}

function submitTable() {
  // We retrieve the table number based on how far down the container we've scrolled to
  var height = getComputedStyle(document.getElementById("table-1")).height;
  var interval = Math.round(parseFloat(height.replace("px", "")));
  var table = Math.round(document.getElementById("table-selector").scrollTop / interval) + 1;

  setTable(table, function (response) {
    setHeader(table);
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

function createSubmitForm(stage) {
  return `
<div id="form">
  <input type="text" id="form-table" name="answer">
  <input type="hidden" value=${stage} name="stage">
  <input type="button" value="❯" onClick="submit()">
</div>
  `;
}

function createLock() {
  var elements = "";
  var dials = 4;
  for (var i = 0; i < dials; i++) {
    var nums = "";
    for (var j = 0; j < 10; j++) {
      var num = (j + 5) % 10;
      nums += `<li>${num}</li>`;
    }
    elements += `
<ul id=dial-${i} class="scroll-container">
  ${nums}
</ul>
`;
  }
  return `
<div id="lock">
  ${elements}
</div>
`;
}

function getLockElement(container) {
  var liChildren = container.getElementsByTagName("li");
  var gridHeight = liChildren[0].clientHeight;
  var index = Math.round(container.scrollTop / gridHeight) + 1;
  return liChildren[index];
}

function resetLock(container) {
  var liChildren = container.getElementsByTagName("li");
  var gridHeight = liChildren[0].clientHeight;
  // Start at 1 in off chance that the first element is
  // what we need to reset to - we need at least 1 number
  // on top so the 0 is centered when we scroll to it
  for (var i = 1; i < liChildren.length; i++) {
    if (liChildren[i].innerHTML === '0') {
      break;
    }
  }
  container.scrollTop = (i - 1) * gridHeight;
}

function createListElement(num) {
  var node = document.createElement("li");
  var text = document.createTextNode(num);
  node.appendChild(text);
  return node;
}

// Stages
function setStageZero() {
  setHeader(0);
  var tableElements = '';
  var numTables = 28;
  for (var i = 1; i < numTables + 1; i++) {
    var classNames = "";
    if (i == 1) {
      classNames = "top";
    }
    if (i == numTables) {
      classNames = "bottom";
    }
    tableElements += `<li id=table-${i} class=${classNames}>${i}</li>`;
  }

  var page = `
<div>
  <p class="story">Oh no! What?!?! How can this be?! The wedding ring is missing! In all of the excitement and chaos, the Bridal party has misplaced the wedding ring and has no idea where it could be. They’ve looked high; they’ve looked low; they’ve even looked in between a few places but have come up empty handed. They’ve managed to keep the newly weds from finding out their blunder but the night is quickly coming to an end, and they need your help! The Maid of Honor remembers seeing the bride with the ring right after the ceremony, so they know it’s somewhere here. Retrace all the steps of the bridal party and put on your deerstalker cap. Piece together the clues to find the missing ring and return it to the new bride before she even notices.</p>
  <p class="story">Which table are you part of?</p>

  <div id="form-table">
    <div class="box"></div>
    <ul class="scroll-container" id="table-selector">
      ${tableElements}
    </ul>
    <input type="button" value="❯" onClick="submitTable()">
  </div>
</div>
`;
  setContent(page);

  var tableElement = document.getElementById("table-selector").children[0];
  var gridHeight = parseInt(getComputedStyle(tableElement).height.replace("px", ""));
  Draggable.create("#table-selector", {
    type: "scroll",
    liveSnap: function(endValue) {
      return -Math.round(endValue / gridHeight) * gridHeight;
    },
  });
}

function setStageOne() {
  var page = `
<div>
  <p class="story">Bryan, a groomsman, had to place the table numbers on the table when he got to the venue. He found some peculiar letters at your table but didn’t think too much of it.</p>
  <div id="stageOneCode"></div>
${createSubmitForm(1)}
</div>
  `;
  setContent(page);

  getStageOneCode(function (response) {
    var element = document.getElementById("stageOneCode");
    element.innerHTML = response["code"];
  });
}

function setStageTwo() {
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
${createSubmitForm(2)}
</div>
  `;
  setContent(page);
}

function setStageThree() {
  var page = `
<div>
  <p class="story">Look under your chair.</p>
${createSubmitForm(3)}
</div>
  `;
  setContent(page);
}

function setStageFour() {
  var page = `
<div>
  <p class="story">
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent egestas elit eget ipsum tincidunt faucibus. Vestibulum eu condimentum turpis. Curabitur congue lectus diam, iaculis interdum elit tincidunt quis. Vivamus gravida vulputate suscipit. Nunc porta est tellus, commodo iaculis dolor gravida et. Nunc eget lectus eget augue interdum pharetra. Morbi tincidunt accumsan efficitur. Integer bibendum velit in urna eleifend facilisis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
  <p class="story">Sed a risus at ante dignissim sodales eu ut neque. Nunc hendrerit laoreet libero nec sagittis. In sit amet orci ut nunc imperdiet ornare sed nec dolor. Nulla quis nisl condimentum sapien placerat molestie ut sit amet arcu. Nunc elementum tortor dignissim, fermentum est quis, consequat felis. Vivamus rhoncus quam non tristique rutrum. In dui est, luctus at efficitur nec, vehicula id erat. Pellentesque commodo magna a tortor laoreet, molestie vulputate arcu volutpat.</p>
  <p class="story">Curabitur at turpis velit. Proin tristique ligula sem, eget ornare dolor tristique a. Curabitur accumsan neque justo, ullamcorper convallis dui faucibus sed. Donec metus massa, rutrum non elit vel, dapibus tempus purus. Sed at nisl sem. Suspendisse placerat libero sit amet libero volutpat, id iaculis turpis feugiat. Integer ut purus ac lectus ornare euismod ut sit amet metus. Curabitur in erat rutrum, facilisis nibh ut, maximus nulla. Vestibulum suscipit neque nunc, suscipit tincidunt diam pharetra finibus. Phasellus pharetra leo non nulla rhoncus, eget rhoncus nibh varius. Nulla ultrices feugiat nisl, quis placerat mauris volutpat a. Praesent mollis enim commodo consequat scelerisque. Vivamus vitae velit erat. Nunc faucibus aliquet justo, sed rutrum nunc. Vivamus tortor lacus, pretium ut lacinia sit amet, lacinia et leo.</p>
${createSubmitForm(4)}
</div>
  `;
  setContent(page);
}

function setStageFive() {
  var page = `
<div>
${createSubmitForm(5)}
</div>
  `;
  setContent(page);
}

function setStageSix() {
  var page = `
<div>
  <div id="lock-form">
    ${createLock()}
    <input type="button" value="❯" onClick="submitLock(6)">
  </div>
</div>
  `;
  setContent(page);

  Draggable.create(".scroll-container", {
    type: "scroll",
    liveSnap: function(endValue) {
      var height = document.getElementsByTagName("li")[0].clientHeight;
      return -Math.round(endValue / (height / 2)) * (height / 2);
    },
    onDragEnd: function() {
      var height = document.getElementsByTagName("li")[0].clientHeight;
      var scroll = this.target.scrollTop;
      var lockEl = getLockElement(this.target);
      // Always ensure there are 5 elements after the current one
      var forward = 0;
      var ptr = lockEl;
      while (ptr.nextElementSibling) {
        forward += 1;
        ptr = ptr.nextElementSibling;
      }
      var nextNum = mod(parseInt(ptr.innerHTML) + 1, 10);
      for (var i = 0; i < 5 - forward; i++) {
        ptr.parentNode.appendChild(createListElement(mod(nextNum + i, 10)));
      }
      // Always ensure there are 5 elements before the current one
      var backward = 0;
      var ptr = lockEl;
      while (ptr.previousElementSibling) {
        backward += 1;
        ptr = ptr.previousElementSibling;
      }
      var prevNum = mod(parseInt(ptr.innerHTML) - 1, 10);
      var diff = 0;
      for (var i = 0; i < 5 - backward; i++) {
        ptr.parentNode.insertBefore(createListElement(mod(prevNum - i, 10)), ptr.parentNode.firstChild);
        diff += height;
      }
      // TODO: not sure why this causes problems in Chrome when diff is less than 4*height
      this.target.scrollTop += diff;
    }
  });

  // Not sure why this happens, but clientHeight doesn't get set to the right
  // value until some time later. My guess is that the styles don't get applied
  // immediately, and the font for the lock numbers is slightly larger so the
  // height changes later on. We want to use that later height value for setting
  // the initial scroll location.
  setTimeout(function() {
    // Center scroll in the middle
    var dials = document.getElementsByClassName("scroll-container");
    for (var i = 0; i < dials.length; i++) {
      resetLock(dials[i]);
    }
  }, 500);
}

function setStageSeven() {
  var page = `
<div>
  <form id="file-upload-form">
    <input type="file" id="file-upload" name="file" accept="image/*;capture=camera">
    <img id="file-preview" src="#">
    <div class="file-submit-container">
      <input type="button" id="file-upload-submit" value="Submit">
      <div id="file-upload-progress"></div>
    <div>
  </form>
</div>
  `;
  setContent(page);

  var uploader = document.getElementById("file-upload");
  uploader.onchange = function() {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var preview = document.getElementById("file-preview");
        preview.setAttribute("src", e.target.result);
        preview.style.visibility = "visible";
      }
      reader.readAsDataURL(this.files[0]);
    }
  };

  var submitButton = document.getElementById("file-upload-submit");
  submitButton.onclick = function() {
    var values = ["stage=7"];
    var url = URL + "submit" + "?" + values.join("&");
    var req = _ajax("POST", url, function (response) {
      if (response["correct"]) {
        setStage(response["stage"]);
      }
    });
    req.upload.addEventListener("progress", function (e) {
      var percent = (e.loaded / e.total) * 100;
      var progress = document.getElementById("file-upload-progress");
      progress.style.visibility = 'visible';
      progress.innerHTML = Math.round(percent) + "%";
    }, false);

    var form = document.getElementById("file-upload-form");
    var uploaderForm = new FormData(form);
    req.send(uploaderForm);
  }
}

function setStageEight() {
  var page = `
<div>
  <div id="grid">
    <div id="inner-grid">
    </div>
  </div>
</div>
  `;
  setContent(page);

  var gridX = 12;
  var gridY = 31;
  // TODO: how do we use 2em instead of pixel values?
  var elementSize = 32; // 2em
  // TODO: this is bad - the answers are available client side
  var bubbles = {
    "bubble-sam": {display: "SM", className: "bubble green", answer: [4, 11], start: [11, 10] },
    "bubble-sheldon": {display: "SC", className: "bubble green", answer: [1, 1], start: [6, 29] },
    "bubble-matt": {display: "MC", className: "bubble green", answer: [1, 1], start: [11, 17] },
    "bubble-bryan": {display: "BL", className: "bubble green", answer: [1, 1], start: [2, 20] },
    "bubble-meaghan": {display: "MY", className: "bubble pink", answer: [1, 1], start: [1, 1] },
    "bubble-anna": {display: "AS", className: "bubble pink", answer: [1, 1], start: [6, 25] },
    "bubble-lillian": {display: "LW", className: "bubble pink", answer: [1, 1], start: [7, 19] },
    "bubble-shay": {display: "SP", className: "bubble pink", answer: [1, 1], start: [3, 2] },
  };

  var grid = document.getElementById("grid");
  grid.style.width = `calc(${elementSize}px * (${gridX} + 1))`;
  grid.style.height = `calc(${elementSize}px * (${gridY} + 1))`;
  // Create grid pattern
  for (var i = 0; i < gridY + 1; i++) {
    for (var j = 0; j < gridX + 1; j++) {
      var div = document.createElement("div");
      var classNames = [];
      if (i == 0) {
        classNames.push("top");
      }
      if (i == gridY) {
        classNames.push("bottom");
      }
      if (j == 0) {
        classNames.push("left");
      }
      if (j == gridX) {
        classNames.push("right");
      }
      if (classNames.length == 0) {
        classNames.push("middle");
      }
      classNames.splice(0, 0, "grid-line");
      div.className = classNames.join(" ");
      grid.appendChild(div);
    }
  }

  // Actually create bubble elements
  Object.keys(bubbles).forEach(function (id) {
    var bubble = bubbles[id];
    var bubbleElement = document.createElement("div");
    bubbleElement.className = bubble.className;
    bubbleElement.innerHTML = bubble.display;
    bubbleElement.id = id;
    grid.appendChild(bubbleElement);
  });

  var draggables = Draggable.create(".bubble", {
    type: "x,y",
    edgeResistance: 0.65,
    bounds: "#grid",
    liveSnap: true,
    snap: {
      x: function(endValue) {
        return Math.round(endValue / elementSize) * elementSize;
      },
      y: function(endValue) {
        return Math.round(endValue / elementSize) * elementSize;
      }
    },
    onDragEnd: function() {
      // innerGrid has the real bounds for the bubbles, grid has the bounds for the grid pattern
      grid = document.getElementById("inner-grid");
      this.applyBounds(grid);

      correct = true;
      for (var i = 0; i < draggables.length; i++) {
        var draggable = draggables[i];
        var answer = bubbles[draggable.target.id].answer;
        var loc = [draggable.x / elementSize, draggable.y / elementSize];
        if (loc[0] != answer[0] || loc[1] != answer[1]) {
          correct = false;
        }
      }
      if (correct) {
        // TODO: move onto the next stage
        setToaster("Correct!");
      } else {
        setToaster([this.x / elementSize, this.y / elementSize]);
      }
    }
  });

  // move bubbles to their starting positions
  for (var i = 0; i < draggables.length; i++) {
    var draggable = draggables[i];
    var start = bubbles[draggable.target.id].start;
    TweenLite.set(draggable.target, { x: start[0] * elementSize, y: start[1] * elementSize });
    draggable.update();
  }
}

function setStage(stage) {
  clear();
  if (stage === 0) {
    setStageZero();
  } else if (stage === 1) {
    setStageOne();
  } else if (stage === 2) {
    setStageTwo();
  } else if (stage === 3) {
    setStageThree();
  } else if (stage === 4) {
    setStageFour();
  } else if (stage === 5) {
    setStageFive();
  } else if (stage === 6) {
    setStageSix();
  } else if (stage === 7) {
    setStageSeven();
  } else if (stage === 8) {
    setStageEight();
  }

  setFooter(stage);
}

// Main
function main() {
  // Check for notifications every 30 seconds
  setInterval(function() {
    getNotifications();
  }, 30000);

  getCurrentStage(function (response) {
    if (response["table"]) {
      setHeader(response["table"]);
    }
    if (response["stage"]) {
      setStage(response["stage"]);
    } else {
      setStage(0);
    }
  });
}

main();
