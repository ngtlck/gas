
function testDate() {

 var initialDate = new Date("2018","01","01");
 var targetDate = new Date("2018","03","01");
 
 Logger.log(initialDate.getTime() + (1000 * 60 * 60 * 9) / (1000 * 60 * 60 * 24) + 25569 );
 Logger.log(targetDate.getTime() + (1000 * 60 * 60 * 9) / (1000 * 60 * 60 * 24) + 25569 );
 Logger.log(( targetDate.getTime() + (1000 * 60 * 60 * 9) / (1000 * 60 * 60 * 24) + 25569  ) - ( initialDate.getTime() + (1000 * 60 * 60 * 9) / (1000 * 60 * 60 * 24) + 25569  ) );

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

function inputSS(inputType,slackUserName,targetDate,inputStrings) {

  var timeBreak = 1;

  var targetRow = 1;
  var targetCol = 1;

  var initialDate = new Date("2018/01/01");
  var targetDate = new Date(targetDate);

  var diffDate = ( targetDate - initialDate ) / ( 1000 * 60 * 60 * 24 );
  var targetRow = parseInt(　targetRow + diffDate　);

  var targetSsSheetName = slackUserName; 
  var targetSsName = "testSS_saibaba2";
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

  // pattern1 punch in
  if ( inputType === "in" ) {
    var targetCol = 2;
  // pattern2 punch out
  } else if (inputType === "out" ) {
    var targetCol = 3;
  // pattern3 memo
  } else if (inputType === "memo" ) {
    var targetCol = 5;
  }

  ssSheetName.getRange(targetRow,1).setValue(targetDate);
  ssSheetName.getRange(targetRow,targetCol).setValue(inputStrings);

  var timeStart = ssSheetName.getRange(targetRow,2).getValue();
  var timeEnd = ssSheetName.getRange(targetRow,3).getValue();

  if ( timeStart && timeEnd ) {
    var timeElapsed = ( timeEnd - timeStart ) / ( 1000 * 60 *60 ) - timeBreak;
    ssSheetName.getRange(targetRow,4).setValue(timeElapsed);  
  }
}

function outputSS(slackUserName,targetYear,targetMonth) {

  var targetRow = 1;
  var targetCol = 1;

  var initialDate = new Date("2018/01/01");
  var targetDate = new Date(targetYear,targetMonth - 1,"01");
  var targetDateEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1,0);

  var diffDate = ( targetDate - initialDate ) / ( 1000 * 60 * 60 * 24 );
  var diffDate2 = ( targetDateEnd - targetDate ) / ( 1000 * 60 * 60 * 24 );
  var targetRow = parseInt(　targetRow + diffDate　);
  var targetRow2 = parseInt(　targetRow + diffDate2　);

  var message = targetYear + "\/" + targetMonth + ": " + slackUserName;

  var targetSsSheetName = slackUserName; 
  var targetSsName = "testSS_saibaba2";
  var ssId = getSsId(targetSsName);

  var ssObj = SpreadsheetApp.openById(ssId);
  
  var ssSheetName = ssObj.getSheetByName(targetSsSheetName);

  var timeTotal = 0;
  var cntTotal = 0;

  for ( var i = targetRow; i <= targetRow2; i++ ) {
    
    var chkExist = ssSheetName.getRange(i,4).getValue();

    if ( chkExist ) {
    
      var dateI = new Date(ssSheetName.getRange(i,1).getValue());
      var timeStart = new Date(ssSheetName.getRange(i,2).getValue());
      var timeEnd = new Date(ssSheetName.getRange(i,3).getValue());

      var year = dateI.getFullYear();
      var month = ( '00' + ( dateI.getMonth() + 1 ) ).slice(-2);
      var date = ( '00' + dateI.getDate() ).slice(-2);
      var hoursStart = ( '00' + timeStart.getHours() ).slice(-2);
      var minutesStart = ( '00' + timeStart.getMinutes() ).slice(-2);
      var hoursEnd = ( '00' + timeEnd.getHours() ).slice(-2);
      var minutesEnd = ( '00' + timeEnd.getMinutes() ).slice(-2);
   
      var message = message + "\n" 
                    + getDateTime("pattern3",year,month,date,hoursStart,minutesStart) + "～"
                    + getDateTime("pattern3",year,month,date,hoursEnd,minutesEnd) +" ("
                    + ssSheetName.getRange(i,4).getValue() + ")";
    
      var timeTotal = timeTotal + ssSheetName.getRange(i,4).getValue();
      var cntTotal = cntTotal + 1;
    }
  }

  var message = message + "\n合計: " + ( Math.floor( timeTotal * 10 ) / 10 ) + "時間" + "\n平均: " + ( Math.floor( timeTotal / cntTotal * 10 ) / 10 ) + "時間"; 

  return message;

}

function outputSS2(slackUserName,targetYear,targetMonth) {

  var aryCntOnDate = { 
                       201801:18, 201802:19, 201803:21, 201804:20, 201805:21, 201806:21, 201807:21, 201808:23, 201809:18, 201810:22, 201811:21, 201812:19,
                       201901:18, 201902:19, 201903:21, 201904:20, 201905:21, 201906:21, 201907:21, 201908:23, 201909:18, 201910:22, 201911:21, 201912:19,
                       202001:18, 202002:19, 202003:21, 202004:20, 202005:21, 202006:21, 202007:21, 202008:23, 202009:18, 202010:22, 202011:21, 202012:19,
  };

  var targetRow = 1;
  var targetCol = 1;

  var initialDate = new Date("2018/01/01");
  var targetDate = new Date(targetYear,targetMonth - 1,"01");
  var targetDateEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1,0);

  var diffDate = ( targetDate - initialDate ) / ( 1000 * 60 * 60 * 24 );
  var diffDate2 = ( targetDateEnd - targetDate ) / ( 1000 * 60 * 60 * 24 );
  var targetRow = parseInt(　targetRow + diffDate　);
  var targetRow2 = parseInt(　targetRow + diffDate2　);

  var message = targetYear + "\/" + targetMonth + ": " + slackUserName;

  var targetSsSheetName = slackUserName; 
  var targetSsName = "testSS_saibaba2";
  var ssId = getSsId(targetSsName);

  var ssObj = SpreadsheetApp.openById(ssId);
  
  var ssSheetName = ssObj.getSheetByName(targetSsSheetName);

  var timeTotal = 0;
  var cntTotal = 0;

  for ( var i = targetRow; i <= targetRow2; i++ ) {
    
    var chkExist = ssSheetName.getRange(i,4).getValue();

    if ( chkExist ) {
    
      var timeTotal = timeTotal + ssSheetName.getRange(i,4).getValue();
      var cntTotal = cntTotal + 1;

    }
  }

  var message = "\n" + targetYear + "\/" + targetMonth + "の合計: " + ( timeTotal ) + "時間" +
                "\n" + targetYear + "\/" + targetMonth + "の平均: " + ( Math.floor( timeTotal / cntTotal * 10 ) / 10 ) + "時間" +
                "\n" +  targetYear + "\/" + targetMonth + "の予測: " + ( Math.floor( timeTotal / cntTotal * aryCntOnDate[targetYear + targetMonth] *10 ) / 10 ) + "時間"; 

  return message;

}



// SlackのIncoming webhooksにPOSTする関数
function postSlack(text){
  var url = "https://hooks.slack.com/services/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";
  var options = {
    "method" : "POST",
    "headers": {"Content-type": "application/json"},
    "payload" : '{"text":"' + text + '"}'
  };
  UrlFetchApp.fetch(url, options);
}

// 疎通確認用
function test(){
  postSlack("ゆっくり茶でもすすってたええねんで");
}

function zeroPadding(nozero_text) {
  var zero_text = ( '00' + nozero_text ).slice(-2);
  return zero_text;
}

function getCurrentDateTime(get_pattern) {

  var date_and_time = new Date();
  var year = date_and_time.getFullYear();
  var month = ( '00' + ( date_and_time.getMonth() + 1 ) ).slice(-2);
  var date = ( '00' + date_and_time.getDate() ).slice(-2);
  var hours = ( '00' + date_and_time.getHours() ).slice(-2);
  var minutes = ( '00' + date_and_time.getMinutes() ).slice(-2);
  
  if ( get_pattern === "FULL" ) {
    return year + "\/" + month + "\/" + date + " " + hours + ":" + minutes;
  } else if (get_pattern === "DATE" ) {
    return year + "\/" + month + "\/" + date;
  } else if (get_pattern === "TIME" ) {
    return hours + ":" + minutes;
  } else if (get_pattern === "YEAR" ) {
    return year;
  }
  
}

function getDateTime(pattern,yyyy,mm,dd,HH,MM) {

  var curDateTime = new Date();
  var curYear = curDateTime.getFullYear();
  var curMonth = ( '00' + ( curDateTime.getMonth() + 1 ) ).slice(-2);
  var curDate = ( '00' + curDateTime.getDate() ).slice(-2);
  var curHours = ( '00' + curDateTime.getHours() ).slice(-2);
  var curMinutes = ( '00' + curDateTime.getMinutes() ).slice(-2);

  var inputYear = yyyy;
  var inputMonth = ( '00' + mm ).slice(-2);
  var inputDate = ( '00' + dd ).slice(-2);
  var inputHours = ( '00' + HH ).slice(-2);
  var inputMinutes = ( '00' + MM ).slice(-2);


  // pattern1 nothing
  if ( pattern === "pattern1" ) {
    return curYear + "\/" + curMonth + "\/" + curDate + " " + curHours + ":" + curMinutes;
  
  // pattern2 9:00
  } else if (pattern === "pattern2" ) {
    return curYear + "\/" + curMonth + "\/" + curDate + " " + inputHours + ":" + inputMinutes;
    
  // pattern3 5/18 9:00  
  } else if (pattern === "pattern3" ) {
    return curYear + "\/" + inputMonth + "\/" + inputDate + " " + inputHours + ":" + inputMinutes;
    
  // pattern4 2018/5/18 9:00
  } else if (pattern === "pattern4" ) {
    return inputYear + "\/" + inputMonth + "\/" + inputDate + " " + inputHours + ":" + inputMinutes;
  }
  
}

function parseText(slack_text){

  var arySlackText = slack_text.split(" ");

  if ( !arySlackText[1] ) {
    var return_text = getDateTime("pattern1","yyyy","mm","dd","HH","MM");
    
  } else if ( arySlackText[1].match(/^([01]?[0-9]|2[0-9]|3[0-9]|4[0-7]):([0-5][0-9])$/) ) {
    var aryTime = arySlackText[1].split(":");
    var return_text = getDateTime("pattern2","yyyy","mm","dd",aryTime[0],aryTime[1]);

  } else if ( arySlackText[1].match(/^([0-9]|[0-1][0-9])\/([0-9]|[0-3][0-9])$/) ) {
    var aryDate = arySlackText[1].split("\/");
    var aryTime = arySlackText[2].split(":");
    var return_text = getDateTime("pattern3","yyyy",aryDate[0],aryDate[1],aryTime[0],aryTime[1]);
    
  } else if ( arySlackText[1].match(/^(20[0-9][0-9])\/([0-9]|[0-1][0-9])\/([0-9]|[0-3][0-9])$/) ) {
    var aryDate = arySlackText[1].split("\/");
    var aryTime = arySlackText[2].split(":");
    var return_text = getDateTime("pattern3",aryDate[0],aryDate[1],aryDate[2],aryTime[0],aryTime[1]);
    
  } else {
    var return_text = "つーか 間違うとんねん ボケ"
  
  }

  return return_text;

}


// doPOSTイベントハンドラ
function doPost(e) {

  // Slackトークンと合わない場合は何もしない
  var slack_token = e.parameter.token;
  if (slack_token != "BOBHhzHQHYCDb8quN7SimC6s") { return; }

  // botの場合は何もしない
  var slack_username = e.parameter.user_name;
  if (slack_username === "slackbot") { return; }

  // SlackからPOSTされたデータから、textフィールドを格納
  var slack_text = e.parameter.text;

  // textフィールドに含まれる文字列により条件分岐
  //function inputSS(inputType,slackUserName,targetDate,inputStrings)
  if ( slack_text.match(/おは|モーニン|morning|早|hi|gm|in|出勤/) ) {
    var return_datetime = parseText(slack_text);
    var aryReturnDatetime = return_datetime.split(" ");
    inputSS("in",slack_username,aryReturnDatetime[0],aryReturnDatetime[1]);
    var message = "@" + slack_username + " おはようさん\n" + return_datetime;
    
  } else if ( slack_text.match(/おつ|バイ|乙|疲|by|gn|gb|cu|out|退勤/) ) {
    var return_datetime = parseText(slack_text);
    var aryReturnDatetime = return_datetime.split(" ");
    var aryTargetDate = aryReturnDatetime[0].split("\/");
    inputSS("out",slack_username,aryReturnDatetime[0],aryReturnDatetime[1]);
    var message = "@" + slack_username + " おつかれさん\n" + return_datetime + "\n" + outputSS2(slack_username,aryTargetDate[0],aryTargetDate[1]);
    
  } else if ( slack_text.match(/メモ|mem|備考/) ) {
    var message = "@" + slack_username + " メモしといたで";
    
  } else if ( slack_text.match(/サマリ|sum|概要|よこせ|教えろ|おしえろ|rep/) ) {
    // おしえろ 2018/5
    var aryPostText = slack_text.split(" ");
    var aryTargetDate = aryPostText[1].split("\/");
    var message = "@" + slack_username + "ほらよ\n" + outputSS(slack_username,aryTargetDate[0],aryTargetDate[1]);

  } else if ( slack_text.match(/使い方|help|ヘルプ/) ) {
    var message = "@" + slack_username
                  + " めんどくさいことさすなや！ボケ！!\n\n"
                  + "当日9時の出勤:おはようございます 9:00\n指定日10時の出勤:おはよう 5/1 10:00\n\n" 
                  + "指定日17時半の退勤:お疲れ様です 2018/5/1 17:30\n当日25時の退勤:乙 25:00\n\n"
                  + "2018年5月のngtlck919の勤務状況:おしえろ 2018/05\n\n"
                  + "その他会話例:\nおはようございます おはよう おは グッドモーニング グッモーニン good morning お早よう hi gm in 出勤\n\nおつかれさまでした おつかれ おつ グッバイ バイ 乙 お疲れ 疲 by gn gb cu out 退勤\n\n教えろ おしえろ サマリ summary sum 概要 よこせ 教えろ おしえろ";
    
  } else {
    var message = "@" + slack_username + " 用ないなら呼ぶなや ヒマか";
    
  }

  postSlack(message)

}


