# coding: utf-8
import sys
import json
import tornado.ioloop
import tornado.web
from multiprocessing import Process
import os
import time
import datetime
import logging
import threading
import subprocess
import re
import requests
import yaml
import torndb
import chn_monitor_db
import config

def _sendEmail(error_text, t, project):
    #return;
    global config;

    alert = {};
    subject = 'watcher time: %f' % (t);
    url = "http://******:8080/sys-asset-manage/api/watcher_report.do"
    alert["subject"] = subject;
    alert["content"] = error_text;
    alert["project"] = project;

    value = json.dumps(alert,
        sort_keys = True, indent = 4);

    alert_data = {};
    alert_data["alert"] = value;
    config.logging.error("alert: %s", json.dumps(alert_data));

    try:
        config.logging.info(url);
        requests.post(url, data = alert_data, timeout = 6);
    except requests.exceptions.RequestException as e:
        config.logging.error("POST alert error %s", url);
liveinfo_lock = threading.Lock();
liveinfo = {};
#ip, channel, pr, se, time
class GLiveInfo():
    def __init__(self):
        self.ip = "";
        self.idc = "";
        self.channel = "";
        self.probe_time = "";
        self.delta = "";

class GLiveProbe(threading.Thread):
    def __init__(self, ip, m3u8_list):
        threading.Thread.__init__(self);
        self.alert = dict();
        self.epg_alert = None;
        self.m3u8_list = m3u8_list;
        self.ip = ip;
        self.m3u8_list_temp=list()              #add gyy

    def alertFilter(self, url):
        _now = int(time.time());
        lastTime = self.alert.get(url);
        #print url, lastTime;                              #remove gyy

        if lastTime == None:
            #print _now, lastTime;                          #remove gyy
            self.alert[url] = _now;
            lastTime = self.alert.get(url);
            #print _now, lastTime;
            return True;

        if _now - lastTime > 300:
            #print _now, lastTime;                            #remove gyy
            self.alert[url] = _now;
            return True;

        return False;

    def probe_epg(self):
        db = torndb.Connection(
            host = '******',
            database = **,
            user = '****',
            password = '****');

        #sql = 'select CHANNEL_CODE from LV_CHANNEL where IS_ONLINE=1 order by CHANNEL_CODE';
        sql = 'select CHANNEL_NAME from LV_CHANNEL where IS_ONLINE=1 order by CHANNEL_NAME';
        _all = None;
        try:
            _all = db.query(sql);
        except Exception,e:
            config.logging.error("probe_epg.connect db err,e=[%]" %(e));
            return;
        __all = list();
        for v in _all:
            __all.append(v.CHANNEL_NAME);
        sql = 'select CHN_NAME from LV_EPG where (START_TIME<now() or START_TIME=now()) and (END_TIME>now()) order by CHN_CODE';
        _online = None;
        try:
            _online = db.query(sql);
        except:
            return;
        __online = list();
        for v in _online:
            __online.append(v.CHN_NAME);

        if len(__all) != len(__online):
            _diff1 = [val for val in __all if val not in __online];
            _diff2 = [val for val in __online if val not in __all];

            _now = int(time.time());

            delta = 65535;
            __diff1 = ','.join(_diff1);
            __diff2 = ','.join(_diff2);

            #error_text = "live epg error, all(%d):%s, online(%d):%s, d1:%s d2:%s\n" % (len(__all), __all, len(__online), __online, __diff1, __diff2);
            error_text = "live epg error, %s: no epg info\n" % (__diff1);

            if self.alertFilter("live"):
                if self.epg_alert == None:
                    self.epg_alert = _now;
                    #_sendEmail(error_text, delta, 'live');
                    return;

                if _now - self.epg_alert > 300:
                    self.epg_alert = _now;
                    #_sendEmail(error_text, delta, 'live');
                    return;

    def probe2(self, m3u8s_info_list):                 #m3u8s-----[(id,status,local,idc,channel...),(),().....]
        info_list = [];
        for m3u8 in m3u8s_info_list:
            url = m3u8[4];
            (channel, delta, _now,_time) = test_ts(url);              #delta:local;_now:probe_time
            try:
                Temp_db = chn_monitor_db.channel_db()
                if int(delta)>int(m3u8[6]):
                    Temp_db.Update_Info_ByChannel(channel,delta,_now,config.CHN_STATUS_ALERT) #状态3代表异常
                else:
                    Temp_db.Update_Info_ByChannel(channel,delta,_now,config.CHN_STATUS_OK) #状态2代表正常
            except Exception,e:
                config.logging.error("probe2.Update_Info_ByChannel error,e=[%s]" %(e))
            if delta > int(m3u8[6]):  #300
                try:
                    Temp_db = chn_monitor_db.channel_db()
                    Temp_db.Insert_Alert_ByChannel(m3u8[3],channel,_time)
                    if self.alertFilter(url):               #控制5分钟发1次邮件2016.01.11
                        error_text = "live local(s) %s alert:%s:%s\n" % (delta, m3u8[3],url);
                        _sendEmail(error_text, delta, 'live');
                except Exception,e:
                    config.logging.error("probe2.sendemail error,e=[%s]" %(e))
            else:
                try:
                    Temp_db = chn_monitor_db.channel_db()
                    Temp_db.Update_Alert_ByChannel(m3u8[3],channel,_now)
                except Exception,e:
                    config.logging.error("probe2.email-time less 5min error,e=[%s]" %(e))

        return info_list;

    def probe(self, ip):
        url = "http://" + ip + "/m3u8_conf/channel.xml";
        return test_m3u8(ip, url);

    def probe1(self, idc, ip):
        info_list = [];
        channels = self.FetchEPG();
        for channel in channels:
            url = 'http://%s/%s' % (ip, channel);

            (channel, delta, _now) = test_ts(url);
            info = GLiveInfo();
            info.ip = ip;
            info.probe_time = time.ctime(_now);
            info.channel = channel;
            info.local = "%s" % delta;
            info.idc = idc;
            info_list.append(info);

        return info_list;

    def FetchEPG(self):
        epg = None;
        url = 'http://********/tagNewestEpgList/ZJ_CMCC/1/100/0.json';
        res = requests.get(url, timeout = (5,10));
        ret = res.status_code == 200;
        text = res.text;

        if ret == False or text == None:
            return epg;

        epg_data = json.loads(text);
        epg_list = epg_data['data'];

        channels = [];
        for e in epg_list:
            channel = e['chnCode'];
            channels.append('gitv_live/%s/%s.m3u8' % (channel, channel));

        return channels;
        #sample = '/gitv_live/G_HUNAN-HD/G_HUNAN-HD.m3u8';

    def run0(self):
        skip_times = 0;
        info_list = [];
        while 1:
            try:
                info_db = chn_monitor_db.channel_db()
                sql_info = ("SELECT * FROM monitor_channel WHERE STATUS!='%s' AND IDC='%s'" %(config.CHN_STATUS_STOP,self.ip))
                result = info_db.the_db.execute(sql_info)
                self.m3u8_list_temp=[]
                for row in info_db.the_db.cur.fetchall():
                    self.m3u8_list_temp.append(row)
                info_db.the_db.close()
            except Exception,e:
                config.logging.error("mysql connect error error=%s" %(e))
                time.sleep(0.1)
            try:
                info_list = self.probe2(self.m3u8_list_temp); #[(id,dic,...),(),.....]
            except Exception,e:
                config.logging.error("run.probe2 error,e=[%s]" %(e))
                continue
            time.sleep(5);
            try:
                if skip_times < 12:
                    skip_times = skip_times + 1;
                else:
                    skip_times = 0;
                    self.probe_epg();
            except Exception,e:
                config.logging.error("run.probe_epg error,e=[%s]" %(e))
        config.logging.error("run has error,e=[%s]\nself.m3u8_list_temp=[%s]\ninfo_list=[%s]" %(e,self.m3u8_list_temp,info_list))

    def run1(self):
        ip_list = [];
        ip_list.append("********");

        f = open("cdn.yaml");
        config = yaml.load(f);
        cdn = config['cdn'];
        #print cdn;                             #remove gyy
        while 1:
            for e in cdn:
                #info_list = self.probe(ip);
                idc = e['idc'];
                for ip in e['ip']:
                    info_list = self.probe1(idc, ip);
                    liveinfo[ip] = info_list;
                    time.sleep(5);

def sendGet(url, headers):
    t1 = time.time();
    ret = False;
    msg = None;
    text = None;
    count = 3;
    while 1:
        try:
            res = requests.get(url, headers = headers, timeout = (5,10));
            ret = res.status_code == 200;
            text = res.text;
            if ret == False:
                msg = "url: %s, status_code %d" % (url, res.status_code);
            else:
                break;

        except requests.exceptions.RequestException as e:
            msg = "url: %s, error: %s" % (url, e);

        count = count - 1;
        if count == 0:
            break;

    t2 = time.time();

    return (ret, t2 - t1, msg, text);

def test_ts(url):
    #print url;
    (ret, t, msg, text) = sendGet(url, None);        #获取m3u8文件的内容，重点是text
    delta = 65535;
    _now = int(time.time());
    _time = int(time.time());
    try:
        if text != None:
            for line in reversed(text.split('\n')):       #取m3u8文件的最后一个ts的结束时刻
                if line.find(".ts") != -1:
                    line = line.strip();
                    ts = line.split('/')[-1];
                    if line.find("http://") != -1:
                        break
                    ts = ts.split('.')[0];
                    _time = int(ts.split('_')[2]);
                    _now = int(time.time());               #为什么要获取这个时刻的时间？
                    delta = _now - _time;
                    #break;
    except Exception,e:
        config.logging.error("test_ts error,e=[%s]" %(e))
    return (url, delta, _now,_time);                         #delta:local;_now:probe_time

def run(live_probe):
    skip_times = 0;
    info_list = [];
    while 1:
        try:
            info_db = chn_monitor_db.channel_db()
            sql_info = ("SELECT * FROM monitor_channel WHERE STATUS!='%s' AND IDC='%s'" %(config.CHN_STATUS_STOP,live_probe.ip))
            result = info_db.the_db.execute(sql_info)
            live_probe.m3u8_list_temp=[]
            for row in info_db.the_db.cur.fetchall():
                live_probe.m3u8_list_temp.append(row)
            info_db.the_db.close()
        except Exception,e:
            config.logging.error("mysql connect error error=%s" %(e))
            time.sleep(0.1)
        try:
            info_list = live_probe.probe2(live_probe.m3u8_list_temp); #[(id,dic,...),(),.....]
        except Exception,e:
            config.logging.error("run.probe2 error,e=[%s]" %(e))
            continue
        time.sleep(5);
        try:
            if skip_times < 12:
                skip_times = skip_times + 1;
            else:
                skip_times = 0;
                live_probe.probe_epg();
        except Exception,e:
            config.logging.error("run.probe_epg error,e=[%s]" %(e))
    config.logging.error("run has error,e=[%s]\nself.m3u8_list_temp=[%s]\ninfo_list=[%s]" %(e,live_probe.m3u8_list_temp,info_list))


ipdb = None;

def services_alert():
    reload(sys)
    sys.setdefaultencoding('utf8')
    #log_info_file = "alert.log"
    #logging.basicConfig(filename=log_info_file, level=logging.INFO)
    items = [];
    idc_list=list()
    try:
        sql_idc = "SELECT IDC FROM monitor_channel GROUP BY IDC"
        idc_db = chn_monitor_db.channel_db()
        result = idc_db.the_db.execute(sql_idc)
        for row in idc_db.the_db.cur.fetchall():
            idc_list.append(row[0])
    except Exception,e:
        cur = datetime.datetime.fromtimestamp(float(time.time())).strftime('%Y-%m-%d %H:%M:%S')
        config.logging.error("idc_list error e=%s sql_idc=%s time=%s" %(e,sql_idc,str(cur)))
    result = idc_db.query_channel_list(idc_list,items)
    for item in items:                       #返回结果为[[(id,local,idc,....),(),()],[()]]
        m3u8_list = list();
        idc = item[0][3]                     #表示机房
        print idc,item[0][0]
        m3u8_list = item
        live_probe = GLiveProbe(idc, m3u8_list);
        #live_probe.start();
        try:
            process = Process(target=run,args=(live_probe,))
            process.start()
        except Exception,e:
            print e
"""
if __name__=="__main__":
    services_alert()
"""
