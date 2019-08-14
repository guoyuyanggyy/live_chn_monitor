#!/usr/bin/python
# coding: utf-8
import sys
import os
import time
import json
import logging
import requests
import tornado
import tornado.ioloop
import tornado.web
import tornado.httpserver
import chn_monitor_db
import config
import services
from Log import *

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("chn_monitor.html")

class QueryChnMonitorHandler(tornado.web.RequestHandler):
    def get(self):
        self.handle()

    def post(self):
        self.handle()

    def handle(self):

        param_idc      = self.get_argument("idc")
        param_status   = self.get_argument("status")
        param_channel  = self.get_argument("channel")
        page_index = self.get_argument("iDisplayStart", None)
        page_capacity = self.get_argument("iDisplayLength", None)
        config.logging.info('QueryChnMonitorHandler:param_idc=%s,param_status=%s,param_channel=%s' % (param_idc,param_status,param_channel))
        project_mo_db = chn_monitor_db.channel_db();
        result = project_mo_db.Query_Channel_Info(param_idc,param_status,param_channel,page_index,page_capacity);
        return self.write(result)

class queryIdcdataHandler(tornado.web.RequestHandler):
    def get(self):
        self.handle()

    def post(self):
        self.handle()

    def handle(self):

        url = "http://*****:8080/sys-asset-manage/idc/goAssetIdcList.do"
        req = requests.post(url)
        result = req.text
        return self.write(result)

class insertChnMonitorHandler(tornado.web.RequestHandler):
    def get(self):
        self.handle()

    def post(self):
        self.handle()

    def handle(self):

        param_idc      = self.get_argument("idc")
        param_status   = self.get_argument("status")
        param_channel  = self.get_argument("channel")
        param_thr_time  = self.get_argument("thr_time")
        #print param_status
        project_mo_db = chn_monitor_db.channel_db();
        result = project_mo_db.Insert_Channel_info(param_idc,param_channel,param_thr_time,param_status);
        result = {"code":result}
        return self.write(result)

class updateChnMonitorHandler(tornado.web.RequestHandler):
    def get(self):
        self.handle()

    def post(self):
        self.handle()

    def handle(self):

        param_id       = self.get_argument("id")
        param_idc      = self.get_argument("idc")
        param_status   = self.get_argument("status")
        param_channel  = self.get_argument("channel")
        param_thr_time  = self.get_argument("thr_time")
        #print param_status
        config.logging.info('updateChnMonitorHandler:param_id=%s,param_idc=%s,param_status=%s,param_channel=%s,param_thr_time=%s' % (param_id,param_idc,param_status,param_channel,param_thr_time))
        project_mo_db = chn_monitor_db.channel_db();
        result = project_mo_db.Update_Channel_Info(param_id,param_idc,param_status,param_channel,param_thr_time);
        result = {"code":result};
        return self.write(result)

class queryChnHistoryHandler(tornado.web.RequestHandler):
    def get(self):
        self.handle()

    def post(self):
        self.handle()

    def handle(self):
        param_channel  = self.get_argument("channel")
        param_start = str(self.get_argument("start", None))
        param_end = str(self.get_argument("end", None))

        page_index = self.get_argument("iDisplayStart", None)
        page_capacity = self.get_argument("iDisplayLength", None)
        project_His_db = chn_monitor_db.channel_db();
        result = project_His_db.Query_History_Info(param_channel,param_start,param_end,page_index,page_capacity);
        return self.write(result)

class isExistsHandler(tornado.web.RequestHandler):
    def get(self):
        self.handle()

    def post(self):
        self.handle()

    def handle(self):

        param_channel  = self.get_argument("channel")
        #print param_status
        #config.logging.info('isExitsHandler:param_channel=%s' % (param_channel))
        project_mo_db = chn_monitor_db.channel_db();
        result = project_mo_db.isExist(param_channel);
        result= {"code":result};
        return self.write(result)     



settings = dict(
  template_path=os.path.join(os.path.dirname(__file__), "template"),
  static_path=os.path.join(os.path.dirname(__file__), "static"),
  Debug=True,
  )
  
application = tornado.web.Application([
    (r"/",                          MainHandler),    
    (r"/queryChnMonitor.do",        QueryChnMonitorHandler),        #地区、频道、状态
    (r"/insertChnMonitor.do",       insertChnMonitorHandler),       #地区、频道、状态
    (r"/updateChnMonitor.do",       updateChnMonitorHandler),       #
    (r"/queryIdcdata.do",           queryIdcdataHandler),           #返回idc数据
    (r"/isExists.do",               isExistsHandler),               #返回0或非0
    (r"/queryChnHistory.do",        queryChnHistoryHandler)
    ],
    **settings)

if __name__ == "__main__":
    reload(sys)  
    sys.setdefaultencoding('utf8')
    services.services_alert()
    config.logging.info('listen @%d ......' % (config.LISTEN_PORT))

    http_server = tornado.httpserver.HTTPServer(application);
    http_server.bind(config.LISTEN_PORT);
    http_server.start(6);
    tornado.ioloop.IOLoop.instance().start();

