(function () {

  var scriptName = 'widget.js';
  var jQuery;
  var jqueryPath = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.3/jquery.min.js';
  var jqueryVersion = '1.12.3';
  var scriptTag;
  var elementName = 'campaign-zero-widget';
  var geoEnabled = null;
  var geoLocation = {};
  var geoError = null;
  var timeout = null;

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

  /** Get Geo Location */
  function getLocation() {
    if(geoLocation && geoLocation.latitude && geoLocation.longitude){
      geoSuccess({
        coords: geoLocation
      });

    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
      geoEnabled = true;
    } else {
      geoEnabled = false;
    }
  }

  /** Geo Location Success */
  function geoSuccess(position) {
    geoLocation = position.coords;
    getRepresentatives(geoLocation);
  }

  /** Geo Location Error */
  function geoError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        geoError = 'Denied Request for Geolocation.';
        break;
      case error.POSITION_UNAVAILABLE:
        geoError = 'Location Information Unavailable.';
        break;
      case error.TIMEOUT:
        geoError = 'Location Request Timed Out.';
        break;
      case error.UNKNOWN_ERROR:
        geoError = 'Unable to Determine Location.';
        break;
    }

    showError(geoError);
  }

  function showError(error){
    var elm = jQuery('#' + elementName);
    jQuery('small.note', elm).html('<i class="fa fa-exclamation-triangle"></i>&nbsp; ' + error).addClass('error animated shake');
    jQuery('button.submit', elm).removeAttr('disabled').html('Find your rep');
    clearTimeout(timeout);
    timeout = setTimeout(function(){
      jQuery('small.note', elm).removeClass('error animated shake').html('leave empty to use your current location');
    }, 5000);
  }

  /** Load Initial Widget Form */
  function loadForm(){
    var elm = jQuery('#' + elementName);
    elm.html('');

    var html = '<div class="wrapper animated fadeIn" style="display: none">'+
      '<h2>End Police Violence</h2>' +
      '<p class="intro">Where does your rep stand?</p>' +
      '<form id="campaign-zero-form">' +
      '<input autocomplete="off" type="text" name="location" id="zip-code" placeholder="Enter your Zip Code" minlength="5" maxlength="5" onkeyup="this.value=this.value.replace(/[^0-9]/g,\'\');">' +
      '<small class="note">leave empty to use your current location</small>' +
      '<button class="submit" type="submit">Find your rep</button>' +
      '</form>' +
      '<small class="powered-by"><span>Powered by </span><a href="http://www.joincampaignzero.org/" target="_blank">Campaign Zero</a></small>' +
      '<a class="add-to-site" href="https://github.com/manifestinteractive/campaign-zero-widget" target="_blank">Add <span>this</span> to <span>your</span> site</a>' +
      '</div>';

    elm.append(html);

    setTimeout(function(){
      jQuery('.wrapper', elm).show();

      jQuery('#campaign-zero-form').submit(function(event) {

        jQuery('button.submit', elm).attr('disabled', 'disabled').html('<i class="fa fa-circle-o-notch fa-spin fa-fw"></i> Loading');

        var zipcode = jQuery('#zip-code').val();
        var pattern = /[0-9]{5}/g;

        if(zipcode !== '' && pattern.test(zipcode)){
          getRepresentatives(null, zipcode);
        } else if(zipcode !== '' && !pattern.test(zipcode)) {
          showError('Invalid Zip Code ( e.g. 90210 )');
        } else if(zipcode === '') {
          getLocation();
        }

        event.preventDefault();
      });
    }, 200);
  }

  /** Generate Results */
  function generateResults(response){
    var elm = jQuery('#' + elementName);

    jQuery('.wrapper', elm).removeClass('animated fadeIn');
    jQuery('.wrapper', elm).addClass('animated fadeOut');

    setTimeout(function(){
      elm.html('');

      var backgroundImage = 'https://maps.googleapis.com/maps/api/staticmap?center='+ response.location.latitude +','+ response.location.longitude +'&zoom=10&maptype=roadmap&size=800x600&sensor=false&style=feature:administrative|visibility:off&style=feature:landscape.natural.terrain|visibility:off&style=feature:poi|visibility:off&style=element:labels|visibility:off&style=feature:road|element:labels|visibility:off&style=feature:transit|visibility:off&style=feature:road|element:geometry|visibility:simplified|color:0x999999&style=feature:water|element:geometry|color:0xcccccc&style=feature:landscape|element:geometry.fill|color:0xaaaaaa';
      var html = '<div class="wrapper animated fadeIn" style="display: none; min-height: 298px; background: url('+ backgroundImage +') center center no-repeat; background-size: cover;">';

      if(response && response.results.length === 1){

      } else if (response && response.results.length >= 1){
        html += '<h2 class="black">Pick a Representative</h2>';
        html += '<ul>';

        for (var key in response.results) {
          if (response.results.hasOwnProperty(key)) {
            var val = response.results[key];
            html += '<li><a href="javascript:void(0)" class="representative-summary" data-id="'+ key +'">' +
              '<div class="avatar ' + val.party.toLowerCase() + '" style="background-image: url(' + val.photo_url + ')"></div>' +
              '<div class="summary">'+
                '<div class="summary-name ' + val.party.toLowerCase() + '">' + val.full_name + '</div>' +
                '<div class="summary-details">Party: ' + val.party + ' &nbsp;|&nbsp; District: ' + val.district + '</div>' +
              '</div>' +
              '</a></li>';
          }
        }

        html += '</ul></div>';

        html += '<small class="powered-by back"><a href="javascript:void(0);"><i class="fa fa-angle-left"></i>&nbsp; Back</a></small>';

        elm.append(html);

        setTimeout(function(){
          jQuery('.wrapper', elm).show();
          jQuery('small.back a', elm).click(function(){ loadForm(); });
          jQuery('a.representative-summary', elm).click(function(){
            var id = jQuery(this).data('id');
            var representative = response.results[id];
            console.log(representative);
          });
        }, 200);

      } else if (response && response.results.length === 0){

      }

    }, 200);
  }

  /** Handle Form Submission */
  function getRepresentatives(geoLocation, zipCode){

    var jsonpUrl = 'index.php';
    if(geoLocation){
      jsonpUrl += '?latitude=' + geoLocation.latitude + '&longitude=' + geoLocation.longitude
    } else if(zipCode){
      jsonpUrl += '?zipcode=' + zipCode
    } else {
      return false;
    }

    jQuery.ajax({
      url: jsonpUrl,
      type: 'GET',
      dataType: 'json',
      success: function(response) {
        if(response && response.error){
          showError(response.error);
        } else {
          generateResults(response);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        showError('ERROR: ' + errorThrown);
      }
    });
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

      loadForm();
    });
  }

})();
