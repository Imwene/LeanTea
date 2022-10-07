// make it a global variable so other scripts can access it
var booked_load_calendar_date_booking_options,
	booked_appt_form_options,
	bookedNewAppointment;

;(function(KES, window, document, undefined) {
	"use strict";
	
	
	var booked_js_vars = {
		"ajax_url": "/",
		"profilePage": "",
		"publicAppointments": "",
		"i18n_confirm_appt_delete": "Are you sure you want to cancel this appointment?",
		"i18n_please_wait": "Please wait ...",
		"i18n_wrong_username_pass": "Wrong username\/password combination.",
		"i18n_fill_out_required_fields": "Please fill out all required fields.",
		"i18n_guest_appt_required_fields": "Please enter your name to book an appointment.",
		"i18n_appt_required_fields": "Please enter your name, your email address and choose a password to book an appointment.",
		"i18n_appt_required_fields_guest": "Please fill in all \"Information\" fields.",
		"i18n_password_reset": "Please check your email for instructions on resetting your password.",
		"i18n_password_reset_error": "That username or email is not recognized."
	};

	var KESwin = KES(window);

	KES.fn.spin.presets.booked = {
	 	lines: 10, // The number of lines to draw
		length: 7, // The length of each line
		width: 5, // The line thickness
		radius: 11, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#555', // #rgb or #rrggbb or array of colors
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'booked-spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '50%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	}
	
	KES.fn.spin.presets.booked_top = {
	 	lines: 11, // The number of lines to draw
		length: 10, // The length of each line
		width: 6, // The line thickness
		radius: 15, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		scale: 0.5,
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#aaaaaa', // #rgb or #rrggbb or array of colors
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'booked-spinner booked-spinner-top', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '15px', // Top position relative to parent
		left: '50%' // Left position relative to parent
	}
	
	KES.fn.spin.presets.booked_white = {
	 	lines: 13, // The number of lines to draw
		length: 11, // The length of each line
		width: 5, // The line thickness
		radius: 18, // The radius of the inner circle
		scale: 1,
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#fff', // #rgb or #rrggbb or array of colors
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'booked-spinner booked-white', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '50%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	}
	
	// Adjust the calendar sizing when resizing the window
	KESwin.on('resize', function(){
		"use strict";
		
		adjust_calendar_boxes();
		resize_booked_modal();

	});

	var ajaxforgot = KES('#ajaxforgot');
	var ajaxlogin = KES('#ajaxlogin');
	var profile_forgot = KES('#profile-forgot');
	var booked_tab_content = KES('.booked-tab-content');
	var booked_list_view = KES('.booked-list-view');
	var loginform = KES('#loginform');
	
	KESwin.on('load', function() {
		"use strict";

		BookedTabs.Init();

		var ajaxRequests = [];
		
		// Adjust the calendar sizing on load
		adjust_calendar_boxes();
		var booked_calendar_wrap = KES('.booked-calendar-wrap');
		booked_calendar_wrap.each(function(){
			var thisCalendar = KES(this);
			var calendar_month = thisCalendar.find('table.booked-calendar').attr('data-calendar-date');
			thisCalendar.attr('data-default',calendar_month);
			init_tooltips(thisCalendar);
		});
		
		booked_list_view.each(function(){
			var thisList = KES(this);
			var list_date = thisList.find('.booked-appt-list').attr('data-list-date');
			thisList.attr('data-default',list_date);
		});
		
		bookedRemoveEmptyTRs();
		init_appt_list_date_picker();

		KES('.booked_calendar_chooser').change(function(e){
			"use strict";
	
			e.preventDefault();
			
			var KESselector 			= KES(this),
				thisIsCalendar		= KESselector.parents('.booked-calendarSwitcher').hasClass('calendar');	
	
			if (!thisIsCalendar){
				
				var thisCalendarWrap	= KESselector.parents('.booked-calendar-shortcode-wrap').find('.booked-list-view'),
				thisDefaultDate			= thisCalendarWrap.attr('data-default'),
				thisIsCalendar			= KESselector.parents('.booked-calendarSwitcher').hasClass('calendar');
				
				if (typeof thisDefaultDate === 'undefined'){ thisDefaultDate = false; }
				
				thisCalendarWrap.addClass('booked-loading');
	
				var args = {
					'action'		: 'booked_appointment_list_date',
					'date'		: thisDefaultDate,
					'calendar_id'	: KESselector.val()
				};
				
				KES(document).trigger("booked-before-loading-appointment-list-booking-options");
				thisCalendarWrap.spin('booked_top');
			
				KES.ajax({
					url: booked_js_vars.ajax_url,
					type: 'post',
					data: args,
					success: function( html ) {
						
						thisCalendarWrap.html( html );
						
						init_appt_list_date_picker();
						setTimeout(function(){
							thisCalendarWrap.removeClass('booked-loading');
						},1);
						
					}
				});
				
			} else {
				
				var thisCalendarWrap 	= KESselector.parents('.booked-calendar-shortcode-wrap').find('.booked-calendar-wrap'),
				thisDefaultDate			= thisCalendarWrap.attr('data-default');
				if (typeof thisDefaultDate === 'undefined'){ thisDefaultDate = false; }
				
				var args = {
					'action'		: 'booked_calendar_month',
					'gotoMonth'		: thisDefaultDate,
					'calendar_id'	: KESselector.val()
				};
			
				savingState(true,thisCalendarWrap);
			
				KES.ajax({
					url: booked_js_vars.ajax_url,
					type: 'post',
					data: args,
					success: function( html ) {
						
						thisCalendarWrap.html( html );
						
						adjust_calendar_boxes();
						bookedRemoveEmptyTRs();
						init_tooltips(thisCalendarWrap);
					 	KES(window).trigger('booked-load-calendar', args, KESselector );
						
					}
				});
				
			}
			
			return false;
			
		});
		
		// Calendar Next/Prev Click
		booked_calendar_wrap.on('click', '.page-right, .page-left, .monthName a', function(e) {
			"use strict";

			e.preventDefault();

			var KESbutton 			= KES(this),
				gotoMonth			= KESbutton.attr('data-goto'),
				thisCalendarWrap 	= KESbutton.parents('.booked-calendar-wrap'),
				thisCalendarDefault = thisCalendarWrap.attr('data-default'),
				calendar_id			= KESbutton.parents('table.booked-calendar').attr('data-calendar-id');
				
			if (typeof thisCalendarDefault === 'undefined'){ thisCalendarDefault = false; }
			
			var args = {
				'action'		: 'booked_calendar_month',
				'gotoMonth'		: gotoMonth,
				'calendar_id'	: calendar_id,
				'force_default'	: thisCalendarDefault
			};
		
			savingState(true,thisCalendarWrap);
		
			KES.ajax({
				url: booked_js_vars.ajax_url,
				type: 'post',
				data: args,
				success: function( html ) {
					
					thisCalendarWrap.html( html );
					
					adjust_calendar_boxes();
					bookedRemoveEmptyTRs();
					init_tooltips(thisCalendarWrap);
					KES(window).trigger('booked-load-calendar', args, KESbutton );
					
				}
			});

			return false;

		});

		// Calendar Date Click
		booked_calendar_wrap.on('click', 'tr.week td', function(e) {
			"use strict";

			e.preventDefault();
			var entryBlock = KES('tr.entryBlock');
			var KESthisDate 				= KES(this),
				booked_calendar_table 	= KESthisDate.parents('table.booked-calendar'),
				KESthisRow				= KESthisDate.parent(),
				date					= KESthisDate.attr('data-date'),
				calendar_id				= booked_calendar_table.attr('data-calendar-id'),
				colspanSetting			= KESthisRow.find('td').length;
				
			if (!calendar_id){ calendar_id = 0; }

			if (KESthisDate.hasClass('blur') || KESthisDate.hasClass('booked') && !booked_js_vars.publicAppointments || KESthisDate.hasClass('prev-date')){

				// Do nothing.

			} else if (KESthisDate.hasClass('active')){

				KESthisDate.removeClass('active');
				entryBlock.remove();
				
				var calendarHeight = booked_calendar_table.height();
				booked_calendar_table.parent().height(calendarHeight);

			} else {

				KES('tr.week td').removeClass('active');
				KESthisDate.addClass('active');

				entryBlock.remove();
				KESthisRow.after('<tr class="entryBlock loading"><td colspan="'+colspanSetting+'"></td></tr>');
				entryBlock.find('td').spin('booked');

				booked_load_calendar_date_booking_options = {'action':'booked_calendar_date','date':date,'calendar_id':calendar_id};
				KES(document).trigger("booked-before-loading-calendar-booking-options");
				
				var calendarHeight = booked_calendar_table.height();
				booked_calendar_table.parent().height(calendarHeight);
				
				KES.ajax({
					url: booked_js_vars.ajax_url,
					type: 'post',
					data: booked_load_calendar_date_booking_options,
					success: function( html ) {
						
						entryBlock.find('td').html( html );
						
						entryBlock.removeClass('loading');
						entryBlock.find('.booked-appt-list').fadeIn(300);
						entryBlock.find('.booked-appt-list').addClass('shown');
						adjust_calendar_boxes();
						
					}
				});

			}
			
			return;

		});
		
		// Appointment List Next/Prev Date Click
		booked_list_view.on('click', '.booked-list-view-date-prev,.booked-list-view-date-next', function(e) {
			"use strict";

			e.preventDefault();

			var KESthisLink 			= KES(this),
				date				= KESthisLink.attr('data-date'),
				thisList			= KESthisLink.parents('.booked-list-view'),
				defaultDate			= thisList.attr('data-default'),
				calendar_id			= KESthisLink.parents('.booked-list-view-nav').attr('data-calendar-id');
				
			if (typeof defaultDate === 'undefined'){ defaultDate = false; }
				
			if (!calendar_id){ calendar_id = 0; }
			
			thisList.addClass('booked-loading');
	
			var booked_load_list_view_date_booking_options = {
				'action'		: 'booked_appointment_list_date',
				'date'			: date,
				'calendar_id'	: calendar_id,
				'force_default'	: defaultDate
			};
			
			KES(document).trigger("booked-before-loading-appointment-list-booking-options");
			thisList.spin('booked_top');
		
			KES.ajax({
				url: booked_js_vars.ajax_url,
				type: 'post',
				data: booked_load_list_view_date_booking_options,
				success: function( html ) {
					
					thisList.html( html );
					
					init_appt_list_date_picker();
					setTimeout(function(){
						thisList.removeClass('booked-loading');
					},1);
					
				}
			});
			
			return false;

		});

		// New Appointment Click
		bookedNewAppointment = function(e) {
			"use strict";
			e.preventDefault();

			var KESbutton 		= KES(this),
				title           = KESbutton.attr('data-title'),
				timeslot		= KESbutton.attr('data-timeslot'),
				date			= KESbutton.attr('data-date'),
				calendar_id		= KESbutton.attr('data-calendar-id'),
				KESthisTimeslot	= KESbutton.parents('.timeslot'),
				is_list_view	= KESbutton.parents('.booked-calendar-wrap').hasClass('booked-list-view');
				
			if (typeof is_list_view != 'undefined' && is_list_view){
				var new_calendar_id	= KESbutton.parents('.booked-list-view').find('.booked-list-view-nav').attr('data-calendar-id');
			} else {
				var new_calendar_id	= KESbutton.parents('table.booked-calendar').attr('data-calendar-id');
			}
			calendar_id = new_calendar_id ? new_calendar_id : calendar_id;

			booked_appt_form_options = {'action':'booked_new_appointment_form','date':date,'timeslot':timeslot,'calendar_id':calendar_id,'title':title};
			KES(document).trigger("booked-before-loading-booking-form");

			create_booked_modal();
			setTimeout(function(){
				
				KES.ajax({
					url: booked_js_vars.ajax_url,
					type: 'post',
					data: booked_appt_form_options,
					success: function( html ) {
						
						KES('.bm-window').html( html );
						
						var bookedModal = KES('.booked-modal');
						var bmWindow = bookedModal.find('.bm-window');
						bmWindow.css({'visibility':'hidden'});
						bookedModal.removeClass('bm-loading');
						KES(document).trigger("booked-on-new-app");
						resize_booked_modal();
						bmWindow.hide();
						KES('.booked-modal .bm-overlay').find('.booked-spinner').remove();
						
						setTimeout(function(){
							bmWindow.css({'visibility':'visible'});
							bmWindow.show();
						},50);
						
					}
				});
			
			},100);

			return false;
		}
		booked_calendar_wrap.on('click', 'button.new-appt', bookedNewAppointment);

		// Profile Tabs
		var profileTabs = KES('.booked-tabs');

		if (!profileTabs.find('li.active').length){
			profileTabs.find('li:first-child').addClass("active");
		}

		if (profileTabs.length){
			booked_tab_content.hide();
			var activeTab = profileTabs.find('.active > a').attr('href');
			activeTab = activeTab.split('#');
			activeTab = activeTab[1];
			KES('#profile-'+activeTab).show();

			profileTabs.find('li > a').on('click', function(e) {
			"use strict";

				e.preventDefault();
				booked_tab_content.hide();
				profileTabs.find('li').removeClass('active');

				KES(this).parent().addClass('active');
				var activeTab = KES(this).attr('href');
				activeTab = activeTab.split('#');
				activeTab = activeTab[1];

				KES('#profile-'+activeTab).show();
				return false;

			});
		}

		// Show Additional Information
		KES('.booked-profile-appt-list').on('click', '.booked-show-cf', function(e) {
			"use strict";
		
			e.preventDefault();
			var hiddenBlock = KES(this).parent().find('.cf-meta-values-hidden');
		
			if(hiddenBlock.is(':visible')){
				hiddenBlock.hide();
				KES(this).removeClass('booked-cf-active');
			} else {
				hiddenBlock.show();
				KES(this).addClass('booked-cf-active');
			}
		
			return false;
		
		});

		// Check Login/Registration/Forgot Password forms before Submitting
		if (loginform.length){
			KES('#loginform input[type="submit"]').on('click',function(e) {
				"use strict";
				if (KES('#loginform input[name="log"]').val() && KES('#loginform input[name="pwd"]').val()){
					KES('#loginform .booked-custom-error').hide();
				} else {
					e.preventDefault();
					loginform.parents('.booked-form-wrap').find('.booked-custom-error').fadeOut(200).fadeIn(200);
				}
			});
		}

		if (profile_forgot.length){
			KES('#profile-forgot input[type="submit"]').on('click',function(e) {
				"use strict";
				if (KES('#profile-forgot input[name="user_login"]').val()){
					KES('#profile-forgot .booked-custom-error').hide();
				} else {
					e.preventDefault();
					profile_forgot.find('.booked-custom-error').fadeOut(200).fadeIn(200);
				}
			});
		}

		// Custom Upload Field
		if (KES('.booked-upload-wrap').length){

			KES('.booked-upload-wrap input[type=file]').on('change',function(){
				"use strict";

				var fileName = KES(this).val();
				KES(this).parent().find('span').html(fileName);
				KES(this).parent().addClass('hasFile');

			});

		}

		// Delete Appointment
		KES('.booked-profile-appt-list').on('click', '.appt-block .cancel', function(e) {
			"use strict";

			e.preventDefault();

			var KESbutton 		= KES(this),
				KESthisParent		= KESbutton.parents('.appt-block'),
				appt_id			= KESthisParent.attr('data-appt-id');

			confirm_delete = confirm(booked_js_vars.i18n_confirm_appt_delete);
			if (confirm_delete === true){

				var currentApptCount = parseInt(KES('.booked-profile-appt-list').find('h4').find('span.count').html(),10);
				currentApptCount = parseInt(currentApptCount - 1,10);
				if (currentApptCount < 1){
					KES('.booked-profile-appt-list').find('h4').find('span.count').html('0');
					KES('.no-appts-message').slideDown('fast');
				} else {
					KES('.booked-profile-appt-list').find('h4').find('span.count').html(currentApptCount);
				}
				
				KES('.appt-block').animate({'opacity':0.4},0);

	  			KESthisParent.slideUp('fast',function(){
					KES(this).remove();
				});

				KES.ajax({
					'url' 		: booked_js_vars.ajax_url,
					'method' 	: 'post',
					'data'		: {
						'action'     	: 'booked_cancel_appt',
						'appt_id'     	: appt_id
					},
					success: function(data) {
						KES('.appt-block').animate({'opacity':1},150);
					}
				});

			}

			return false;

		});
		var body = KES('body');
		body.on('touchstart click','.bm-overlay, .bm-window .close, .booked-form .cancel',function(e){
			"use strict";
			e.preventDefault();
			close_booked_modal();
			return false;
		});

		body.on('focusin', '.booked-form input', function() {
			"use strict";
			if(this.title===this.value) {
				KES(this).addClass('hasContent');
				this.value = '';
			}
		}).on('focusout', '.booked-form input', function(){
			"use strict";
			if(this.value==='') {
				KES(this).removeClass('hasContent');
				this.value = this.title;
			}
		});

		body.on('change','.booked-form input',function(){
			"use strict";

			var condition = KES(this).attr('data-condition'),
				thisVal = KES(this).val();

			if (condition && KES('.condition-block').length) {
				KES('.condition-block.'+condition).hide();
				KES('#condition-'+thisVal).fadeIn(200);
				resize_booked_modal();
			}

		});

		// Perform AJAX login on form submit
	    body.on('submit','form#ajaxlogin', function(e){
			"use strict";
		    e.preventDefault();

	        KES('form#ajaxlogin p.status').show().html('<i class="fa fa-refresh fa-spin"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_please_wait);
	        resize_booked_modal();

	        var KESthis = KES(this),
	        	date = KESthis.data('date'),
	        	title = KESthis.data('title'),
	        	timeslot = KESthis.data('timeslot'),
	        	calendar_id = KESthis.data('calendar-id');

	        KES.ajax({
		        type	: 'post',
				url 	: booked_js_vars.ajax_url,
				data	: KES('form#ajaxlogin').serialize(),
				success	: function(data) {
					if (data === 'success'){

						// close the modal box
						close_booked_modal();

						// reopen the modal box
						var KESbutton = KES( '<button data-title="' + title + '" data-timeslot="' + timeslot + '" data-date="' + date + '" data-calendar-id="' + calendar_id + '"></button>' );
						KESbutton.on( 'click', window.bookedNewAppointment );
						KESbutton.triggerHandler( 'click' );
						KESbutton.unbind( 'click', window.bookedNewAppointment );
						KESbutton.detach();
						
					} else {
						KES('form#ajaxlogin p.status').show().html('<i class="fa fa-warning" style="color:#E35656"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_wrong_username_pass);
						resize_booked_modal();
					}
	            }
	        });
	        e.preventDefault();
	    });
	    
	    body.on('click','.booked-forgot-password',function(e){
			"use strict";
			
			e.preventDefault();
			ajaxlogin.hide();
			ajaxforgot.show();
			
			resize_booked_modal();
			 
	    });
	    
	     body.on('click','.booked-forgot-goback',function(e){
			"use strict";
			
			e.preventDefault();
			ajaxlogin.show();
			ajaxforgot.hide();
			
			resize_booked_modal();
			 
	    });
	    
	    // Perform AJAX login on form submit

	    body.on('submit','form#ajaxforgot', function(e){
			"use strict";
		    e.preventDefault();
			var p_status = KES('form#ajaxforgot p.status');
	        p_status.show().html('<i class="fa fa-refresh fa-spin"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_please_wait);
	        resize_booked_modal();

	        var KESthis = KES(this);

	        KES.ajax({
		        type	: 'post',
				url 	: booked_js_vars.ajax_url,
				data	: KES('form#ajaxforgot').serialize(),
				success	: function(data) {
					if (data === 'success'){

						e.preventDefault();
						ajaxlogin.show();
						ajaxforgot.hide();
						
						KES('form#ajaxlogin p.status').show().html('<i class="fa fa-check" style="color:#56c477"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_password_reset);
						resize_booked_modal();
						
					} else {
						
						console.log(data);
						p_status.show().html('<i class="fa fa-warning" style="color:#E35656"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_password_reset_error);
						resize_booked_modal();
						
					}
	            }
	        });
	        e.preventDefault();
	    });


		// Submit the "Request Appointment" Form
		body.on('click','.booked-form input#submit-request-appointment',function(e){
			"use strict";
			var  newAppointmentForm_status = KES('form#newAppointmentForm p.status');
			newAppointmentForm_status.show().html('<i class="fa fa-refresh fa-spin"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_please_wait);
	        resize_booked_modal();
			
			e.preventDefault();
			
			var customerType        = KES('#newAppointmentForm input[name=customer_type]').val(),
				customerID          = KES('#newAppointmentForm input[name=user_id]').val(),
				name                = KES('#newAppointmentForm input[name=booked_appt_name]').val(),
				surname             = KES('#newAppointmentForm input[name=booked_appt_surname]').val(),
				surnameActive		= KES('#newAppointmentForm input[name=booked_appt_surname]').length,
				guest_name          = KES('#newAppointmentForm input[name=guest_name]').val(),
				guest_surname      	= KES('#newAppointmentForm input[name=guest_surname]').val(),
				guest_surnameActive = KES('#newAppointmentForm input[name=guest_surname]').length,
				guest_email			= KES('#newAppointmentForm input[name=guest_email]').val(),
				guest_emailActive 	= KES('#newAppointmentForm input[name=guest_email]').length,
				email               = KES('#newAppointmentForm input[name=booked_appt_email]').val(),
				password            = KES('#newAppointmentForm input[name=booked_appt_password]').val(),
				showRequiredError   = false,
				ajaxRequests        = [];

			KES(this).parents('.booked-form').find('input,textarea,select').each(function(i,field){
				"use strict";

				var required = KES(this).attr('required');

				if (required && KES(field).attr('type') === 'hidden'){
					var fieldParts = KES(field).attr('name');
					fieldParts = fieldParts.split('---');
					fieldName = fieldParts[0];
					fieldNumber = fieldParts[1].split('___');
					fieldNumber = fieldNumber[0];

					if (fieldName === 'radio-buttons-label'){
						var radioValue = false;
						KES('input:radio[name="single-radio-button---'+fieldNumber+'[]"]:checked').each(function(){
							if (KES(this).val()){
								radioValue = KES(this).val();
							}
						});
						if (!radioValue){
							showRequiredError = true;
						}
					} else if (fieldName === 'checkboxes-label'){
						var checkboxValue = false;
						KES('input:checkbox[name="single-checkbox---'+fieldNumber+'[]"]:checked').each(function(){
							if (KES(this).val()){
								checkboxValue = KES(this).val();
							}
						});
						if (!checkboxValue){
							showRequiredError = true;
						}
					}

				} else if (required && KES(field).attr('type') != 'hidden' && KES(field).val() === ''){
		            showRequiredError = true;
		        }

		    });
			
		    if (showRequiredError) {
			    newAppointmentForm_status.show().html('<i class="fa fa-warning" style="color:#E35656"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_fill_out_required_fields);
				resize_booked_modal();
			    return false;
		    }

			if ( customerType === 'new' && !name || customerType === 'new' && surnameActive && !surname || customerType === 'new' && !email || customerType === 'new' && !password ) {
				newAppointmentForm_status.show().html('<i class="fa fa-warning" style="color:#E35656"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_appt_required_fields);
				resize_booked_modal();
				return false;
			}
			
			if ( customerType === 'guest' && !guest_name || customerType === 'guest' && guest_emailActive && !guest_email || customerType === 'guest' && guest_surnameActive && !guest_surname ){
				newAppointmentForm_status.show().html('<i class="fa fa-warning" style="color:#E35656"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_appt_required_fields_guest);
				resize_booked_modal();
				return false;
			}
			
			if (customerType === 'current' && customerID ||
				customerType === 'guest' && guest_name && !guest_surnameActive && !guest_emailActive ||
				customerType === 'guest' && guest_name && guest_surnameActive && guest_surname && !guest_emailActive ||
				customerType === 'guest' && guest_name && guest_emailActive && guest_email && !guest_surnameActive ||
				customerType === 'guest' && guest_name && guest_emailActive && guest_email && guest_surnameActive && guest_surname ) {
			   
			    SubmitRequestAppointment.currentUserOrGuest();
			
			}

			if (customerType === 'new' && name && email && password) {
				if ( !surnameActive || surnameActive && surname ){
					SubmitRequestAppointment.newUser();
				}
			}

		});

		var SubmitRequestAppointment = {

			formSelector: '#newAppointmentForm',
			formBtnRequestSelector: '.booked-form input#submit-request-appointment',
			formStatusSelector: 'p.status',
			formSubmitBtnSelector: '#submit-request-appointment',

			apptContainerSelector: '.booked-appointment-details',

			baseFields: 	[ 'guest_name','guest_surname','guest_email','action', 'customer_type', 'user_id' ],
			apptFields: 	[ 'appoinment', 'calendar_id', 'title', 'date', 'timestamp', 'timeslot' ],
			userFields: 	[ 'booked_appt_name','booked_appt_surname','booked_appt_email', 'booked_appt_password' ],
			captchaFields: 	[ 'captcha_word', 'captcha_code' ],

			currentApptIndex: false,
			currentApptCounter: false,
			hasAnyErrors: false,

			currentUserOrGuest: function() {
				"use strict";
				var total_appts = SubmitRequestAppointment._totalAppts();

				if ( ! total_appts ) {
					return;
				}

				SubmitRequestAppointment._showLoadingMessage();
				SubmitRequestAppointment._resetDefaultValues();

				var data = SubmitRequestAppointment._getBaseData();

				SubmitRequestAppointment.currentApptIndex = 0;
				SubmitRequestAppointment.currentApptCounter = 1;
				SubmitRequestAppointment._doRequestAppointment( data, total_appts );
				
			},

			// pretty much the same as SubmitRequestAppointment.currentUserOrGuest(), however, it include the user name, email and password
			newUser: function() {
			"use strict";
				var total_appts = SubmitRequestAppointment._totalAppts();

				if ( ! total_appts ) {
					return;
				}

				SubmitRequestAppointment._showLoadingMessage();
				SubmitRequestAppointment._resetDefaultValues();

				var data = SubmitRequestAppointment._getBaseData();

				// when there are more than one appointment, we need to make the registration request first and then loop the appointments
				if ( total_appts > 1 ) {
					var data_obj_with_no_reference = null;
					data_obj_with_no_reference = KES.extend( true, {}, data );
					data_obj_with_no_reference = SubmitRequestAppointment._addUserRegistrationData( data_obj_with_no_reference );
					SubmitRequestAppointment._requestUserRegistration( data_obj_with_no_reference );

					data.customer_type = 'current';
				} else {
					// add user registration fields values
					data = SubmitRequestAppointment._addUserRegistrationData( data );
				}

				SubmitRequestAppointment.currentApptIndex = 0;
				SubmitRequestAppointment._doRequestAppointment( data, total_appts );
			},

			_doRequestAppointment: function( data, total_appts ) {
				
				var appt_fields = SubmitRequestAppointment.apptFields;

				// for the first item only
				if ( SubmitRequestAppointment.currentApptIndex === 0 ) {
					SubmitRequestAppointment._hideCancelBtn();
					SubmitRequestAppointment._disableSubmitBtn();
					SubmitRequestAppointment.hasAnyErrors = false;
				}
				// <------end

				var data_obj_with_no_reference = KES.extend( true, {}, data );

				// add the appointment fields to the data
				for (var i = 0; i < appt_fields.length; i++) {
					data_obj_with_no_reference[ appt_fields[i] ] = SubmitRequestAppointment._getFieldVal( appt_fields[i], SubmitRequestAppointment.currentApptIndex );
				}

				var calendar_id = SubmitRequestAppointment._getFieldVal( 'calendar_id', SubmitRequestAppointment.currentApptIndex );
				data_obj_with_no_reference = SubmitRequestAppointment._addCustomFieldsData( data_obj_with_no_reference, calendar_id );

				var KESappt = SubmitRequestAppointment._getApptElement( SubmitRequestAppointment.currentApptIndex );

				if ( ! KESappt.hasClass('skip') ) {
					KES.ajax({
						type    : 'post',
						url     : booked_js_vars.ajax_url,
						data    : data_obj_with_no_reference,
						async   : true,
						success	: function( response ) {
							
							SubmitRequestAppointment._requestAppointmentResponseHandler( response );
							SubmitRequestAppointment.currentApptIndex++;

							setTimeout( function() {
								if ( SubmitRequestAppointment.currentApptCounter === total_appts ) {
									// for the last item only
									if ( ! SubmitRequestAppointment.hasAnyErrors ) {
										SubmitRequestAppointment._onAfterRequestAppointment();
									} else {
										SubmitRequestAppointment._enableSubmitBtn();
										SubmitRequestAppointment._showCancelBtn();
									}
									// <------end
								} else {
									SubmitRequestAppointment.currentApptCounter++;
									SubmitRequestAppointment._doRequestAppointment( data, total_appts );
								}
							}, 100 );
						}
					});
				} else {
					SubmitRequestAppointment.currentApptIndex++;
					SubmitRequestAppointment.currentApptCounter++;
					SubmitRequestAppointment._doRequestAppointment( data, total_appts, SubmitRequestAppointment.currentApptIndex );
				}
			},

			_totalAppts: function() {
				return KES(SubmitRequestAppointment.formSelector + ' input[name="appoinment[]"]').length;
			},

			_getBaseData: function() {
				var data = {},
					fields = SubmitRequestAppointment.baseFields;

				// set up the base form data
				for ( var i = 0; i < fields.length; i++ ) {
					data[ fields[i] ] = SubmitRequestAppointment._getFieldVal( fields[i] );
				}

				data['is_fe_form'] = true;
				data['total_appts'] = SubmitRequestAppointment._totalAppts();

				return data;
			},

			_getFieldVal: function( field_name, field_index ) {
				var field_name = typeof field_name === 'undefined' ? '' : field_name,
					field_index = typeof field_index === 'undefined' ? false : field_index,
					selector = SubmitRequestAppointment.formSelector + ' ';
					
				if ( field_index === false ) {
					selector += ' [name=' + field_name + ']';
					return KES( selector ).val();
				}

				selector += ' [name="' + field_name + '[]"]';
				return KES( selector ).eq( field_index ).val();
			},

			_resetDefaultValues: function() {
				 KES('.booked-form input').each(function(){
					var thisVal = KES(this).val(),
						thisDefault = KES(this).attr('title');

					if ( thisDefault === thisVal ){ 
						KES(this).val(''); 
					}
				});
			},

			_resetToDefaultValues: function() {
				KES('.booked-form input').each(function(){
					var thisVal = KES(this).val(),
						thisDefault = KES(this).attr('title');

					if ( ! thisVal ){ 
						KES(this).val( thisDefault ); 
					}
				});
			},

			_addUserRegistrationData: function( data ) {
				// populate the user data
				KES.each( SubmitRequestAppointment.userFields, function( index, field_name ) {
					data[ field_name ] = SubmitRequestAppointment._getFieldVal( field_name );
				} );

				// populate captcha data if available
				KES.each( SubmitRequestAppointment.captchaFields, function( index, field_name ) {
					var field_value = SubmitRequestAppointment._getFieldVal( field_name );

					if ( ! field_value ) {
						return;
					}

					data[ field_name ] = field_value;
				} );

				return data;
			},

			_addCustomFieldsData: function( data, calendar_id ) {
				var custom_fields_data = KES('.cf-block [name]')
					.filter( function( index ) {
						var KESthis = KES(this);
						return parseInt(KESthis.data('calendar-id'),10) === parseInt(calendar_id,10) && KESthis.attr('name').match(/---\d+/g);
					} )
					.each( function( index ) {
						var KESthis = KES(this),
							name = KESthis.attr('name'),
							value = KESthis.val(),
							type = KESthis.attr('type');

						if ( ! value ) {
							return;
						}

						if ( ! name.match(/checkbox|radio+/g) ) {
							data[ name ] = value;
							return;
						}

						if ( name.match(/radio+/g) && KESthis.is(':checked') ) {
							data[ name ] = value;
							return;
						}

						if ( typeof data[ name ] === 'undefined' || data[ name ].constructor !== Array ) {
							data[ name ] = [];
						}

						if ( ! KESthis.is(':checked') ) {
							return;
						}

						data[ name ].push( value );
					} );

				return data;
			},

			_requestUserRegistration: function( base_data, appt_index ) {
				KES.ajax({
					type    : 'post',
					url     : booked_js_vars.ajax_url,
					data    : base_data,
					async   : false,
					success	: function( response ) {
						SubmitRequestAppointment._requestUserRegistrationResponseHandler( response );
					}
				});
			},

			_requestUserRegistrationResponseHandler: function( response ) {
				var response_parts = response.split('###'),
					data_result = response_parts[0].substr( response_parts[0].length - 5 );

				if ( data_result === 'error' ) {
					// do something on registration failure
					return;
				}

				// do something on successful registration
			},

			_requestAppointment: function( response ) {
				SubmitRequestAppointment._requestAppointmentResponseHandler( response );
			},

			_requestAppointmentResponseHandler: function( response ) {
				var response_parts = response.split('###'),
					data_result = response_parts[0].substr( response_parts[0].length - 5 );

				if ( data_result === 'error' ) {
					SubmitRequestAppointment._requestAppointmentOnError( response_parts );
					return;
				}

				SubmitRequestAppointment._requestAppointmentOnSuccess( response_parts );
			},

			_requestAppointmentOnError: function( response_parts ) {
				var KESapptEl = SubmitRequestAppointment._getApptElement();

				KES(document).trigger("booked-on-requested-appt-error",[KESapptEl]);

				SubmitRequestAppointment._highlightAppt();

				SubmitRequestAppointment._setStatusMsg( response_parts[1] );

				SubmitRequestAppointment.hasAnyErrors = true;

				resize_booked_modal();
			},

			_requestAppointmentOnSuccess: function( response_parts ) {
				var KESapptEl = SubmitRequestAppointment._getApptElement();
				
				KES(document).trigger("booked-on-requested-appt-success",[KESapptEl]);

				SubmitRequestAppointment._unhighlightAppt();
			},

			_onAfterRequestAppointment: function() {
				var redirectObj = { redirect : false };
				var redirect = KES(document).trigger("booked-on-requested-appointment",[redirectObj]);

				if ( redirectObj.redirect ) {
					return;
				}

				if ( booked_js_vars.profilePage ) {
					window.location = booked_js_vars.profilePage;
					return;
				}

				SubmitRequestAppointment._reloadApptsList();
				SubmitRequestAppointment._reloadCalendarTable();
			},

			_setStatusMsg: function( msg ) {
				var form_status_selector = SubmitRequestAppointment.formSelector + ' ' + SubmitRequestAppointment.formStatusSelector;
				KES( form_status_selector ).show().html( '<i class="fa fa-warning" style="color:#E35656"></i>&nbsp;&nbsp;&nbsp;' + msg );
			},

			_getApptElement: function( appt_index ) {
				var appt_index = typeof appt_index === 'undefined' ? SubmitRequestAppointment.currentApptIndex : appt_index,
					appt_cnt_selector = SubmitRequestAppointment.formSelector + ' ' + SubmitRequestAppointment.apptContainerSelector;

				return KES( appt_cnt_selector ).eq( appt_index );
			},

			_highlightAppt: function( msg ) {
				var KESapptEl = SubmitRequestAppointment._getApptElement();

				if ( ! KESapptEl.length ) {
					return;
				}

				KESapptEl.addClass('has-error');
			},

			_unhighlightAppt: function( msg ) {
				var KESapptEl = SubmitRequestAppointment._getApptElement();

				if ( ! KESapptEl.length ) {
					return;
				}

				KESapptEl.removeClass('has-error').addClass('skip');
			},

			_enableSubmitBtn: function() {
				var btn_selector = SubmitRequestAppointment.formSelector + ' ' + SubmitRequestAppointment.formSubmitBtnSelector;
				KES( btn_selector ).attr( 'disabled', false );
			},

			_disableSubmitBtn: function() {
				var btn_selector = SubmitRequestAppointment.formSelector + ' ' + SubmitRequestAppointment.formSubmitBtnSelector;
				KES( btn_selector ).attr( 'disabled', true );
			},

			_showCancelBtn: function() {
				KES( SubmitRequestAppointment.formSelector ).find('button.cancel').show();
			},

			_hideCancelBtn: function() {
				KES( SubmitRequestAppointment.formSelector ).find('button.cancel').hide();
			},

			_showLoadingMessage: function() {
				KES('form#newAppointmentForm p.status').show().html('<i class="fa fa-refresh fa-spin"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_please_wait);
			},

			_reloadApptsList: function() {
				if ( ! KES('.booked-appt-list').length ){
					return;
				}

				KES('.booked-appt-list').each( function() {
					"use strict";
					var KESthisApptList  = KES(this),
						date          = KESthisApptList.attr('data-list-date'),
						thisList      = KESthisApptList.parents('.booked-list-view'),
						defaultDate   = thisList.attr('data-default'),
						calendar_id   = parseInt(KESthisApptList.find('.booked-list-view-nav').attr('data-calendar-id'),10) || 0;
					
					defaultDate = typeof defaultDate === 'undefined' ? false : defaultDate;
					calendar_id = calendar_id ? calendar_id : 0;

					thisList.addClass('booked-loading');

					var booked_load_list_view_date_booking_options = {
						'action'		: 'booked_appointment_list_date',
						'date'			: date,
						'calendar_id'	: calendar_id,
						'force_default'	: defaultDate
					};
					
					KES(document).trigger("booked-before-loading-appointment-list-booking-options");
					thisList.spin('booked_top');
				
					KES.ajax({
						url: booked_js_vars.ajax_url,
						type: 'post',
						data: booked_load_list_view_date_booking_options,
						success: function( html ) {
							thisList.html( html );
							
							close_booked_modal();
							init_appt_list_date_picker();
							setTimeout(function(){
								thisList.removeClass('booked-loading');
							},1);
						}
					});
				});
			},

			_reloadCalendarTable: function() {
				if ( ! KES('td.active').length ) {
					return;
				}

				var KESactiveTD = KES('td.active'),
					activeDate = KESactiveTD.attr('data-date'),
					calendar_id = parseInt( KESactiveTD.parents('table').data('calendar-id') ,10) || 0;

				booked_load_calendar_date_booking_options = { 'action':'booked_calendar_date', 'date':activeDate, 'calendar_id':calendar_id };
				KES(document).trigger("booked-before-loading-calendar-booking-options");
				
				KES.ajax({
					url: booked_js_vars.ajax_url,
					type: 'post',
					data: booked_load_calendar_date_booking_options,
					success: function( html ) {
						var entryBlock = KES('tr.entryBlock');
						entryBlock.find('td').html( html );
						
						close_booked_modal();
						entryBlock.removeClass('loading');
						entryBlock.find('.booked-appt-list').hide().fadeIn(300);
						entryBlock.find('.booked-appt-list').addClass('shown');
						adjust_calendar_boxes();
					}
				});
			}
		}
	});
	
	function bookedRemoveEmptyTRs(){
		"use strict";
		KES('table.booked-calendar').find('tr.week').each(function(){
			if (KES(this).children().length === 0){
				KES(this).remove();
			}
		});
	}

	// Saving state updater
	function savingState(show,limit_to){
		"use strict";

		show = typeof show !== 'undefined' ? show : true;
		limit_to = typeof limit_to !== 'undefined' ? limit_to : false;

		if (limit_to){

			var KESsavingStateDIV = limit_to.find('li.active .savingState, .topSavingState.savingState, .calendarSavingState');
			var KESstuffToHide = limit_to.find('.monthName');
			var KESstuffToTransparent = limit_to.find('table.booked-calendar tbody');

		} else {

			var KESsavingStateDIV = KES('li.active .savingState, .topSavingState.savingState, .calendarSavingState');
			var KESstuffToHide = KES('.monthName');
			var KESstuffToTransparent = KES('table.booked-calendar tbody');

		}

		if (show){
			KESsavingStateDIV.fadeIn(200);
			KESstuffToHide.hide();
			KESstuffToTransparent.animate({'opacity':0.2},100);
		} else {
			KESsavingStateDIV.hide();
			KESstuffToHide.show();
			KESstuffToTransparent.animate({'opacity':1},0);
		}

	}

	KES(document).ajaxStop(function() {
		"use strict";
		savingState(false);
	});
	
	function init_appt_list_date_picker(){
		"use strict";
		
		KES('.booked_list_date_picker').each(function(){
			var thisDatePicker = KES(this);
			var minDateVal = thisDatePicker.parents('.booked-appt-list').attr('data-min-date');
			var maxDateVal = thisDatePicker.parents('.booked-appt-list').attr('data-max-date');
			if (typeof minDateVal === 'undefined'){ var minDateVal = thisDatePicker.attr('data-min-date'); }
		
			thisDatePicker.datepicker({
		        dateFormat: 'yy-mm-dd',
		        minDate: minDateVal,
		        maxDate: maxDateVal,
		        showAnim: false,
		        beforeShow: function(input, inst) {
					KES('#ui-datepicker-div').removeClass();
					KES('#ui-datepicker-div').addClass('booked_custom_date_picker');
			    },
			    onClose: function(dateText){
					KES('.booked_list_date_picker_trigger').removeClass('booked-dp-active'); 
			    },
			    onSelect: function(dateText){
				   
				   	var thisInput 			= KES(this),
						date				= dateText,
						thisList			= thisInput.parents('.booked-list-view'),
						defaultDate			= thisList.attr('data-default'),
						calendar_id			= thisInput.parents('.booked-list-view-nav').attr('data-calendar-id');
						
					if (typeof defaultDate === 'undefined'){ defaultDate = false; }
						
					if (!calendar_id){ calendar_id = 0; }
					thisList.addClass('booked-loading');
					
					var booked_load_list_view_date_booking_options = {
						'action'		: 'booked_appointment_list_date',
						'date'			: date,
						'calendar_id'	: calendar_id,
						'force_default'	: defaultDate
					};
					
					KES(document).trigger("booked-before-loading-appointment-list-booking-options");
					thisList.spin('booked_top');
				
					KES.ajax({
						url: booked_js_vars.ajax_url,
						type: 'post',
						data: booked_load_list_view_date_booking_options,
						success: function( html ) {
							
							thisList.html( html );
							
							init_appt_list_date_picker();
							setTimeout(function(){
								thisList.removeClass('booked-loading');
							},1);
							
						}
					});
					
					return false;
			    }
		    });
		    
		});
		
		KES('body').on('click','.booked_list_date_picker_trigger',function(e){
			e.preventDefault();
			if (!KES(this).hasClass('booked-dp-active')){
				KES(this).addClass('booked-dp-active');
				KES(this).parents('.booked-appt-list').find('.booked_list_date_picker').datepicker('show');
			}
			
	    }); 
	    
	}

	var BookedTabs = {
		bookingModalSelector: '.booked-modal',
		tabSelector: '.booked-tabs',
		tabNavSelector: '.booked-tabs-nav span',
		tabCntSelector: '.booked-tabs-cnt',

		Init: function() {
			KES(document).on( 'click', this.tabNavSelector, this.tabsNav );
		},

		tabsNav: function( event ) {
			event.preventDefault();

			BookedTabs.switchToTab( KES(this) );
			BookedTabs.maybeResizeBookingModal();
		},

		switchToTab: function( tab_nav_item ) {
			var KESnav_item = tab_nav_item,
				tab_cnt_class = '.' + KESnav_item.data('tab-cnt'),
				KEStabs_container = KESnav_item.parents( BookedTabs.tabSelector );

			KESnav_item
				.addClass( 'active' )
				.siblings()
				.removeClass( 'active' )

			KEStabs_container
				.find( BookedTabs.tabCntSelector + ' ' + tab_cnt_class )
				.addClass( 'active' )
				.siblings()
				.removeClass( 'active' );
		},

		maybeResizeBookingModal: function() {
			if ( ! KES(BookedTabs.bookingModalSelector).length ) {
				return;
			}
			
			resize_booked_modal();
		}
	}

})(jQuery, window, document);

// Create Booked Modal
function create_booked_modal(){
	"use strict";
	var windowHeight = jQuery(window).height();
	var windowWidth = jQuery(window).width();
	if (windowWidth > 720){
		var maxModalHeight = windowHeight - 295;
	} else {
		var maxModalHeight = windowHeight;
	}
	
	jQuery('body input, body textarea, body select').blur();
	jQuery('body').addClass('booked-noScroll');
	jQuery('<div class="booked-modal bm-loading"><div class="bm-overlay"></div><div class="bm-window"><div style="height:100px"></div></div></div>').appendTo('body');
	jQuery('.booked-modal .bm-overlay').spin('booked_white');
	jQuery('.booked-modal .bm-window').css({'max-height':maxModalHeight+'px'});
}

var previousRealModalHeight = 100;

function resize_booked_modal(){
	"use strict";
	
	var windowHeight = jQuery(window).height();
	var windowWidth = jQuery(window).width();
	
	var common43 = 43;
	
	if (jQuery('.booked-modal .bm-window .booked-scrollable').length){
		var realModalHeight = jQuery('.booked-modal .bm-window .booked-scrollable')[0].scrollHeight;
		
		if (realModalHeight < 100){
			realModalHeight = previousRealModalHeight;
		} else {
			previousRealModalHeight = realModalHeight;
		}
		
	} else {
		var realModalHeight = 0;
	}
	var minimumWindowHeight = realModalHeight + common43 + common43;
	var modalScrollableHeight = realModalHeight - common43;
	var maxModalHeight;
	var maxFormHeight;
	
	if (windowHeight < minimumWindowHeight){
		modalScrollableHeight = windowHeight - common43 - common43;
	} else {
		modalScrollableHeight = realModalHeight;
	}
	
	if (windowWidth > 720){
		maxModalHeight = modalScrollableHeight - 25;
		maxFormHeight = maxModalHeight - 15;
		var modalNegMargin = (maxModalHeight + 78) / 2;
	} else {
		maxModalHeight = windowHeight - common43;
		maxFormHeight = maxModalHeight - 60 - common43;
		var modalNegMargin = (maxModalHeight) / 2;
	}
	
	jQuery('.booked-modal').css({'margin-top':'-'+modalNegMargin+'px'});
	jQuery('.booked-modal .bm-window').css({'max-height':maxModalHeight+'px'});
	jQuery('.booked-modal .bm-window .booked-scrollable').css({'max-height':maxFormHeight+'px'});
	
}

function close_booked_modal(){
	"use strict";
	var modal = jQuery('.booked-modal');
	modal.fadeOut(200);
	modal.addClass('bm-closing');
	jQuery('body').removeClass('booked-noScroll');
	setTimeout(function(){
		modal.remove();
	},300);
}

function init_tooltips(container){
	"use strict";
	jQuery('.tooltipster').tooltipster({
		theme: 		'tooltipster-light',
		animation:	'grow',
		speed:		200,
		delay: 		100,
		offsetY:	-13
	});
}

// Function to adjust calendar sizing
function adjust_calendar_boxes(){
	"use strict";
	jQuery('.booked-calendar').each(function(){
		
		var windowWidth = jQuery(window).width();
		var smallCalendar = jQuery(this).parents('.booked-calendar-wrap').hasClass('small');
		var boxesWidth = jQuery(this).find('tbody tr.week td').width();
		var calendarHeight = jQuery(this).height();
		var boxesHeight = boxesWidth * 1;
		jQuery(this).find('tbody tr.week td').height(boxesHeight);
		jQuery(this).find('tbody tr.week td .date').css('line-height',boxesHeight+'px');
		jQuery(this).find('tbody tr.week td .date .number').css('line-height',boxesHeight+'px');
		if (smallCalendar || windowWidth < 720){
			jQuery(this).find('tbody tr.week td .date .number').css('line-height',boxesHeight+'px');
		} else {
			jQuery(this).find('tbody tr.week td .date .number').css('line-height','');
		}

		var calendarHeight = jQuery(this).height();
		jQuery(this).parent().height(calendarHeight);

	});
}