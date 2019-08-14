#coding:utf-8
import os
from Log import *
LISTEN_PORT        =8090            #服务端口
CHN_STATUS_INIT    =1               #初始化值
CHN_STATUS_OK      =2               #正常状态
CHN_STATUS_ALERT   =3               #异常状态
CHN_STATUS_STOP    =99              #停止状态
log_name="chn_monitor_main.log"
log_dir="logs"

if not os.path.exists(log_dir):
    os.mkdir(log_dir)

logging = Logger(logname=os.path.join(log_dir,log_name), loglevel=1, logger="chn_monitor_main").getlog()
