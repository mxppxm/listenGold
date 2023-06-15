const { exec } = require("child_process");
const dialog = require("dialog");
const _ = require("lodash");
const inputPrice = 450.19;
const goldWeight = 265.9428;
// 定义要发送的Curl命令
const curlCommand = `
curl 'https://ms.jr.jd.com/gw/generic/hj/h5/m/latestPrice?reqData=%7B%7D' \
  -X 'POST' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Length: 0' \
  -H 'Content-Type: application/x-www-form-urlencoded;charset=UTF-8' \
  -H 'Cookie: __jdu=16497592199672096595593; _hjSessionUser_1454429=eyJpZCI6IjJjMGY4NjEzLTE0ZWQtNTZiNy1iNzgyLTUxOTliN2Q4YTEwNCIsImNyZWF0ZWQiOjE2NDk3NTQzODM4OTUsImV4aXN0aW5nIjp0cnVlfQ==; shshshfpa=a8402393-462c-277c-1e7a-e03d74c26015-1658073354; shshshfpb=jkFROTyJNt4pT89615E8TgQ; __utma=122270672.650533404.1658073595.1658073595.1658073595.1; shshshfp=67c9db63fbff9ac2e0a00741d44eab4a; shshshfpx=a8402393-462c-277c-1e7a-e03d74c26015-1658073354; 3AB9D23F7A4B3C9B=GDFSBHUCLAKEU6YKZQ2YYFCBTTC7UT7ZBG5BKXPKDVQRQA4AMJV6R35L7HRJYOLPKJDMUWKYU7VFKMENEBWPMEIJNE; qd_ad=www.google.com%7C-%7Cseo%7C-%7C0; qd_uid=LIJOW03H-D9BIY4A7OAO7VB5R0D3B; qd_fs=1686020189307; qd_ls=1686020189307; qd_ts=1686020189307; qd_sq=1; qd_sid=LIJOW03H-D9BIY4A7OAO7VB5R0D3B-1; __jda=168871293.16497592199672096595593.1649759220.1677491020.1686020189.5; __jdb=168871293.1.16497592199672096595593|5.1686020189; __jdc=168871293; __jdv=168871293|www.google.com|-|referral|-|1686020189423; __jrr=55544F26437E0E7214F24B767D47DD' \
  -H 'Origin: https://m.jr.jd.com' \
  -H 'Pragma: no-cache' \
  -H 'Referer: https://m.jr.jd.com/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  --compressed
`;

function pad0(num) {
  return String(num).padStart(2, "0");
}
function formatPrice(num) {
  return Number(num).toFixed(2).padEnd(6, "0");
}

function formatTime(timestamp) {
  // 创建一个新的 Date 对象，并传入时间戳作为参数
  const date = new Date(Number(timestamp));

  // 使用 Date 对象的方法获取各个时间部分
  const year = date.getFullYear();
  const month = pad0(date.getMonth() + 1); // 月份从 0 开始，需要加 1
  const day = pad0(date.getDate());
  const hours = pad0(date.getHours());
  const minutes = pad0(date.getMinutes());
  const seconds = pad0(date.getSeconds());

  // 构建可读的日期和时间字符串
  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  // 打印结果
  //   console.log("Date:", formattedDate);
  //   console.log("Time:", formattedTime);
  // return formattedDate + " " + formattedTime;
  return formattedTime;
}

// 发送请求的函数
function sendRequest() {
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error: error", error.message);
      clearInterval(timer);
      return;
    }
    // if (stderr) {
    //   console.error("Error: stderr", stderr);
    //   //   return;
    // }
    // console.log("Response:", stdout);
    // console.log(
    //   "🚀 xma 🚀 ~ file: gold.js:42 ~ JSON.parse(stdout):",
    //   JSON.parse(stdout)
    // );

    const {
      resultData: {
        datas: { price, time },
      },
    } = JSON.parse(stdout);

    const currentPrice = formatPrice(price);
    const date = formatTime(time);
    const rest = formatPrice(price - inputPrice);
    const serviceFee = formatPrice(price * goldWeight * 0.003);
    const win = formatPrice(rest * goldWeight - serviceFee);
    console.log(`${date} | ${currentPrice} | ${win} | ${rest}`);

    if (rest > 2.5 || rest < -3) {
      showDialog(price);
    }
  });
}

let dialogTimeout = 0;
const showDialog = _.debounce(
  (price) => {
    clearTimeout(dialogTimeout);
    dialog.info(price, price, () => {
      console.log("刚才" + price);
    });
  },
  60 * 1000,
  { leading: true, trailing: false }
);

// 定义轮询间隔时间（毫秒）
const pollingInterval = 10 * 1000;
let timer = null;

// 开始轮询
function startPolling() {
  sendRequest(); // 发送一次请求，避免等待第一个间隔时间
  timer = setInterval(sendRequest, pollingInterval); // 设置定时器，每隔一段时间发送请求
}

// 启动轮询
startPolling();
