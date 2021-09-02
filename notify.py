# -*- coding: utf-8 -*-

import smtplib,traceback,os,requests,urllib,json,hmac,hashlib,base64,time
from email.mime.text import MIMEText
from urllib import parse

#返回要推送的通知内容
#对markdown的适配要更好
#增加文件关闭操作
def readFile(filepath):
    content = ''
    with open(filepath, encoding='utf-8') as f:
        for line in f.readlines():
            content += line + '\n\n'
    return content

#返回要推送的通知内容
#对text的适配要更好
#增加文件关闭操作
def readFile_text(filepath):
    content = ''
    with open(filepath, encoding='utf-8') as f:
        for line in f.readlines():
            content += line
    return content

#返回要推送的通知内容
#对html的适配要更好
#增加文件关闭操作
def readFile_html(filepath):
    content = ''
    with open(filepath, "r" , encoding='utf-8') as f:
        for line in f.readlines():
            content += line + '<br>'
    return content

#邮件推送api来自流星云
#备用方案推送api来自BER
def sendEmail(email):
    try:
        #要发送邮件内容
        content = readFile('./log.txt')
        #接收方邮箱
        receivers = email
        #邮件主题
        subject = 'HeytapTask每日报表'
        param1 = '?address=' + receivers + '&name=' + subject + '&certno=' + content
        param2 = '?to=' + receivers + '&title=' + subject + '&text=' + content
        res1 = requests.get('http://liuxingw.com/api/mail/api.php' + param1)
        res1.encoding = 'utf-8'
        res1 = res1.json()
        if res1['Code'] == '1':
            print(res1['msg'])
        else:
            #备用推送
            requests.get('https://email.berfen.com/api' + param2)
            print('email push BER')
            #这里不知道为什么，在很多情况下返回的不是 json，
            # 但在测试过程中成功率极高,因此直接输出
    except Exception as e:
        print('邮件推送异常，原因为: ' + str(e))
        print(traceback.format_exc())

#钉钉群自定义机器人推送
def sendDing(webhook,secret):
    try:
        timestamp = str(round(time.time() * 1000))
        if secret != None: #钉钉机器人设置 加签 - 密钥
            timestamp = str(round(time.time() * 1000))
            secret_enc = secret.encode('utf-8')
            string_to_sign = '{}\n{}'.format(timestamp, secret)
            string_to_sign_enc = string_to_sign.encode('utf-8')
            hmac_code = hmac.new(secret_enc, string_to_sign_enc, digestmod=hashlib.sha256).digest()
            sign = urllib.parse.quote_plus(base64.b64encode(hmac_code))
            webhook = webhook + "&timestamp=" + timestamp + "&sign=" + sign
        content = readFile('./log.txt')
        data = {
            'msgtype': 'markdown',
            'markdown': {
                'title': 'HeytapTask每日报表',
                'text': content
            }
        }
        headers = {
            'Content-Type': 'application/json;charset=utf-8'
        }
        res = requests.post(webhook,headers=headers,json=data)
        res.encoding = 'utf-8'
        res = res.json()
        print('dinngTalk push : ' + res['errmsg'])
    except Exception as e:
        print('钉钉机器人推送异常，原因为: ' + str(e))
        print(traceback.format_exc())

#发送Tg通知
def sendTg(tgToken,tgUserId,tghost):
    try:
        token = tgToken
        chat_id = tgUserId
        #发送内容
        content = readFile_text('./log.txt')
        data = {
            'HeytapTask每日报表':content
        }
        content = urllib.parse.urlencode(data)
        #TG_BOT的token
        #token = os.environ.get('TG_TOKEN')
        #用户的ID
        #chat_id = os.environ.get('TG_USERID')
        if tghost == None:
            url = f'https://api.telegram.org/bot{token}/sendMessage?chat_id={chat_id}&text={content}'     
        else:
            url = f'https://{tghost}/bot{token}/sendMessage?chat_id={chat_id}&text={content}' 
        session = requests.Session()
        resp = session.post(url)
        print(resp)
    except Exception as e:
        print('Tg通知推送异常，原因为: ' + str(e))
        print(traceback.format_exc())

#发送push+通知
def sendPushplus(token):
    try:
        #发送内容
        data = {
            "token": token,
            "title": "HeytapTask每日报表",
            "content": readFile_html('./log.txt')
        }
        url = 'http://www.pushplus.plus/send'
        headers = {'Content-Type': 'application/json'}
        body = json.dumps(data).encode(encoding='utf-8')
        resp = requests.post(url, data=body, headers=headers)
        print(resp)
    except Exception as e:
        print('push+通知推送异常，原因为: ' + str(e))
        print(traceback.format_exc())

#企业微信通知，普通微信可接收
def sendWechat(wex_id,wex_secret,wx_agentld):
    #获得access_token
    url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken'
    token_param = '?corpid=' + wex_id + '&corpsecret=' + wex_secret
    token_data = requests.get(url + token_param)
    token_data.encoding = 'utf-8'
    token_data = token_data.json()
    access_token = token_data['access_token']
    #发送内容
    content = readFile_text('./log.txt')
    #创建要发送的消息
    data = {
        "touser": "@all",
        "msgtype": "text",
        "agentid": wx_agentld,
        "text": {"content": content}
    }
    send_url = 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + access_token
    message = requests.post(send_url,json=data)
    message.encoding = 'utf-8'
    res = message.json()
    print('Wechat send : ' + res['errmsg'])

#发送IFTTT通知
def sendIFTTT(ifttt_apiKey,ifttt_eventName):
    try:
        content = readFile('./log.txt')
        body = { ifttt['subjectKey']: 'HeytapTask每日报表', ifttt['contentKey']: content }
        url = 'https://maker.ifttt.com/trigger/{event_name}/with/key/{key}'.format(event_name=ifttt_eventName, key=ifttt_apiKey)
        response = requests.post(url, json=body)
        print(response)
    except Exception as e:
        print('IFTTT通知推送异常，原因为: ' + str(e))
        print(traceback.format_exc())

#发送Bark通知
def sendBark(Barkkey1,Barksave1):
    #发送内容
    Barkkey = Barkkey1
    Barksave = Barksave1
    content = readFile_text('./log.txt')
    data = {
        "title": "HeytapTask每日报表",
        "body": content
    }
    headers = {'Content-Type': 'application/json;charset=utf-8'}
    url = f'https://api.day.app/{Barkkey}/?isArchive={Barksave}'
    session = requests.Session()
    resp = session.post(url, json = data, headers = headers)
    state=json.loads(resp.text)
    print(state)
