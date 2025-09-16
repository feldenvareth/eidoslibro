var KubideAnalytics = function (GA_ACCOUNT) {
    /**
     * By default the app don't have permission to install cookies
     * false: open to install
     * true: install blocked
     *
     * @type {boolean}
     * @private
     */
    var robinson = true;

    /**
     * Var to show or hide user notice
     * @type {boolean}
     */
    var showNotice = true;

    /**
     * Name for cookie that remember the user choice
     * @type {string}
     */
    var rememberCookieName = 'gaRob';

    /**
     * Actual remember user choice cookie value
     *
     * @type {string}
     */
    var cookie = getCookie(rememberCookieName);

    /**
     * Cache all events and page meanwhile Google Analytics is loaded
     *
     * @type {object}
     */
    var cache = {
        pageViews: [],
        events: []
    };

    /**
     * Define Google Analytics Account
     *
     * @type {_gaq|*|Array}
     * @private
     */
    window._gaq = window._gaq || [];
    window._gaq.push(['_setAccount', GA_ACCOUNT]);


    /**
     * Get cookie
     *
     * @param c_name
     * @returns {HTMLCollection}
     */
    function getCookie(c_name){
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1){
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start == -1){
            c_value = null;
        }else{
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1){
                c_end = c_value.length;
            }
            c_value = decodeURIComponent(c_value.substring(c_start,c_end));
        }
        return c_value;
    }


    /**
     * Set cookie
     *
     * @param c_name
     * @param value
     * @param exdays
     */
    function setCookie(c_name,value,exdays){
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value=encodeURIComponent(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        document.cookie=c_name + "=" + c_value;
    }

    // Init
    switch (cookie) {
        case '-1':
            // user has approved cookies
            robinson = false;
            showNotice = false;
            installGoogleAnalytics();
            break;
        case '1':
            // user has banned cookies
            showNotice = false;
            break;
    }

    /**
     * Return user privacy setting
     *
     * @returns {boolean}
     */
    function getRobinson () {
        return robinson;
    }

    /**
     * Change user privacy setting
     *
     * @param newValue
     */
    function setRobinson (newValue) {
        // If has changed the value of the cookie
        if (cookie != newValue) {
            // if user has decline cookies don't take new actions
            if (cookie !== 1) {
                if (newValue) {
                    // Save user decline cookies
                    cookie = 1;
                    setCookie(rememberCookieName, cookie, 365 );
                    showNotice = false;

                    // Disable and delete cookies
                    deleteGoogleAnalytics();

                } else {
                    // Save user approved cookies
                    cookie = -1;
                    setCookie(rememberCookieName, cookie, 365 );
                    showNotice = false;

                    // Install Google Analytics
                    installGoogleAnalytics();
                }
            }
        }
    }

    /**
     * Return showNotice
     *
     * @returns {boolean}
     */
    function showNoticeCheck() {
        return showNotice;
    }

    /**
     * Download script of Google Analytics and repeat cache calls
     */
    function installGoogleAnalytics() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);

        robinson = false;

        // send all stored petitions
        cacheFlush();
    }

    /**
     * Disable new tracks to Google Analytics
     */
    function deleteGoogleAnalytics() {
        // TODO: remove cookies
        robinson = true;
    }

    /**
     * Save a PageView into cache
     *
     * @param pageView
     * @param options
     */
    function cachePageView(pageView, options) {
        cache.pageViews.push(
            {
                pageView: pageView,
                options: options
            }
        );
    }

    /**
     * Save a event into cache
     *
     * @param options
     */
    function cacheEvent(options) {
        cache.events.push(
            {
                options: options
            }
        );
    }

    /**
     * Repeat cached calls
     */
    function cacheFlush() {
        for (i = 0; i < cache.events.length; ++i) {
            log(cache.events[i].options);
        }

        for (i = 0; i < cache.pageViews.length; ++i) {
            trackPageView(cache.pageViews[i].pageView, cache.pageViews[i].options);
        }

        //clear cache
        cache = {
            pageViews: [],
            events: []
        };
    }


    /**
     * Principal access point. Make the call to the correct method
     *
     * @param options
     * @param flags
     * @returns {boolean}
     */
    function log (options, flags) {
        if (flags === undefined) {
            flags = {};
        }

        if (flags.disableAnalytics) {
            return false;
        }

        if (!flags.disableTrackEvent && options.category && options.action && options.label) {
            trackEvent (options);
        }

        if (!flags.disablePageView && options.pageView) {
            trackPageView (options.pageView, options);
        }

        if (flags.enableAddWords && options) {
            trackAddWordsConversion (options);
        }

        if (flags.enableFacebook && options) {
            trackFacebookConversion (options);
        }

        return true;
    }

    /**
     * Track Google Analytics event
     *
     * @param options
     * @returns {boolean}
     */
    function trackEvent (options) {
        if (getRobinson() === true) {
            cacheEvent(options);
            return false;
        }

        function isInt(n) {
            return typeof n === 'number' && n % 1 == 0;
        }

        if (!isInt(options.value)) {
            options.value = null;
        }

        window._gaq.push(['_trackEvent', options.category, options.action, options.label, options.value]);

        return true;
    }

    /**
     * Track Google Analytics PageView
     *
     * @param url
     * @param options
     * @returns {boolean}
     */
    function trackPageView (url,options) {
        if (getRobinson() === true) {
            cachePageView(url, options);
            return false;
        }
        window._gaq.push(['_trackPageview', url]);

        return true;
    }

    /**
     * Track Google AddWordsConversion
     *
     * @param options
     * @returns {boolean}
     */
    function trackAddWordsConversion(options) {
        if (getRobinson() === true) {
            return false;
        }

        window.google_conversion_id =  options.conversion_id;
        window.google_conversion_language = options.conversion_languaje;
        window.google_conversion_format = options.conversion_format;
        window.google_conversion_color = options.conversion_color;
        window.google_conversion_label = options.conversion_label;
        window.google_conversion_value = options.conversion_value;
        window.google_remarketing_only = options.remarketing_only;

        var gaw = document.createElement('script'); gaw.type = 'text/javascript'; gaw.async = true;
        gaw.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'www.googleadservices.com/pagead/conversion.js';
        var s_gaw = document.getElementsByTagName('script')[0]; s_gaw.parentNode.insertBefore(ga, s_gaw);

        return true;
    }

    /**
     * Track pixel Facebook Conversion
     *
     * @param options
     * @returns {boolean}
     */
    function trackFacebookConversion(options) {
        if (getRobinson() === true) {
            return false;
        }

        var img = new Image();
        img.src = options.img_src;

        return true;
    }


    /**
     * Return public object access points
     */
    return {
        showNotice: showNoticeCheck,
        setRobinson:  setRobinson,
        log: log,
        trackEvent: trackEvent,
        trackPageView: trackPageView,
        trackAddWordsConversion: trackAddWordsConversion,
        trackFacebookConversion: trackFacebookConversion
    };
};
