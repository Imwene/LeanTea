/*
 * jQuery Superfish Menu Plugin - v1.7.4
 * Copyright (c) 2013 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *	http://www.opensource.org/licenses/mit-license.php
 *	http://www.gnu.org/licenses/gpl.html
 */

;(function (KES) {
	"use strict";

	var methods = (function () {
		// private properties and methods go here
		var c = {
				bcClass: 'sf-breadcrumb',
				menuClass: 'sf-js-enabled',
				anchorClass: 'sf-with-ul',
				menuArrowClass: 'sf-arrows'
			},
			ios = (function () {
				var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
				if (ios) {
					// iOS clicks only bubble as far as body children
					KES(window).on('load',function () {
						KES('body').children().on('click', KES.noop);
					});
				}
				return ios;
			})(),
			wp7 = (function () {
				var style = document.documentElement.style;
				return ('behavior' in style && 'fill' in style && /iemobile/i.test(navigator.userAgent));
			})(),
			toggleMenuClasses = function (KESmenu, o) {
				var classes = c.menuClass;
				if (o.cssArrows) {
					classes += ' ' + c.menuArrowClass;
				}
				KESmenu.toggleClass(classes);
			},
			setPathToCurrent = function (KESmenu, o) {
				return KESmenu.find('li.' + o.pathClass).slice(0, o.pathLevels)
					.addClass(o.hoverClass + ' ' + c.bcClass)
						.filter(function () {
							return (KES(this).children(o.popUpSelector).hide().show().length);
						}).removeClass(o.pathClass);
			},
			toggleAnchorClass = function (KESli) {
				KESli.children('a').toggleClass(c.anchorClass);
			},
			toggleTouchAction = function (KESmenu) {
				var touchAction = KESmenu.css('ms-touch-action');
				touchAction = (touchAction === 'pan-y') ? 'auto' : 'pan-y';
				KESmenu.css('ms-touch-action', touchAction);
			},
			applyHandlers = function (KESmenu, o) {
				var targets = 'li:has(' + o.popUpSelector + ')';
				if (KES.fn.hoverIntent && !o.disableHI) {
					KESmenu.hoverIntent(over, out, targets);
				}
				else {
					KESmenu
						.on('mouseenter.superfish', targets, over)
						.on('mouseleave.superfish', targets, out);
				}
				var touchevent = 'MSPointerDown.superfish';
				if (!ios) {
					touchevent += ' touchend.superfish';
				}
				if (wp7) {
					touchevent += ' mousedown.superfish';
				}
				KESmenu
					.on('focusin.superfish', 'li', over)
					.on('focusout.superfish', 'li', out)
					.on(touchevent, 'a', o, touchHandler);
			},
			touchHandler = function (e) {
				var KESthis = KES(this),
					KESul = KESthis.siblings(e.data.popUpSelector);

				if (KESul.length > 0 && KESul.is(':hidden')) {
					KESthis.one('click.superfish', false);
					if (e.type === 'MSPointerDown') {
						KESthis.trigger('focus');
					} else {
						KES.proxy(over, KESthis.parent('li'))();
					}
				}
			},
			over = function () {
				var KESthis = KES(this),
					o = getOptions(KESthis);
				clearTimeout(o.sfTimer);
				KESthis.siblings().superfish('hide').end().superfish('show');
			},
			out = function () {
				var KESthis = KES(this),
					o = getOptions(KESthis);
				if (ios) {
					KES.proxy(close, KESthis, o)();
				}
				else {
					clearTimeout(o.sfTimer);
					o.sfTimer = setTimeout(KES.proxy(close, KESthis, o), o.delay);
				}
			},
			close = function (o) {
				o.retainPath = (KES.inArray(this[0], o.KESpath) > -1);
				this.superfish('hide');

				if (!this.parents('.' + o.hoverClass).length) {
					o.onIdle.call(getMenu(this));
					if (o.KESpath.length) {
						KES.proxy(over, o.KESpath)();
					}
				}
			},
			getMenu = function (KESel) {
				return KESel.closest('.' + c.menuClass);
			},
			getOptions = function (KESel) {
				return getMenu(KESel).data('sf-options');
			};

		return {
			// public methods
			hide: function (instant) {
				if (this.length) {
					var KESthis = this,
						o = getOptions(KESthis);
					if (!o) {
						return this;
					}
					var not = (o.retainPath === true) ? o.KESpath : '',
						KESul = KESthis.find('li.' + o.hoverClass).add(this).not(not).removeClass(o.hoverClass).children(o.popUpSelector),
						speed = o.speedOut;

					if (instant) {
						KESul.show();
						speed = 0;
					}
					o.retainPath = false;
					o.onBeforeHide.call(KESul);
					KESul.stop(true, true).animate(o.animationOut, speed, function () {
						var KESthis = KES(this);
						o.onHide.call(KESthis);
					});
				}
				return this;
			},
			show: function () {
				var o = getOptions(this);
				if (!o) {
					return this;
				}
				var KESthis = this.addClass(o.hoverClass),
					KESul = KESthis.children(o.popUpSelector);

				o.onBeforeShow.call(KESul);
				KESul.stop(true, true).animate(o.animation, o.speed, function () {
					o.onShow.call(KESul);
				});
				return this;
			},
			destroy: function () {
				return this.each(function () {
					var KESthis = KES(this),
						o = KESthis.data('sf-options'),
						KEShasPopUp;
					if (!o) {
						return false;
					}
					KEShasPopUp = KESthis.find(o.popUpSelector).parent('li');
					clearTimeout(o.sfTimer);
					toggleMenuClasses(KESthis, o);
					toggleAnchorClass(KEShasPopUp);
					toggleTouchAction(KESthis);
					// remove event handlers
					KESthis.off('.superfish').off('.hoverIntent');
					// clear animation's inline display style
					KEShasPopUp.children(o.popUpSelector).attr('style', function (i, style) {
						return style.replace(/display[^;]+;?/g, '');
					});
					// reset 'current' path classes
					o.KESpath.removeClass(o.hoverClass + ' ' + c.bcClass).addClass(o.pathClass);
					KESthis.find('.' + o.hoverClass).removeClass(o.hoverClass);
					o.onDestroy.call(KESthis);
					KESthis.removeData('sf-options');
				});
			},
			init: function (op) {
				return this.each(function () {
					var KESthis = KES(this);
					if (KESthis.data('sf-options')) {
						return false;
					}
					var o = KES.extend({}, KES.fn.superfish.defaults, op),
						KEShasPopUp = KESthis.find(o.popUpSelector).parent('li');
					o.KESpath = setPathToCurrent(KESthis, o);

					KESthis.data('sf-options', o);

					toggleMenuClasses(KESthis, o);
					toggleAnchorClass(KEShasPopUp);
					toggleTouchAction(KESthis);
					applyHandlers(KESthis, o);

					KEShasPopUp.not('.' + c.bcClass).superfish('hide', true);

					o.onInit.call(this);
				});
			}
		};
	})();

	KES.fn.superfish = function (method, args) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		}
		else {
			return KES.error('Method ' +  method + ' does not exist on jQuery.fn.superfish');
		}
	};

	KES.fn.superfish.defaults = {
		popUpSelector: 'ul,.sf-mega', // within menu context
		hoverClass: 'sfHover',
		pathClass: 'overrideThisToUse',
		pathLevels: 1,
		delay: 800,
		animation: {opacity: 'show'},
		animationOut: {opacity: 'hide'},
		speed: 'normal',
		speedOut: 'fast',
		cssArrows: true,
		disableHI: false,
		onInit: KES.noop,
		onBeforeShow: KES.noop,
		onShow: KES.noop,
		onBeforeHide: KES.noop,
		onHide: KES.noop,
		onIdle: KES.noop,
		onDestroy: KES.noop
	};

	// soon to be deprecated
	KES.fn.extend({
		hideSuperfishUl: methods.hide,
		showSuperfishUl: methods.show
	});

})(jQuery);
