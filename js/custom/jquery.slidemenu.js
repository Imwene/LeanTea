(function(KES) {
	"use strict";

	KES.fn.spasticNav = function(options) {
	
		options = KES.extend({
			overlap : 0,
			speed : 500,
			reset : 50,
			color : '#00c6ff',
			easing : 'swing'	//'easeOutExpo'
		}, options);
	
		return this.each(function() {
		
		 	var nav = KES(this),
		 		currentPageItem = nav.find('>.current-menu-item,>.current-menu-parent,>.current-menu-ancestor'),	//>.current_page_parent
				hidden = true,	//false
		 		blob,
		 		reset;
			if (currentPageItem.length === 0) {
		 		currentPageItem = nav.find('li').eq(0);
				//hidden = true;
			}

		 	KES('<li id="blob"></li>').css({
					width : currentPageItem.css('width'),	//.outerWidth(),
					height : currentPageItem.css('height'),	//.outerHeight() + options.overlap,
					left : currentPageItem.position().left,
					top : currentPageItem.position().top - options.overlap / 2,
					backgroundColor : hidden ? options.color : currentPageItem.find('a').css('backgroundColor'),
					opacity: hidden ? 0 : 1
				}).appendTo(this);
		 	blob = KES('#blob', nav);
					 	
			nav.find('>li:not(#blob)').on('hover',function() {
				// mouse over
				clearTimeout(reset);
				var bg = KES(this).css('backgroundColor');
				KES(this).addClass('blob_over');
				blob.css({backgroundColor: bg}).animate(
					{
						left: KES(this).position().left,
						top: KES(this).position().top - options.overlap / 2,
						width: KES(this).css('width'),	//.outerWidth(),
						height: KES(this).css('height') + options.overlap,	//.outerHeight() + options.overlap,
						opacity: 1
					},
					{
						duration : options.speed,
						easing : options.easing,
						queue : false
					}
				);
			}, function() {
				// mouse out	
				reset = setTimeout(function() {
					/*
					var a = currentPageItem.find('a');
					var bg = a.css('backgroundColor');
					*/
					blob.animate({
						/*
						width : currentPageItem.outerWidth(),
						left : currentPageItem.position().left,
						*/
						opacity: 0	//hidden ? 0 : 1,
					}, options.speed)
					//.css({backgroundColor: bg})
				}, options.reset);
				KES(this).removeClass('blob_over');
			});
		 
		
		}); // end each
	
	};

})(jQuery);