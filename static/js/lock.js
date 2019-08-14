var Lock = function () {

    return {
        //main function to initiate the module
        init: function () {

             $.backstretch([
		        "static/image/bg/1.jpg",
		        "static/image/bg/2.jpg",
		        "static/image/bg/3.jpg",
		        "static/image/bg/4.jpg"
		        ], {
		          fade: 2000,
		          duration: 8000
		      });
        }

    };

}();