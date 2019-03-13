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

function doPost(e) {

  // Slackトークンと合わない場合は何もしない
  var slack_token = e.parameter.token;
  if (slack_token != "Y41tTO2TW4W6AAQWL23yrgxt") { return; }

  // botの場合は何もしない
  var slack_username = e.parameter.user_name;
  if (slack_username === "slackbot") { return; }

  // SlackからPOSTされたデータから、textフィールドを格納
  var slack_text = e.parameter.text;

console.log(e.parameter);
Logger.log(e.parameter);
  
  var message = "@" + slack_username + "\n" + slack_text;

  postSlack(message)

}
