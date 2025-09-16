/***********************************************************
 * GOOGLE ANALYTICS
 ***********************************************************/
var analytics = new KubideAnalytics('UA-68825068-1');
analytics.trackPageView(window.location.url);


//
//  ON DOCUMENT READY
//
jQuery(document).ready(function() {
	'use strict';

    /***********************************************************
     * ANALYTICS
     ***********************************************************/
    var show_cookie_notice = analytics.showNotice();
    var cookie_notice = jQuery('#cookie-notice');

    if (show_cookie_notice && cookie_notice.length) {
        cookie_notice.addClass('show');console.log("caca");
        jQuery('body').on('click.cookies', function(event){
            // Accept cookies
            analytics.setRobinson(false);
            cookie_notice.removeClass('show');
            //console.log('Cookies accepted');

            // Unbind accept event
            $('body').off('click.cookies');
        });

        cookie_notice.on('click.cookies', '.decline', function(event){
            event.stopPropagation();

            // Denies cookies
            analytics.setRobinson(true);
            cookie_notice.removeClass('show');
            //console.log('Cookies declined');

            // Unbind accept event
            $('body').off('click.cookies');
        });
    }
});
