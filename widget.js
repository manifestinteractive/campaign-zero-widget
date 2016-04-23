(function () {

  var scriptName = 'widget.js';
  var jQuery;
  var jqueryPath = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.3/jquery.min.js';
  var jqueryVersion = '1.12.3';
  var scriptTag;
  var elementName = 'campaign-zero-widget';

  /** Get reference to self (scriptTag) */
  var allScripts = document.getElementsByTagName('script');
  var targetScripts = [];

  for (var i in allScripts) {
    var name = allScripts[i].src;
    if(name && name.indexOf(scriptName) > 0)
      targetScripts.push(allScripts[i]);
  }

  scriptTag = targetScripts[targetScripts.length - 1];

  /** helper function to load external scripts */
  function loadScript(src, onLoad) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute('type', 'text/javascript');
    script_tag.setAttribute('src', src);

    if (script_tag.readyState) {
      script_tag.onreadystatechange = function () {
        if (this.readyState == 'complete' || this.readyState == 'loaded') {
          onLoad();
        }
      };
    } else {
      script_tag.onload = onLoad;
    }
    (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(script_tag);
  }

  /** helper function to load external css  */
  function loadCss(href) {
    var link_tag = document.createElement('link');
    link_tag.setAttribute('type', 'text/css');
    link_tag.setAttribute('rel', 'stylesheet');
    link_tag.setAttribute('href', href);
    (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(link_tag);
  }

  /** load jquery into 'jQuery' variable then call main */
  if (window.jQuery === undefined || window.jQuery.fn.jquery !== jqueryVersion) {
    loadScript(jqueryPath, initjQuery);
  } else {
    initjQuery();
  }

  function initjQuery() {
    jQuery = window.jQuery.noConflict(true);
    main();
  }

  /** starting point for widget */
  function main() {

    // load widget css
    loadCss('./widget.css');

    jQuery(document).ready(function ($) {

      // check for existing element, otherwise create it
      if(jQuery('#' + elementName).length === 0){
        jQuery('<div id="' + elementName + '"></div>').insertBefore(scriptTag);
      }

      var elm = jQuery('#' + elementName);
      var html = '<div class="wrapper" style="display: none">'+
        '<h2>End Police Violence</h2>' +
        '<p class="intro">Where does your rep stand?</p>' +
        '<form id="campaign-zero-form">' +
        '<input type="text" name="location" placeholder="Zip Code or Name">' +
        '<button>Find your rep</button>' +
        '</form>' +
        '<small class="powered-by"><span>Powered by </span><a href="http://www.joincampaignzero.org/" target="_blank">Campaign Zero</a></small>' +
        '<a class="add-to-site" href="https://github.com/manifestinteractive/campaign-zero-widget" target="_blank">Add <span>this</span> to <span>your</span> site</a>' +
        '</div>';

      elm.append(html);
      jQuery('.wrapper', elm).fadeIn();

      //or you could wait until the page is ready

      //example jsonp call
      //var jsonp_url = 'www.example.com/jsonpscript.js?callback=?';
      //jQuery.getJSON(jsonp_url, function(result) {
      //	alert('win');
      //});

      //example script load
      //loadScript('http://example.com/anotherscript.js', function() { /* loaded */ });
    });

  }

})();
