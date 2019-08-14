/**
 * Created with IntelliJ IDEA.
 * User: Administrator
 * Date: 13-11-6
 * Time: 上午9:43
 * To change this template use File | Settings | File Templates.
 */

/**
 * 时间对象的格式化;
 */
Date.prototype.format = function(format) {

    /*
     * eg:format="YYYY-MM-dd hh:mm:ss";
     */
    var o = {
        "M+" :this.getMonth() + 1, // month
        "d+" :this.getDate(), // day
        "h+" :this.getHours(), // hour
        "m+" :this.getMinutes(), // minute
        "s+" :this.getSeconds(), // second
        "q+" :Math.floor((this.getMonth() + 3) / 3), // quarter
        "S" :this.getMilliseconds()
        // millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for ( var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }

    return format;
}

var Tools = {
    clone : function (myObj){
        if(typeof(myObj) != 'object') return myObj;
        if(myObj == null) return myObj;
        var myNewObj = new Object();
        for(var i in myObj){
            myNewObj[i] = this.clone(myObj[i]);
        }
        return myNewObj;
    },
    formatNumber:function(s){//111,222
        s = s+"";
        if(/[^0-9\.]/.test(s)) return s;
        s=s.replace(/^(\d*)$/,"$1.");
        s=s.replace(/(\d*\.\d\d)\d*/,"$1");
        s=s.replace(".",",");
        var re=/(\d)(\d{3},)/;
        while(re.test(s))
            s=s.replace(re,"$1,$2");
        s=s.replace(/,(\d\d)$/,".$1");
        return s.replace(/^\./,"0.").substring(0, s.length-1);
   }
}

var Map = function (){

    var struct = function(key, value) {
        this.key = key;
        this.value = value;
    }

    var put = function(key, value){
        for (var i = 0; i < this.arr.length; i++) {
            if ( this.arr[i].key === key ) {
                this.arr[i].value = value;
                return;
            }
        }
        this.arr[this.arr.length] = new struct(key, value);
    }

    var get = function(key) {
        for (var i = 0; i < this.arr.length; i++) {
            if ( this.arr[i].key === key ) {
                return this.arr[i].value;
            }
        }
        return null;
    }

    var remove = function(key) {
        var v;
        for (var i = 0; i < this.arr.length; i++) {
            v = this.arr.pop();
            if ( v.key === key ) {
                continue;
            }
            this.arr.unshift(v);
        }
    }

    var removeAll = function() {
        var v;
        for (var i = 0; i < this.arr.length; i++) {
            v = this.arr.pop();
            this.arr.unshift(v);
        }
    }

    var size = function() {
        return this.arr.length;
    }

    var isEmpty = function() {
        return this.arr.length <= 0;
    }
    this.arr = new Array();
    this.get = get;
    this.put = put;
    this.remove = remove;
    this.removeAll = removeAll;
    this.size = size;
    this.isEmpty = isEmpty;
}
// 数字是否包含-------------
Array.prototype.S=String.fromCharCode(2);  
Array.prototype.in_array=function(e)  
{  
var r=new RegExp(this.S+e+this.S);  
return (r.test(this.S+this.join(this.S)+this.S));  
}  
// 计算当前日期在本年度的周数
Date.prototype.getWeekOfYear = function(weekStart) { // weekStart：每周开始于周几：周日：0，周一：1，周二：2 ...，默认为周日
    weekStart = (weekStart || 0) - 0;
    if(isNaN(weekStart) || weekStart > 6)
        weekStart = 0;

    var year = this.getFullYear();
    var firstDay = new Date(year, 0, 1);
    var firstWeekDays = 7 - firstDay.getDay() + weekStart;
    var dayOfYear = (((new Date(year, this.getMonth(), this.getDate())) - firstDay) / (24 * 3600 * 1000)) + 1;
    return Math.ceil((dayOfYear - firstWeekDays) / 7) + 1;
}

// 计算当前日期在本月份的周数
Date.prototype.getWeekOfMonth = function(weekStart) {
    weekStart = (weekStart || 0) - 0;
    if(isNaN(weekStart) || weekStart > 6)
        weekStart = 0;

    var dayOfWeek = this.getDay();
    var day = this.getDate();
    return Math.ceil((day - dayOfWeek - 1) / 7) + ((dayOfWeek >= weekStart) ? 1 : 0);
}
// 获取档期时间
function getCurentTime() {
	var now = new Date();

	var year = now.getFullYear(); // 年
	var month = now.getMonth() + 1; // 月
	var day = now.getDate(); // 日

	var hh = now.getHours(); // 时
	var mm = now.getMinutes(); // 分
	var ss = now.getSeconds(); // 分
	
	var clock = year + "-";

	if (month < 10)
		clock += "0";

	clock += month + "-";

	if (day < 10)
		clock += "0";

	clock += day + " ";

	if (hh < 10)
		clock += "0";

	clock += hh + ":";
	if (mm < 10)
		clock += '0';
	clock += mm + ":";
	if (ss < 10)
		clock += '0';
	clock += ss ;
	return (clock);
} 

//获取当前凌晨时间
function getMorningTime() {
	
	var now = new Date();
	var year = now.getFullYear(); // 年
	var month = now.getMonth() + 1; // 月
	var day = now.getDate(); // 日

	var hh = now.getHours(); // 时
	var mm = now.getMinutes(); // 分

	var clock = year + "-";

	if (month < 10)
		clock += "0";

	clock += month + "-";

	if (day < 10)
		clock += "0";

	clock += day + " "+ "00:00";

	return (clock);
} 

//获取昨天凌晨时间
function getDataTime(AddDayCount) {
	
	var now = new Date();
	now.setDate(now.getDate()+AddDayCount);
	
	var year = now.getFullYear(); // 年
	var month = now.getMonth() + 1; // 月
	var day = now.getDate(); // 日

	var hh = now.getHours(); // 时
	var mm = now.getMinutes(); // 分
	var ss = now.getSeconds(); // 秒
	
	var clock = year + "-";

	if (month < 10)
		clock += "0";

	clock += month + "-";

	if (day < 10)
		clock += "0";

	clock += day + " ";

	if (hh < 10)
		clock += "0";

	clock += hh + ":";
	if (mm < 10)
		clock += '0';
	clock += mm + ":";
	if (ss < 10)
		clock += '0';
	clock += ss ;
	return (clock);
} 


//获取n小时前时间
function getHoursDataTime(AddHours) {

		var now = new Date();
		now.setHours(now.getHours()+AddHours);
		
		var year = now.getFullYear(); // 年
		var month = now.getMonth() + 1; // 月
		var day = now.getDate(); // 日

		var hh = now.getHours(); // 时
		var mm = now.getMinutes(); // 分

		var clock = year + "-";

		if (month < 10)
			clock += "0";

		clock += month + "-";

		if (day < 10)
			clock += "0";

		clock += day + " ";

		if (hh < 10)
			clock += "0";

		clock += hh + ":";
		if (mm < 10)
			clock += '0';
		clock += mm;

	return (clock);
} 

function getlastweekDate()
{
   var nn=new Date();
   year1=nn.getYear();
   mon1=nn.getMonth()+1;
   date1=nn.getDate();
   
   var mm=new Date(year1,mon1-1,date1);
   var tmp1=new Date(2000,1,1);
   var tmp2=new Date(2000,1,15);
   var ne=tmp2-tmp1;
   var mm2=new Date();
   mm2.setTime(mm.getTime()-ne);
   
   year2=mm2.getYear();
   mon2=mm2.getMonth()+1;
   date2=mm2.getDate();
    
   if(mon2<10) 
    monstr2="0"+mon2;
   else
    monstr2=""+mon2;
     
   if(date2<10) 
     datestr2="0"+date2;
   else
     datestr2=""+date2;
    return year2+"-"+monstr2+"-"+datestr2;
}

//格式化Ip地址
function formatIpAddress(strips){
	var objstr="";
	if(strips==null){
		return objstr;
	}
	var strip=strips.split(';');
	for(var i=0;i<strip.length;i++){
		var arrIp=strip[i].split(',');
		for(var j=0;j<arrIp.length;j++){
			if(arrIp[1]==1){
				objstr+='<span class="label label-info">外网</span>'+arrIp[0]+";<br/>";
				break;
			}else if(arrIp[1]==2){
				objstr+='<span class="label label-success">内网</span>'+arrIp[0]+";<br/>";
				break;
			}else if(arrIp[1]==3){
				objstr+='<span class="label label-warning">管理</span>'+arrIp[0]+";<br/>";
				break;
			}else{
				objstr+='无';
			}
		}
	}
	return objstr;
}

//根据网络标示返回信息得到Ip地址
function getIpAddressByNetFlag(strips,netflag){
	var strip=strips.split(';');
	var objstr="";
	outerloop://命名外圈语句
	for(var i=0;i<strip.length;i++){
		var arrIp=strip[i].split(',');
		for(var j=0;j<arrIp.length;j++){
			if(arrIp[1]==netflag){
				objstr=arrIp[0];
				break outerloop;
			}
		}
	}
	return objstr;
}
// 获取用户权限
function getKeySecret(url){
	   var flag=0;
	   jQuery.ajax({
			type : "post",
			url : url+"/server/getKeySecret.do",
			dataType : "json",
			data : {},
			async: false,
			success : function(jsondata) {
				
				flag=jsondata;
				
			},
			error : function(err) {
				alert(err);
			}
		});
	   return flag;
}
// 取浮点小数点后保留两位小数
function changeTwoDecimal_f(x) {
    var f_x = parseFloat(x);
    if (isNaN(f_x)) {
        alert('function:changeTwoDecimal->parameter error');
        return false;
    }
    var f_x = Math.round(x * 100) / 100;
    var s_x = f_x.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
    }
    return s_x;
}

//比较时间大小---------------------
function checkEndTime(startTime, endTime) {
    var start = new Date(startTime.replace("-", "/").replace("-", "/"));
    var end = new Date(endTime.replace("-", "/").replace("-", "/"));
    if (end < start) {
        return false;
    }
    return true;
}
// 时间字符串格式转换实际时间格式
function getDate(strDate) {  
    var date = eval('new Date(' + strDate.replace(/\d+(?=-[^-]+$)/,  
     function (a) { return parseInt(a, 10) - 1; }).match(/\d+/g) + ')');  
    return date;  
} 
// 日期格式化星期
function getDayToWeek(strDate) {
	var ar = new Array();
	ar[0] = "星期日";
	ar[1] = "星期一";
	ar[2] = "星期二";
	ar[3] = "星期三";
	ar[4] = "星期四";
	ar[5] = "星期五";
	ar[6] = "星期六";
	var day = getDate(strDate);
	    day=day.getDay();
	return ar[day];
}

// 加载时间控件-----------------------
function loadDatetimePicker(objStart,objEnd,beginDay){
	
	objStart.datetimepicker({
        minView: "month",
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		
		
		forceParse: 0,
        showMeridian: 1,
        language: 'zh-CN'
	}).on('changeDate', function(ev){
		
		var starttime=objStart.val();

		objEnd.datetimepicker('setStartDate',starttime);
		objStart.datetimepicker('hide');
	});

	objEnd.datetimepicker({
        minView: "month",
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
	
		forceParse: 0,
        showMeridian: 1,
        language: 'zh-CN'
	}).on('changeDate', function(ev){
		
		var starttime=objStart.val();
		var endtime=objEnd.val();
		
		if(starttime!=""&&endtime!=""){
		  if(!checkEndTime(starttime,endtime)){
			 objEnd.val('');
			 alert("开始时间大于结束时间！");
		     return;
		   }
		}

		objStart.datetimepicker('setEndDate',endtime);
		objEnd.datetimepicker('hide');
	});
	 
}

//设置延时函数
function sleep(numberMillis) {
	var now = new Date();
	var exitTime = now.getTime() + numberMillis;
	while (true) {
		now = new Date();
		if (now.getTime() > exitTime)
			return;
	}
}
