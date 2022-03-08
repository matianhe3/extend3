var getImg = document.getElementById("getImg");
var download = document.getElementById("download");
var toggle = document.getElementById("toggle");
var stop = document.getElementById("stop");
var spider = document.getElementById("spider");

// 开启页面轮询任务
toggle.addEventListener("click", () => {
  chrome.alarms.create("queryTab", { periodInMinutes: 0.08 });
});

// 开启一件迁房循环任务
spider.addEventListener("click", () => {
  chrome.alarms.create("spider", { periodInMinutes: 0.08 });
});

// 清除所有 循环任务
stop.addEventListener("click", () => {
  chrome.runtime.sendMessage({ name: "stop" });
});

// 监听解析图片按钮点击事件, 把数据展示到popup页面.
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

// 监听下载图片方法 保存到指定位置
chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
  var path = document.getElementById("roomID").innerHTML;
  suggest({ filename: path + "/" + item.filename });
});

// 监听下载按钮点击事件, 获取解析到的图片URL并调用下载图片方法
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

// 解析网页图片的URL, 缩略图展示到popup页面.
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

// 延迟等待时间方法
var sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
