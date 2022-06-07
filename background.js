// 清除所有循环任务
chrome.runtime.onMessage.addListener((res) => {
  if (res.name == "stop") {
    stop();
  }
});

// 监听循环任务, 选择执行
chrome.alarms.onAlarm.addListener((res) => {
  if (res.name == "tjSpider") {
      tjSpider();
  } else if (res.name == "airSpider") {
      airSpider();
  } else if (res.name == "queryTab") {
      queryTab();
  } else {
      console.log("没有定义的操作.")
  }
});

// 轮询页面方法
function queryTab() {
  var index = 0;
  chrome.windows.getCurrent({ populate: true }, (res) => {
    res.tabs.forEach((el) => {
      if (el.active == true) {
        index = el.index + 1;
        if (index == res.tabs.length) {
          index = 0;
        }
      }
    });
    chrome.tabs.highlight({ tabs: index });
  });
}

// 途家一键迁房任务方法
function tjSpider() {
  fetch("http://192.168.16.212:5151/spider/redis/tjMoveList", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((result) => {
      console.log(result);
      result.Items.forEach((el) => {
        chrome.tabs.update({
          url: "https://m.tujia.com/detail/" + el.rivalRoomID + ".htm"
        });
      });
    });
}

// 爱彼迎一键迁房任务方法
function airSpider() {
  fetch("http://192.168.16.212:5151/spider/redis/airMoveList", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((result) => {
      console.log(result);
      result.Items.forEach((el) => {
        chrome.tabs.update({
          url: "https://www.airbnb.cn/rooms/" + el.rivalRoomID
        });
      });
    });
}

function stop() {
  chrome.alarms.clearAll();
}
