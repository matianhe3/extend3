chrome.runtime.onMessage.addListener((msg) => {
  if (msg.func == "queryTab") {
    console.log(msg);
    queryTab();
  } else if (msg.func == "stop") {
    stop();
  }
});

var timer = null;

function queryTab() {
  var index = 0;
  var time = 3000;
  chrome.windows.getCurrent({ populate: true }, (res) => {
    timer = setInterval(() => {
      chrome.tabs.highlight({ tabs: index });
      index++;
      if (index >= res.tabs.length) {
        index = 0;
      }
    }, time);
  });
}

function stop() {
  clearInterval(timer);
  timer = null;
}
