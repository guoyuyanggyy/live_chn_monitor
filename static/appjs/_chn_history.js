/**
 * 异常状态历史查询
 * @param 
 * @return Json  
 */
 
var TOOL_CHNHISTORYLIST = function (options) {
    this.init(options);
};

TOOL_CHNHISTORYLIST.prototype = {

    constructor: TOOL_CHNHISTORYLIST,

    init: function (options) {
   
        this.options = options;
        this.queryParams = {
    		channel:options.channel,
            start:options.start,
            end:options.end
        };
        var that = this;
        this.dataTable = $("#table_history_list").dataTable({
            bProcessing: true,
            bServerSide: true,
            bSort: false,
            bFilter: false,
            bAutoWidth: false,// 宽带自适应
            sAjaxSource:that.options.host+"/queryChnHistory.do",
            aoColumns: [
			    {sTitle: "机房名称", mData: "idc"}, 		
                {sTitle: "频道", mData: "channel"},
			    {sTitle: "断流时间", mData: "start_time"},
			    {sTitle: "恢复时间", mData: "end_time"}
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
        //按时间查询
        $("#action_channel_history_search").on("click", function () {
			var channel = $("#chn_history_temp").val();

			var start = $("#starttime").val();//开始时间
			var end = $("#endtime").val(); // 结束时间

			that.setQueryParams('channel',channel);
			that.setQueryParams('start',start);
			that.setQueryParams('end',end);
            
			that.tableRefresh()
        });
		//end 按时间查询
        jQuery("#table_channel_history_list_wrapper .dataTables_length select").addClass("m-wrap small");

    },

    tableFinish: function () {
        var that = this;
        $('body').modalmanager('removeLoading');
        $('body').removeClass('modal-open');
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
    }
};
