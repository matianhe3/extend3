var getImg = document.getElementById("getImg");
var download = document.getElementById("download");
var toggle = document.getElementById("toggle");
var stop = document.getElementById("stop");

toggle.addEventListener("click", () => {
  chrome.runtime.sendMessage({ func: "queryTab" });
});

stop.addEventListener("click", () => {
  chrome.runtime.sendMessage({ func: "stop" });
});

getImg.addEventListener("click", async () => {
  var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      function: parse,
    },
    (urls) => {
      var num = urls[0].result;
      var roomID = tab.url.match(/detail\/(\d+)(\.|$)/);
      if (roomID && roomID.length > 0) {
        roomID = roomID[1];
      } else {
        roomID = "null";
      }
      if (num) {
        var numB = document.getElementById("num");
        numB.innerHTML = num.length;
        var album = "";
        for (img of num) {
          album +=
            `<img src="` +
            img +
            `" height="150" width="150" style="margin:5px" />`;
        }
        var albumEle = document.getElementById("album");
        var roomIDEle = document.getElementById("roomID");
        albumEle.innerHTML = album;
        roomIDEle.innerHTML = roomID;
        chrome.storage.sync.set({ urls: num });
      }
    }
  );
});

chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
  var path = document.getElementById("roomID").innerHTML;
  suggest({ filename: path + "/" + item.filename });
});

download.addEventListener("click", async () => {
  chrome.storage.sync.get("urls", ({ urls }) => {
    for (const url of urls) {
      chrome.downloads.download({
        url: url,
      });
    }
  });
  chrome.storage.sync.set({ urls: [] });
});

function parse() {
  var imgs = document.evaluate(
    '//*[@id="app"]/article/div[@class="unit-image"]/div[@class="tj-swiper__mask"]/div[1]/div[1]/div/div/@style',
    document,
    null,
    XPathResult.ANY_PYTE,
    null
  );
  var urls = [];
  var img = imgs.iterateNext();
  var re = /"(http.*)"/;
  while (img) {
    var text = img.textContent;
    img = imgs.iterateNext();
    var pattern = text.match(re);
    if (pattern && pattern.length > 1) {
      var url = pattern[1];
      var pixel = url.match(/thumb.*(_.*_.*)\./);
      if (pixel && pixel.length > 0) {
        url = url.replace(pixel[1], "");
      }
      url = url.replace("/thumb", "");
    }
    urls.push(url);
  }
  return urls;
}

var sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
