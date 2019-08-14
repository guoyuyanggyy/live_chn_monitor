#coding: utf-8
import os
import time
import string
import logging
import json
import db
import config
import datetime
import requests
import config
class Album:
    def __init__(self):
        self.album_id           = ""
        self.album_name         = ""
        self.channel_name       = ""
        self.cp_id              = ""
        self.source_id          = ""
        self.source_name        = ""
        self.source_channel_id  = ""
        self.pic_url            = ""
        self.video_num          = 0
        self.video_list         = []
        # add 20150914
        self.director           = ""
        self.actor_list         = []
        self.area               = ""
        self.show_date          = ""
        self.sets_num           = 0
        self.duration           = 0
        self.album_description  = ""


class Video:
    def __init__(self):
        self.video_name         = ""
        self.cp_album_id        = ""
        self.cp_video_id        = ""
        self.bits_list          = []
        self.max_bits_id        = 0
        self.pic                = ""
        # add 20150914
        self.duration           = 0

class channel_db:

    def __init__(self):
        self.the_db = db.DB_MYSQL()
        try:
            self.the_db.connect(db.DB_CONFIG.host, db.DB_CONFIG.port, db.DB_CONFIG.user, db.DB_CONFIG.password, db.DB_CONFIG.db)
        except Exception, e:
            config.logging.error('chn_queryDb.Init(), error=[%s]' %(e))

    def  Insert_Channel_info(self,param_idc,param_channel,param_thr_time,param_status=1):
         now_time = time.localtime()
         now_time = time.strftime("%Y-%m-%d %H:%M:%S", now_time)
         result = -1
         param_local=-1
         one_sql  = "INSERT INTO monitor_channel(`STATUS`,`LOCAL`,`IDC`,`CHANNEL`,`THR_TIME`,`MODIFY_TIME`,`CREATE_TIME`) VALUES('%s','%s','%s','%s','%s','%s','%s')"  % \
                     (param_status,param_local,param_idc,param_channel,param_thr_time,now_time,now_time)
         try:
            result = self.the_db.execute(one_sql) ;
            self.the_db.commit();
            #config.logging.info("Insert_Channel_info result=[%s], sql=[%s]" % (result, one_sql))
         except Exception, e:
             config.logging.error('Insert_Channel_info error, error=[%s], sql=[%s]' %(e, one_sql))
         self.the_db.close()                                   #虽然调用次数少，感觉应该有关闭数据库连接的过程 
         return result

    def Update_Channel_Info (self,param_id,param_idc,param_status,param_channel,param_thr_time):
         now_time = time.localtime()
         now_time = time.strftime("%Y-%m-%d %H:%M:%S", now_time)
         result=-1
         one_sql =   ("UPDATE monitor_channel SET MODIFY_TIME='%s'" %(now_time))
         if (param_idc!=None and param_idc!=""):
            one_sql += (",IDC='%s' " %(param_idc))

         if (param_status!=None and cmp(param_status,"0")!=0 and param_status!=""):
            one_sql += (",STATUS='%s' " %(param_status))

         if (param_channel!=None and cmp(param_channel,"")!=0):
            one_sql += (",CHANNEL='%s' " %(param_channel))

         if (param_thr_time!=None and cmp(param_thr_time,"")!=0):
            one_sql += (",THR_TIME='%s' " %(param_thr_time))

         one_sql += (" WHERE `ID`= %s" %(param_id))

         try:
            result = self.the_db.execute(one_sql)
            self.the_db.commit();
            #config.logging.info("Update_Channel_Info result=[%d], sql=[%s]" % (result, one_sql))
         except Exception, e:
            config.logging.error('Update_Channel_Info, error=[%s], sql=[%s]' %(e, one_sql))
         self.the_db.close()                                   #虽然调用次数少，感觉应该有关闭数据库连接的过程 
         return result

    def Query_Channel_Info(self,param_idc,param_status,param_channel ,param_display_start,param_display_length):
        result = 0
        total_count = 0
        return_datas = {'iTotalRecords':total_count, 'iTotalDisplayRecords':total_count, 'aaData':[]}
        one_sql_count   = "select count(*) from monitor_channel where 1=1 "
        one_sql_records = "select * from monitor_channel where 1=1 "
        if (param_idc!=None and param_idc!=""):
            one_sql_count += ("AND IDC='%s' " %(param_idc))
            one_sql_records += ("AND IDC='%s' " %(param_idc))
        if (param_status!=None and cmp(param_status,"0")!=0 and param_status!=""):
            one_sql_count += ("AND STATUS='%s' " %(param_status))
            one_sql_records += ("AND STATUS='%s' " %(param_status))
        if (param_channel!=None and param_channel!=""):
            one_sql_count = one_sql_count+ ("AND CHANNEL LIKE '%")+param_channel+"%'"
            one_sql_records = one_sql_records+ ("AND CHANNEL LIKE '%")+param_channel+"%' "
        num_display_start = int(param_display_start)
        num_display_length =int( param_display_length)
        one_sql_records += "ORDER BY LOCAL DESC "
        one_sql_records += ("LIMIT %d, %d " %(num_display_start, num_display_length))
        #config.logging.info("sql_count=[%s], sql_records=[%s]" % (one_sql_count, one_sql_records))
        result = self.the_db.execute(one_sql_count)
        for row in self.the_db.cur.fetchall():
            total_count = row[0]
        #config.logging.info("result=[%d], total_count=[%d], sql=[%s]" % (result, total_count, one_sql_count))

        result = self.the_db.execute(one_sql_records)
        this_count = result
        #config.logging.info("result=[%d], sql=[%s]" % (result, one_sql_records))
        return_datas = {'iTotalRecords':total_count, 'iTotalDisplayRecords':total_count, 'aaData':[]}
        for row in self.the_db.cur.fetchall():
            one_records = {}
            one_records["id"]             = row[0];
            one_records["status"]         = row[1];
            one_records["local"]          = row[2];
            one_records["idc"]            = row[3];
            one_records["channel"]        = row[4];
            one_records["probe_time"]     = str(row[5]);
            one_records["thr_time"]       = row[6];
            one_records["modify_time"]    = str(row[7]);
            one_records["create_time"]    = str(row[8]);
            return_datas['aaData'].append(one_records)
        return (return_datas)

    def isExist(self,param_channel):
        now_ctime = time.localtime()
        now_ctime = time.strftime("%Y-%m-%d %H:%M:%S", now_ctime)
        result = 0
        try:
            sql = ("select * from monitor_channel where 1=1 AND CHANNEL='%s'" %(param_channel))
            result = self.the_db.execute(sql)
            #config.logging.info('isExist, sql=[%s] result=[%s]' %(sql,result))
        except Exception,e:
            #print e
            result =-1;
            config.logging.error('isExist error, error=[%s]' %(e))
        self.the_db.close()                                   #虽然调用次数少，感觉应该有关闭数据库连接的过程
        return result;

    def Update_Info_ByChannel(self,param_channel,param_local,param_probeTime,param_status):
         param_probeTime = datetime.datetime.fromtimestamp(float(param_probeTime)).strftime('%Y-%m-%d %H:%M:%S')
         result=-1
         one_sql1 = ("SELECT * FROM monitor_channel WHERE STATUS!='%s' AND CHANNEL='%s'" %(config.CHN_STATUS_STOP,param_channel))
         one_sql2 =   ("UPDATE monitor_channel SET LOCAL='%s',PROBE_TIME='%s',STATUS='%s' WHERE `CHANNEL`= '%s'" %(param_local,param_probeTime,param_status,param_channel))
         result = self.the_db.execute(one_sql1)
         if result>0:
             try:
                result = self.the_db.execute(one_sql2)
                self.the_db.commit();
                #config.logging.info("Update_Info_ByChannel result=[%d], sql=[%s]" % (result, one_sql2))
             except Exception, e:
                config.logging.error('Update_Info_ByChannel, error=[%s], sql=[%s]' %(e, one_sql2))
         #else:
             #config.logging.info('Update_Info_ByChannel false, this channel has stoped')
         self.the_db.close()                                   #虽然调用次数少，感觉应该有关闭数据库连接的过程
         time.sleep(0.1)
         return result

    def Insert_Alert_ByChannel(self,param_idc,param_channel,parame_tiem):
         result=1    #大于0表示当前已有报警状态,不用写入
         creat_time = datetime.datetime.fromtimestamp(float(parame_tiem)).strftime('%Y-%m-%d %H:%M:%S')
         #creat_time = parame_tiem
         one_sql1 = ("SELECT * FROM channel_alert WHERE IDC='%s' AND CHANNEL='%s' AND END_TIME is NULL"%(param_idc,param_channel))
         one_sql2 = ("INSERT INTO channel_alert(`IDC`,`CHANNEL`,`START_TIME`) VALUES('%s','%s','%s')" %(param_idc,param_channel,creat_time))
         try:
            result = self.the_db.execute(one_sql1)
         except Exception,e:
             config.logging.error("Insert_Alert_ByChannel select error sql=[%s],e=[%s]"%(one_sql1,e))
         if result<=0:
             #config.logging.info("Insert_Alert_ByChannel this alert has started and did not end,sql=%s"%(one_sql1))
         #else:
            try:
                 result = self.the_db.execute(one_sql2)
                 self.the_db.commit();
                 #config.logging.info("Insert_Alert_ByChannel result=[%d], sql=[%s]" % (result, one_sql2))
            except Exception, e:
                 config.logging.error('Insert_Alert_ByChannel, error=[%s], sql=[%s]' %(e, one_sql2))
         self.the_db.close()                                   #虽然调用次数少，感觉应该有关闭数据库连接的过程
         return result

    def Update_Alert_ByChannel(self,param_idc,param_channel,param_now):
         param_EndTime = datetime.datetime.fromtimestamp(float(param_now)).strftime('%Y-%m-%d %H:%M:%S')
         #one_sql2 = ("UPDATE channel_alert a,(SELECT ID FROM channel_alert WHERE IDC='%s' AND CHANNEL='%s' AND END_TIME is NULL)b SET END_TIME='%s' WHERE a.ID =b.ID"%(param_idc,param_channel,param_EndTime))
         one_sql2 = ("UPDATE channel_alert SET END_TIME='%s' WHERE IDC='%s' AND CHANNEL='%s' AND END_TIME is NULL"%(param_EndTime,param_idc,param_channel))
         try:
             result = self.the_db.execute(one_sql2)
             self.the_db.commit();
         except Exception, e:
             config.logging.error('Update_Alert_ByChannel, error=[%s], sql=[%s]' %(e, one_sql2))
         self.the_db.close()                                   #虽然调用次数少，感觉应该有关闭数据库连接的过程
         return result

    def query_channel_list(self,idc_list,items):
        try:
            for line in idc_list:
                items_temp = list()
                sql_channel = ("SELECT * FROM monitor_channel WHERE IDC='%s'" %(line))
                result = self.the_db.execute(sql_channel)
                for row in self.the_db.cur.fetchall():
                    items_temp.append(row)
                items.append(items_temp)
        except Exception,e:
            cur = datetime.datetime.fromtimestamp(float(time.time())).strftime('%Y-%m-%d %H:%M:%S')
            config.logging.error("query_channel_list error e=%s sql_channel=%s time=%s" %(e,sql_channel,str(cur)))
        return items

    def Query_History_Info(self,param_channel,param_start,param_end,param_display_start,param_display_length):
        total_count = 0
        #cur_time = str(datetime.datetime.fromtimestamp(float(time.time())).strftime('%Y-%m-%d %H:%M:%S'))
        return_datas = {'iTotalRecords':total_count, 'iTotalDisplayRecords':total_count, 'aaData':[]}
        one_sql_count   = "select count(*) from channel_alert where 1=1"
        one_sql_records = "select * from channel_alert where 1=1"
        if (param_channel!='0' and param_channel!='' and param_channel!=None):
            one_sql_count = one_sql_count+ (" AND CHANNEL ='")+param_channel+"'"
            one_sql_records = one_sql_records+ (" AND CHANNEL ='")+param_channel+"'"
        if(param_start!='' and param_start!=None and param_end!='' and param_end!=None):
            one_sql_count = one_sql_count+ (" AND START_TIME BETWEEN '")+param_start+"' AND '"+param_end+"'"
            one_sql_records = one_sql_records+ (" AND START_TIME BETWEEN '")+param_start+"' AND '"+param_end+"'"
        num_display_start = int(param_display_start)
        num_display_length =int( param_display_length)
        one_sql_records += " ORDER BY ID DESC"
        if (num_display_start!=0 and num_display_length!=0):
            one_sql_records += (" LIMIT %d, %d " %(num_display_start, num_display_length))
        #config.logging.info("sql_count=[%s], sql_records=[%s]" % (one_sql_count, one_sql_records))
        result = self.the_db.execute(one_sql_count)
        for row in self.the_db.cur.fetchall():
            total_count = row[0]
        #config.logging.info("result=[%d], total_count=[%d], sql=[%s]" % (result, total_count, one_sql_count))

        result = self.the_db.execute(one_sql_records)
        #config.logging.info("result=[%d], sql=[%s]" % (result, one_sql_records))
        return_datas = {'iTotalRecords':total_count, 'iTotalDisplayRecords':total_count, 'aaData':[]}
        for row in self.the_db.cur.fetchall():
            one_records = {}
            one_records["idc"]            = row[1];
            one_records["channel"]        = row[2];
            one_records["start_time"]     = str(row[3]);
            one_records["end_time"]       = str(row[4]);
            return_datas['aaData'].append(one_records)
        self.the_db.close()
        return (return_datas)


if __name__ == "__main__":
     '''
     param_channel_id="0";
     param_album_name="";
     director="";
     page_index=0;
     page_capacity=10;
     video_items=channel_db();
     video_items.Update_Channel_Info(1,'','','','')
     '''
     '''
     video_items=channel_db();
     video_items.Query_Channel_List();
     '''
