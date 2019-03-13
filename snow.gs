// 当日日付をyyyy/mm/dd形式でリターン
function getCurrentDateTime() {

  var date_and_time = new Date();
  var year = date_and_time.getFullYear();
  var month = ( '00' + ( date_and_time.getMonth() + 1 ) ).slice(-2);
  var date = ( '00' + date_and_time.getDate() ).slice(-2);

  Logger.log(year + "\/" + month + "\/" + date);
  return year + "\/" + month + "\/" + date;
  
}


// Driveのルートフォルダより、指定されたSSのIDを取得する関数
function getSsId(argSsName) {

  var ssName = argSsName;

  var rootId = DriveApp.getRootFolder().getId();
  var rootFolder = DriveApp.getFolderById(rootId);
  
  var rootFiles = rootFolder.getFiles();
  
  while (rootFiles.hasNext()) {
    var fileName = rootFiles.next();
    
    if ( fileName.getName() === ssName ) {
      var ssId = fileName.getId();
      break;
    }
  }
  Logger.log(ssId);
  return ssId;
}

function test_inputSS(){inputSS("hkb","2018/12/16",50)}

// スプレッドシート入力
function inputSS(PlaceId,targetDate,inputStrings) {

  var targetRow = 1;
  var targetCol = 1;

  var initialDate = new Date("2018/12/01");
  var targetDate = new Date(targetDate);

  var diffDate = ( targetDate - initialDate ) / ( 1000 * 60 * 60 * 24 );
  var targetRow = parseInt(　targetRow + diffDate　);

  var targetSsSheetName = PlaceId; 
  var targetSsName = "SsSnow";
  var ssId = getSsId(targetSsName);

  // IDがない=SSがない場合は、新規作成
  if ( !ssId ) {
    SpreadsheetApp.create(targetSsName);
    var ssId = getSsId(targetSsName);
  }
  
  var ssObj = SpreadsheetApp.openById(ssId);
  var ssSheetName = ssObj.getSheetByName(targetSsSheetName);
  
  if ( !ssSheetName ) {
    ssObj.insertSheet(targetSsSheetName);
    var ssSheetName = ssObj.getSheetByName(targetSsSheetName);
  }

  ssSheetName.getRange(targetRow,1).setValue(targetDate);
  ssSheetName.getRange(targetRow,2).setValue(inputStrings);

}

// 気象庁のデータベースより、積雪の深さデータを取得
function fetchSnowfalls() {

  var fetchCsv = UrlFetchApp.fetch("https://www.data.jma.go.jp/obd/stats/data/mdrr/snc_rct/alltable/snc00_rct.csv");
  var fetchResponse = fetchCsv.getContentText("Shift_JIS");

//  Logger.log(fetchResponse);
  return fetchResponse

}

// 公式サイトより山頂の積雪量を取得
// 白馬 47
function fetchHakuba47() {
  var fetch = UrlFetchApp.fetch("https://www.hakuba47.co.jp/winter/");
  var response = fetch.getContentText();
  var strRegexp=/a01_ico01.png"([\s\S]*?)<\/div>/;
  var dataSnowfalls = response.match(strRegexp);
  var arySnowfalls = String(dataSnowfalls).split(/\r\n|\r|\n/);
  var intSnowfalls = arySnowfalls[2].replace("cm", "");
  var intSnowfalls = intSnowfalls.replace(/\s+/g, "");
  
  return intSnowfalls;
}

// 公式サイトより山頂の積雪量を取得
// 白馬 栂池
function fetchTugaike() {
  var fetch = UrlFetchApp.fetch("http://www.tsugaike.gr.jp/");
  var response = fetch.getContentText();
  
  var strRegexp=/area01.gif"([\s\S]*?)<\/ul>/;
  var dataSnowfalls = response.match(strRegexp);
  var arySnowfalls = String(dataSnowfalls).split(/\r\n|\r|\n/);
  var intSnowfalls = arySnowfalls[3].replace('cm<\/li>', "");
  var intSnowfalls = intSnowfalls.replace('<li class="snow">積雪 ', "");
  var intSnowfalls = intSnowfalls.replace(/\s+/g, "");
  
  return intSnowfalls;
}

// 公式サイトより山頂の積雪量を取得
// 野沢温泉
function fetchNozawa() {
  var fetch = UrlFetchApp.fetch("http://www.nozawaski.com/winter/course/");
  var response = fetch.getContentText();

  var strRegexp=/<h4>やまびこエリア([\s\S]*?)<\/table>/;
  var dataSnowfalls = response.match(strRegexp);
  var arySnowfalls = String(dataSnowfalls).split(/\r\n|\r|\n/);
  var intSnowfalls = arySnowfalls[20].replace('cm</td>', "");
  var intSnowfalls = intSnowfalls.replace('<td>', "");
  var intSnowfalls = intSnowfalls.replace(/\s+/g, "");
  
  return intSnowfalls;
}

// 公式サイトより山頂の積雪量を取得
// タングラム
function fetchTangram() {
  var fetch = UrlFetchApp.fetch("https://www.tangram.jp/ski/");
  var response = fetch.getContentText();
  
  var strRegexp=/<th>積雪<\/th>([\s\S]*?)<\/tr>/;
  var dataSnowfalls = response.match(strRegexp);
  var arySnowfalls = String(dataSnowfalls).split(/\r\n|\r|\n/);
  var intSnowfalls = arySnowfalls[1].replace('</strong>cm</td>', "");
  var intSnowfalls = intSnowfalls.replace('<td><strong>', "");
  var intSnowfalls = intSnowfalls.replace(/\s+/g, "");
  
  return intSnowfalls;
}

// 公式サイトより山頂の積雪量を取得
// 尾瀬戸倉
function fetchOzetokura() {
  var fetch = UrlFetchApp.fetch("http://www.ozetokura.co.jp/snowpark/");
  var response = fetch.getContentText();
  
  var strRegexp=/<p>天候：([\s\S]*?)<\/p>/;
  var dataSnowfalls = response.match(strRegexp);
  var arySnowfalls = String(dataSnowfalls).split(/：/);
  var intSnowfalls = arySnowfalls[3].replace('cm　雪質', "");
  var intSnowfalls = intSnowfalls.replace(/\s+/g, "");
  
  return intSnowfalls;
}

// 公式サイトより山頂の積雪量を取得
// 尾瀬岩倉
function fetchOzeiwakura() {
  var fetch = UrlFetchApp.fetch("http://www.oze-iwakura.co.jp/ski/");
  var response = fetch.getContentText();
  
  var strRegexp=/<dt>積雪量<\/dt>([\s\S]*?)<\/dd>/;
  var dataSnowfalls = response.match(strRegexp);
  var arySnowfalls = String(dataSnowfalls).split(/\r\n|\r|\n/);
  var intSnowfalls = arySnowfalls[2].replace(' cm<br>', "");
  var intSnowfalls = intSnowfalls.replace('上部 ', "");
  var intSnowfalls = intSnowfalls.replace(/\s+/g, "");
  
  return intSnowfalls;
}

// 公式サイトより山頂の積雪量を取得
// おぐなほたか
function fetchOgnahotaka() {
  var fetch = UrlFetchApp.fetch("http://ognahotaka.jp/");
  var response = fetch.getContentText();
  
  var strRegexp=/title_report.png"([\s\S]*?)<div class="topics">/;
  var dataSnowfalls = response.match(strRegexp);
  var arySnowfalls = String(dataSnowfalls).split(/\r\n|\r|\n/);
  var intSnowfalls = arySnowfalls[9].replace('cm</p></div>', "");
  var intSnowfalls = intSnowfalls.replace('<div class="fallensnow"><p>', "");
  var intSnowfalls = intSnowfalls.replace(/\s+/g, "");
  
  return intSnowfalls;
}

function batchSnowfalls() {

  var strToday = getCurrentDateTime()

  var dataSnowfalls = fetchSnowfalls();
  var arySnowfalls = dataSnowfalls.split(/\r\n|\r|\n/);

  // 気象庁データからエリアの積雪量をスプレッドシートに出力
  // hkb 48141 長野県白馬村
  // nzw 48031 長野県野沢温泉
  // snm 48061 長野県信濃町
  // nmt 42046 群馬県利根郡みなかみ町藤原
  // inw 36276 福島県猪苗代
  // myk 54816 新潟県妙高市関山
  var places = {hkb:"48141", nzw:"48031", snm:"48061", nmt:"42046", inw:"36276", myk:"54816"};

  for ( var subject in places ) {
  
    var placeId = places[subject];
  
    for ( var rowSnowfalls in arySnowfalls ) {
    
      if ( arySnowfalls[rowSnowfalls].match(placeId) ) {
        intSnowfalls = arySnowfalls[rowSnowfalls].split(",");

        Logger.log('%s の %s の積雪量は %s',subject, strToday, intSnowfalls[9] );
        inputSS(subject, strToday, intSnowfalls[9]);
      }
    }

  }

  // 各スキー場の公式サイトから積雪量をスプレッドシートに出力
  // 1001 47
  // 1002 栂池
  // 1003 野沢温泉
  // 1004 タングラム
  // 1005 尾瀬戸倉
  // 1006 尾瀬岩倉
  // 1007 オグナホタカ
  var placesSkiresorts = {1001:"Hakuba47", 1002:"Tugaike", 1003:"Nozawa", 1004:"Tangram", 1005:"Ozetokura", 1006:"Ozeiwakura", 1007:"Ognahotaka"};

  for ( var item in placesSkiresorts ) {
  
    var nameSkiresort = placesSkiresorts[item];

    if      ( item == 1001 ) { var intSnowfalls = fetchHakuba47();   } 
    else if ( item == 1002 ) { var intSnowfalls = fetchTugaike();    } 
    else if ( item == 1003 ) { var intSnowfalls = fetchNozawa();     } 
    else if ( item == 1004 ) { var intSnowfalls = fetchTangram();    } 
    else if ( item == 1005 ) { var intSnowfalls = fetchOzetokura();  } 
    else if ( item == 1006 ) { var intSnowfalls = fetchOzeiwakura(); } 
    else if ( item == 1007 ) { var intSnowfalls = fetchOgnahotaka(); }
    else {continue; }

    Logger.log(item + " "+ nameSkiresort +" " + strToday +" " + intSnowfalls);
    inputSS(nameSkiresort, strToday, intSnowfalls);

  }


}


function doGet() {
//  return HtmlService.createTemplateFromFile("Snowfalls").evaluate();

  var htmlOutput = HtmlService.createTemplateFromFile("Snowfalls").evaluate();
  htmlOutput
    .setTitle('積雪量')
    .setFaviconUrl('https://drive.google.com/uc?id=1AWwDU5z-jW5fM3Fw30SyfKht-LxE7p0m&.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
  return htmlOutput;


}

function createChart() {

  var targetSsName = "SsSnow";
  var ssId = getSsId(targetSsName);
  var ssObj = SpreadsheetApp.openById(ssId);
  var ssSheetName = ssObj.getSheetByName("hkb");

  var range = ssSheetName.getRange("A1:B100");
  var chart = ssSheetName.newChart()
              .setPosition(1,4,0,0)
              .addRange(range)
              .setChartType(Charts.ChartType.AREA)
              .setOption('title', '白馬の積雪量')
              .build();
  ssSheetName.insertChart(chart);
 
  //グラフの画像を取得
  var imageBlob = chart.getBlob().getAs('image/png').setName("chart_image.png");//グラフの画像を取得
 
  //GMailAppにsendEmailメソッドを実行してメールを送信する
  GmailApp.sendEmail(
        'zasikiwarasi919@gmail.com',//宛先です。※架空のメールアドレスです
        '雪のレポート',//件名です。
        '添付ファイルをご確認下さい', //本文になります。
        {attachments: [imageBlob]}
        );
        
   ssSheetName.removeChart(chart);
}
