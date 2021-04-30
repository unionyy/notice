const https = require('https');
const cheerio = require('cheerio');
const notifier = require('node-notifier');
const path = require('path');
const open = require('open');

const options = {
    hostname: 'cafe.bithumb.com',
    port: 443,
    path: '/view/boards/43',
    method: 'GET'
}

var recentNum = 0;

function HttpsReq() {
    return new Promise((resolve, reject) => {
        const req = https.get(options, (res) => {
            res.setEncoding('utf-8');

            var _res = '';
            res.on('data', (d) => {
                _res += d;
            });
            res.on('end', () => {
                if(_res) {
                    resolve(_res);
                } else {
                    reject();
                }
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
    }); 
}

function Check(_init) {
    HttpsReq().then((data) => {
        const $ = cheerio.load(data);
    
        var newNum = recentNum;
        $('.col-20').each((i, elem) => {
            var num = Number($(elem).find('td.invisible-mobile').text());
            if(!num) return;

            if(_init) {
                newNum = num;
                console.log(`[${new Date().toLocaleString()}] Start Watcing...`);
                notifier.notify({
                    title: '테스트',
                    message: `이렇게 알림이 뜹니다.\n(클릭시 웹사이트로 이동)`,
                    icon: path.join(__dirname, 'images/icon.png'),
                    sound: true,
                    wait: true,
                },
                function (err, response, metadata) {
                    if(err) console.error(error);
                });
                notifier.on('click', function (notifierObject, options, event) {
                    // Triggers if `wait: true` and user clicks notification
                    open('https://cafe.bithumb.com/view/boards/43');
                });
                
                return false;
            }
            
            if(num > recentNum) {
                const $at = $(elem).find('a');
                var txt = $at.text();
                var uri = 'https://cafe.bithumb.com/view/board-contents/' + $at.attr('onclick').slice(22, 29);
                console.log(uri, txt);
                notifier.notify({
                    title: '빗썸 공지',
                    message: `${txt}`,
                    icon: path.join(__dirname, 'images/icon.png'),
                    sound: true,
                    wait: true,
                },
                function (err, response, metadata) {
                    if(err) console.error(error);
                });
                notifier.on('click', function (notifierObject, options, event) {
                    // Triggers if `wait: true` and user clicks notification
                    open(uri);
                });
    
                if(newNum < num) newNum = num;
            }
        });
        if(recentNum == newNum) {
            //console.log(`[${new Date().toLocaleString()}] Watcing...`);
        }
        recentNum = newNum;
        
    });
}

Check(true);
setInterval(Check, 60000);
