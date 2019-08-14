/* Set the defaults for DataTables initialisation */
$.extend( true, $.fn.dataTable.defaults, {
	"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
	"sPaginationType": "bootstrap",
	"oLanguage": {
        "sProcessing": "加载中...",
        "sEmptyTable": "没有数据",
        "sLengthMenu": "显示 _MENU_ 项结果",
        "sZeroRecords": "没有匹配结果",
        "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
        "sInfoPostFix": "",
        "sSearch": "搜索:",
        "sUrl": "",
        "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "上页",
            "sNext": "下页",
            "sLast": "末页"
        }
	}
} );


/* Default class modification */
$.extend( $.fn.dataTableExt.oStdClasses, {
	"sWrapper": "dataTables_wrapper form-inline"
} );


/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
{	
	return {
		"iStart":         oSettings._iDisplayStart,
		"iEnd":           oSettings.fnDisplayEnd(),
		"iLength":        oSettings._iDisplayLength,
		"iTotal":         oSettings.fnRecordsTotal(),
		"iFilteredTotal": oSettings.fnRecordsDisplay(),
		"iPage":          Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
		"iTotalPages":    Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
	};
};


/* Bootstrap style pagination control */
$.extend( $.fn.dataTableExt.oPagination, {
	"bootstrap": {
		"fnInit": function( oSettings, nPaging, fnDraw ) {
			var oLang = oSettings.oLanguage.oPaginate;
			var fnClickHandler = function ( e ) {
				e.preventDefault();
				if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
					fnDraw( oSettings );
				}
			};

			$(nPaging).addClass('pagination').append(
				'<ul>'+
					'<li class="first"><a href="#"><span class="hidden-480">'+oLang.sFirst+'</span></a></li>'+//add by haobo56 首页
					'<li class="last"><a href="#"><span class="hidden-480">'+oLang.sLast+'</span></a></li>'+//add by haobo56 末页
					'<li class="prev"><a href="#"> <span class="hidden-480">'+oLang.sPrevious+'</span></a></li>'+
					'<li class="next"><a href="#"><span class="hidden-480">'+oLang.sNext+'</span></a></li>'+
				'</ul>'
			);
			var els = $('a', nPaging);
			$(els[0]).bind( 'click.DT', { action: "first" }, fnClickHandler );//add by haobo56 首页事件
			$(els[1]).bind( 'click.DT', { action: "last" }, fnClickHandler );//add by haobo56 末页事件
			$(els[2]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
			$(els[3]).bind( 'click.DT', { action: "next" }, fnClickHandler );
		},

		"fnUpdate": function ( oSettings, fnDraw ) {
			var iListLength = 5;
			var oPaging = oSettings.oInstance.fnPagingInfo();
			var an = oSettings.aanFeatures.p;
			var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

			if ( oPaging.iTotalPages < iListLength) {
				iStart = 1;
				iEnd = oPaging.iTotalPages;
			}
			else if ( oPaging.iPage <= iHalf ) {
				iStart = 1;
				iEnd = iListLength;
			} else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
				iStart = oPaging.iTotalPages - iListLength + 1;
				iEnd = oPaging.iTotalPages;
			} else {
				iStart = oPaging.iPage - iHalf + 1;
				iEnd = iStart + iListLength - 1;
			}

			for ( i=0, iLen=an.length ; i<iLen ; i++ ) {
				// Remove the middle elements
//				$('li:gt(0)', an[i]).filter(':not(:last)').remove();
				$('li:gt(2)', an[i]).filter(':not(:last)').remove();//update by haobo56 添加首页末页之后，需从第2位开始删

				// Add the new list items and their event handlers
				for ( j=iStart ; j<=iEnd ; j++ ) {
					sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
					$('<li '+sClass+'><a href="#">'+j+'</a></li>')
						.insertBefore( $('li:last', an[i])[0] )
						.bind('click', function (e) {
							e.preventDefault();
							oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
							fnDraw( oSettings );
						} );
				}
				//add by haobo56 添加跳转至 输入框，双击跳转至指定页 begin
				$('<li >跳至<input type=text title="双击或Enter跳转至目标页" style ="width:45px;">')
				.insertBefore( $('li:last', an[i])[0] )
				.bind('keypress dblclick', function (ev) {
					if(ev.keyCode==13&&ev.type=='keypress'||ev.type=='dblclick'){
						ev.preventDefault();
						var pageNo =$('input', this).val();
						var Letters = "1234567890"; 
						var i; 
						var c; 
						var pagenodbclickCheckflag =false;
						for( i = 0; i < String.length; i ++ ) { 
							c = pageNo.charAt( i ); 
							if (Letters.indexOf( c ) ==-1) { 
								pagenodbclickCheckflag =true;
								break;
							} 
						} 
						if(pagenodbclickCheckflag){
							alert("只准输入数字"); return;
						}
						if(pageNo==''){
							pageNo =1;
						}
						if(pageNo<1){
							if(confirm("页码不能小于1,是否跳至首页？")){
								pageNo=1;
							}else{
								return;
							}
						}
						if(pageNo>oPaging.iTotalPages){
							if(confirm("最多【"+oPaging.iTotalPages+"】页,跳至尾页？")){
								pageNo=oPaging.iTotalPages;
							}else{
								return;
							}
						}
						oSettings._iDisplayStart = (parseInt(pageNo,10)-1) * oPaging.iLength;
						fnDraw( oSettings );
					}
					} );
				//add by haobo56 添加跳转至 输入框，双击跳转至指定页  end
				// Add / remove disabled classes from the static elements
				if ( oPaging.iPage === 0 ) {
					$('li:first', an[i]).addClass('disabled');
					$('li:eq(2)', an[i]).addClass('disabled');//add by haobo56 设置上页是否可点
				} else {
					$('li:first', an[i]).removeClass('disabled');
					$('li:eq(2)', an[i]).removeClass('disabled');//add by haobo56 设置上页是否可点
				}

				if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
					$('li:last', an[i]).addClass('disabled');
					$('li:eq(1)', an[i]).addClass('disabled');//add by haobo56 设置末页是否可点
				} else {
					$('li:last', an[i]).removeClass('disabled');
					$('li:eq(1)', an[i]).removeClass('disabled');//add by haobo56 设置末页是否可点
					
				}
			}
		}
	}
} );


/*
 * TableTools Bootstrap compatibility
 * Required TableTools 2.1+
 */
if ( $.fn.DataTable.TableTools ) {
	// Set the classes that TableTools uses to something suitable for Bootstrap
	$.extend( true, $.fn.DataTable.TableTools.classes, {
		"container": "DTTT btn-group",
		"buttons": {
			"normal": "btn",
			"disabled": "disabled"
		},
		"collection": {
			"container": "DTTT_dropdown dropdown-menu",
			"buttons": {
				"normal": "",
				"disabled": "disabled"
			}
		},
		"print": {
			"info": "DTTT_print_info modal"
		},
		"select": {
			"row": "active"
		}
	} );

	// Have the collection use a bootstrap compatible dropdown
	$.extend( true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
		"collection": {
			"container": "ul",
			"button": "li",
			"liner": "a"
		}
	} );
}