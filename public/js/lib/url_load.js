/**
 * Created by bcouriol on 30/05/14.
 */

   // jquery.xdomainajax.js  ------ from padolsey

define(['jquery'], function ($) {
          $.ajaxx = (function (_ajax) {

             var protocol = location.protocol, hostname = location.hostname, exRegex = RegExp(protocol + '//' +
                                                                                              hostname), YQL = 'http' +
                                                                                                               (/^https/.test(protocol) ?
                                                                                                                's' :
                                                                                                                '') +
                                                                                                               '://query.yahooapis.com/v1/public/yql?callback=?', query = 'select * from html where url="{URL}" and xpath="*"';
             //console.log("YQL : " + YQL);

             function isExternal(url) {
                return !exRegex.test(url) && /:\/\//.test(url);
             }

             return function (o) {

                var url = o.url;

                if (/get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url)) {

                   // Manipulate options so that JSONP-x request is made to YQL

                   o.url = YQL;
                   o.dataType = 'json';

                   o.data = {
                      q     : query.replace('{URL}',
                                            url + (o.data ? (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data) : '')),
                      format: 'xml'
                   };

                   // Since it's a JSONP request
                   // complete === success
                   if (!o.success && o.complete) {
                      o.success = o.complete;
                      delete o.complete;
                   }

                   o.success = (function (_success) {
                      return function (data) {

                         if (_success && data && data.results && data.results.length > 0) {
                            // Fake XHR callback.
                            _success.call(this, {
                               responseText: data.results[0]// YQL screws with <script>s
                                  // Get rid of them
                                  .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                            }, 'success');
                         } else {
                            _success.call(this, {
                               responseText: null//return null if for some reason there is not text obtained
                            }, 'error');
                         }

                      };
                   })(o.success);

                }

                return _ajax.apply(this, arguments);

             };

          })($.ajax);

          return {
             url_load : function (your_url, callback) {
                var protomatch = /^(https?|ftp):\/\//; // NB: not '.*'
                var url = your_url.replace(protomatch, '');
                return $.ajax({
                          crossOrigin: true,
                          url: 'http://www.corsproxy.com/' + url
                       });
             },
             url_load2: function (your_url, callback) {
                logEntry("url_load");
                $.ajax({
                          url    : your_url,
                          type   : 'GET',
                          success: function (res, error) {
                             var html_text = res.responseText;
                             // then you can manipulate your text as you wish
                             // NOTE: the html is modified to be more correct (for instance <p> tags are added to table contents
                             callback(html_text);
                          }
                       });
                logExit("url_load");
             }
          }
       });
