window.jQuery( document ).on("ready", function ( KES ) {
	"use strict";
	jQuery( 'body' ).on( 'adding_to_cart', function ( event, KESbutton, data ) {
		KESbutton && KESbutton.hasClass( 'vc_gitem-link' ) && KESbutton
			.addClass( 'vc-gitem-add-to-cart-loading-btn' )
			.parents( '.vc_grid-item-mini' )
			.addClass( 'vc-woocommerce-add-to-cart-loading' )
			.append( KES( '<div class="vc_wc-load-add-to-loader-wrapper"><div class="vc_wc-load-add-to-loader"></div></div>' ) );
	} ).on( 'added_to_cart', function ( event, fragments, cart_hash, KESbutton ) {
		if ( 'undefined' === typeof(KESbutton) ) {
			KESbutton = KES( '.vc-gitem-add-to-cart-loading-btn' );
		}
		KESbutton && KESbutton.hasClass( 'vc_gitem-link' ) && KESbutton
			.removeClass( 'vc-gitem-add-to-cart-loading-btn' )
			.parents( '.vc_grid-item-mini' )
			.removeClass( 'vc-woocommerce-add-to-cart-loading' )
			.find( '.vc_wc-load-add-to-loader-wrapper' ).remove();
	} );
} );
