var getImg = document.getElementById("getImg");
var download = document.getElementById("download");

getImg.addEventListener("click", async () => {
  var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      function: parse,
    },
    (urls) => {
      var num = urls[0].result;
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
        albumEle.innerHTML = album;
        console.log(albumEle, album);
        chrome.storage.sync.set({ urls: num });
      }
    }
  );
});

download.addEventListener("click", async () => {
  chrome.storage.sync.get("urls", ({ urls }) => {
    console.log("urls", urls);
    for (const url of urls) {
      chrome.downloads.download({
        url: url,
      });
    }
  });
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
    if (pattern.length > 1) {
      var url = pattern[1];
    }
    urls.push(url);
  }
  return urls;
}
