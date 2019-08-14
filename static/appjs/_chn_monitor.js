
/**
 * 频道监控数据
 * @param 
 * @return Json  
 */
 
var TOOL_CHNMONITORLIST = function (options) {
    this.init(options);
};

TOOL_CHNMONITORLIST.prototype = {

    constructor: TOOL_CHNMONITORLIST,

    init: function (options) {
   
        this.options = options;
        this.queryParams = {
    		idc:options.idc,
            status:options.status,
    		channel:options.channel
        };
        
        var that = this;
        this.dataTable = $("#table_channel_monitor_list").dataTable({
            bProcessing: true,
            bServerSide: true,
            bSort: false,
            bFilter: false,
            bAutoWidth: false,// 宽带自适应
            sAjaxSource:that.options.host+"/queryChnMonitor.do",
            aoColumns: [
				 { sTitle: '<label class=\"checkbox\"><input type="checkbox" class="group-checkable"/></label>',
                    mData: null,
                    sWidth: "8px",
                    fnRender: function (obj) {
                    	var arr=new Array();
                    	arr.push('<label class=\"checkbox\">');
                        arr.push('<input type="checkbox" name="cpId" ');
                        arr.push('class="checkboxes" id="' + obj.aData.id + '" ');
                        arr.push('status="' + obj.aData.status + '" ');
                        arr.push('value="' + obj.aData.id + '" />');
                        arr.push('</label>');
                    	return arr.join("");
                    }
                }, 
                { sTitle: "操作", mData: null,sWidth: "120px",
                    fnRender: function (obj) {
                    	
                    var id=obj.aData.id;     
					var idc=obj.aData.idc; 
					var thr_time=obj.aData.thr_time; 
					var channel=obj.aData.channel; 
					var status=obj.aData.status; 

                    var arr=new Array();
                    arr.push('<p  id="'+id+'" ');
					arr.push('idc="'+idc+'" ');
					arr.push('channel="'+channel+'" ');
					arr.push('thr_time="'+thr_time+'" ');
					arr.push('status="'+status+'" >');
                    arr.push('<button class="btn btn-success" name="chn_monitor_detail">');
                    arr.push('编辑');
					arr.push('</button>');
					arr.push('<button class="btn btn-info" name="chn_history_detail" >');
                    arr.push('历史');
                    arr.push('</button>');

                    arr.push('</p>');
                    
                    return arr.join("");
                   }
                }, 
			    {sTitle: "机房名称", mData: "idc"}, 		
                {sTitle: "频道", mData: "channel"},
                {sTitle: "状态",mData: null,fnRender: function (obj) {
					var status=obj.aData.status;
                    return that.formartStatus(status);
                }},
			    {sTitle: "报警阈值", mData: "thr_time"},
			    {sTitle: "local(s)", mData: "local"},
                {sTitle: "PROBE_TIME", mData: "probe_time"}
            ],
            fnServerParams: function (aoData) {
                $.each(that.queryParams, function (key, value) {
                    aoData.push({name: key, value: value});
                });
            },
            fnServerData: function (sSource, aoData, fnCallback, oSettings) {
                oSettings.jqXHR = $.ajax({
                    url: sSource,
                    type: "post",
                    dataType: "json", 
                    data: aoData,
                    async:false,
                    success: fnCallback
                });
            },
            fnPreDrawCallback : function () {
                $("body").modalmanager("loading");
            },
            fnDrawCallback: function () {
                that.tableFinish();
            }
        });
        
        // modify table per page dropdown
        jQuery("#table_channel_monitor_list_wrapper .dataTables_length select").addClass("m-wrap small");
        
        /*$("#table_channel_monitor_list [type=checkbox]").each(function () {
            var status=$(this).attr('status');
			if(status=="3"||status==3){
			   $(this).parent().parent().parent('tr').css("background-color","red");
			}
        });*/

        //复选框全选
        $("#table_channel_monitor_list .group-checkable").change(function () {
            var checked = $(this).is(":checked");
            $("#table_channel_monitor_list input[type=checkbox][name=cpId]").each(function () {
                
                if (checked) {
                    $(this).attr("checked", true);
                    $(this).closest("span").addClass("checked");
                } else {
                    $(this).attr("checked", false);
                    $(this).closest("span").removeClass("checked");
                }

            });
        });
   
	    // 查询事件
        $("#action_channel_monitor_search").on("click", function () {
           
		   $(this).button('loading');		
           that.searchChnMonitorList();
        });
        
        $("#action_channel_monitor_search").on("keypress", function () {
            
			if(event.keyCode==13) {
                $(this).button('loading');
                that.searchChnMonitorList();
            }
        });
           
        $("#cp_idc_id").on("change", function () {

            that.searchChnMonitorList();
        });

		$("#cp_status").on("change", function () {

            that.searchChnMonitorList();
        });
        
        // 添加频道信息
        $("#action_channel_monitor").on("click", function () {
            $("#form_chn_monitor_detail")[0].reset();
			$("#div_status").addClass('hide');
			$("#modal_channel_monitor_list").modal({backdrop: "static", width: 800, maxHeight: ($(window).height() - 160)});
        });

        // 保存服务器
        $("#action_chn_monitor_save").on("click", function () {
            
			$("#action_chn_monitor_save").button('loading');
            var data = {};
			
            if ($("#txt_channel").val()=="")
            {
				alert("频道名称不能为空！");
				return;
            }

            $("#form_chn_monitor_detail input").each(function (index) {
                data[this.name] = $(this).val();
            });
            
			$("#form_chn_monitor_detail select").each(function (index) {
                data[this.name] = $(this).val();
            });

			var id=$("#hdchnmonitorid").val();
	
			if(id==""){

				if(that.isExitsChannel(data['channel'])){
                	alert("频道已经存在！");
					$("#action_chn_monitor_save").button('reset');
                	return;
                }
                data["status"]=1;// 初始化状态
				$.ajax({
					url:that.options.host+"/insertChnMonitor.do",
					type: "post",
					data: data,
					success: function (json) {
						that.tableRefresh();
						$("#modal_channel_monitor_list").modal('hide');
					}
				});

			 }else{
                 
				 data['id']=id;

                 if($("#hdchannel").val()!=data['channel']){
            		
            		if(that.isExitsChannel(data['channel'])){
                    	alert("频道已经存在！");
						$("#action_chn_monitor_save").button('reset');
                    	return;
                    }
            	 }

				 $.ajax({
					url:that.options.host+"/updateChnMonitor.do",
					type: "post",
					data: data,
					success: function (json) {
						that.tableRefresh();
						$("#modal_channel_monitor_list").modal('hide');
					}
				 });
			 }
        });


		$("#action_channel_time").on('click',function(){
			
			clearTimeout(timer); 
			clearTimeout(timer); 
			clearTimeout(timer); 
			alert("关闭刷新，开启刷新页面！");
       
		});

    },

    tableFinish: function () {

        var that = this;
  
        // 视频查看详情
        $("button[name=chn_monitor_detail]").on("click", function () {

            $("#form_chn_monitor_detail")[0].reset();

			var id=$(this).parent('p').attr("id");
			var idc=$(this).parent('p').attr("idc"); 
			var thr_time=$(this).parent('p').attr("thr_time");
			var channel=$(this).parent('p').attr("channel");
			var status=$(this).parent('p').attr("status");
            
            $("#hdchnmonitorid").val(id);
			$("#hdchannel").val(channel);

			$("#cp_form_idcid").val(idc); 
			$("#txt_channel").val(channel);
			$("#cp_thr_time").val(thr_time); 
			$("#cp_form_status").val(status); 

            $("#div_status").removeClass('hide');
			$("#modal_channel_monitor_list").modal({backdrop: "static", width: 800, maxHeight: ($(window).height() - 160)});

        });
		// 频道历史详情
        $("button[name=chn_history_detail]").on("click", function () {

			var channel=$(this).parent('p').attr("channel");
			$("#chn_history_temp").val(channel);
			
           	var start = $("#starttime").val();//开始时间
			var end = $("#endtime").val(); // 结束时间

			chnHistoryList.setQueryParams('start',start);
			chnHistoryList.setQueryParams('end',end);
            chnHistoryList.setQueryParams("channel",channel);
            chnHistoryList.tableRefresh();
			$("#modal_channel_history_list").modal({backdrop: "static", width: 800, maxHeight: ($(window).height() - 160)});

        });
		
		that.setTableTrRed()

        $("#action_chn_monitor_save").button('reset');
        $("#action_channel_monitor_search").button('reset');
        $('body').modalmanager('removeLoading');
        $('body').removeClass('modal-open');
	    //setTimeout(that.searchChnMonitorList(), 5000);
	//	timer = setTimeout("searchChnMonitorList()", 5000);
    },

	setTableTrRed: function(status){
		$("#table_channel_monitor_list [type=checkbox]").each(function () {
			var status=$(this).attr('status');
			if(status=="3"||status==3){
			   $(this).parent().parent().parent('tr').css("background-color","red");
			}
        });
	
	},

    setQueryParams: function (key, value) {
        this.queryParams[key] = value;
    },

    tableRefresh: function () {
        //this.dataTable.fnDraw();
		this.dataTable.fnPageChange( 'first', true ); 
    },
    deleteRow: function (row) {
        this.dataTable.fnDeleteRow(row);
    },
    tableSearch: function () {
    	this.dataTable.fnPageChange( 'first', true ); 
    }, 
    isExitsChannel:function(channel){
	      
		  var flag=false;

		  $.ajax({
			 url: this.options.host+"/isExists.do",
			 type: "post",
			 dataType: "json",
			 async: false,
			 data: {
				 "channel": channel
			 },
			 success: function (json) {
			   
                flag=json.code>0?true:false;
			 }
		  });

		  return flag;
	},
    searchChnMonitorList:function(){
    	
    	 var idc = $("#cp_idc_id option:selected").val()
		 var status = $("#cp_status option:selected").val()
		 var chanelName = $("#chanelName").val();
         
         var that = this;

         that.setQueryParams("idc",idc);
         that.setQueryParams("status",status);
		 that.setQueryParams("channel",chanelName);
         that.tableRefresh();

		 $("#table_channel_monitor_list [type=checkbox]").each(function () {
            var status=$(this).attr('status');
			if(status=="3"||status==3){
			   $(this).parent().parent().parent('tr').css("background-color","red");
			}
         });
    },
    loadIdcList:function(obj){

	    $.ajax({
			 url: this.options.host+"/queryIdcdata.do",
			 type: "post",
			 dataType: "json",
			 async: false,
			 data: {},
			 success: function (jsondata) {
                
			    if (jsondata.idcData) {
					var arrO=new Array();
					arrO.push('<option value="" selected="true" idcname="">');
					arrO.push('机房名称--全部');
					arrO.push('</option>');
					
					$.each(obj,function(i,value){
						value.empty();
					});
					
					$.each(obj,function(i,value){
						
						if(i.indexOf('key')>=0){
						   value.append(arrO.join(""));
						}
					});
					
					for ( var i = 0; i < jsondata.idcData.length; i++) {
						var idclist = jsondata.idcData[i];
						var arr = new Array();
						arr.push("<option value='"+idclist["idcname"]+"' ");
						arr.push("idcname="+ idclist["idcname"]);
						arr.push(" >");
						arr.push(idclist["idcname"]);
						arr.push("</option>");
						
						$.each(obj,function(i,value){
							value.append(arr.join(""));
						});
					}	
			    }
			 }
		 });
	},
    formartStatus:function(status){
    	
		
    	
		if(status==null){
    		return "";
    	}

    	var statusName="";
		var arr=new Array();
		arr.push('<span class="label ');
		switch (status) {
			  case 1:
					statusName = 'label-info">初始化';
					break;
			  case 2:
					statusName = 'label-success">正常';
					break;
			  case 3:
					statusName = 'label-warning">异常';
					break;
			  case 99:
					statusName = 'label-danger">暂停';
					break;
			  default:
					statusName = ' ">未知';
					break;
		}
        arr.push(statusName);
		arr.push('</span>');

    	return arr.join('');
    }
};


