(function() {
  var gram;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  gram = {};
  gram.Client = (function() {
    function Client(auth) {
      this.auth = auth;
      console.log("creating client");
      this;
    }
    Client.prototype.get = function(path, args, handler) {
      if (args == null) {
        args = {};
      }
      if (handler == null) {
        handler = function(meta, data) {
          return data;
        };
      }
      return $.getJSON("https://api.instagram.com/v1/" + path + "/?callback=?&access_token=" + this.auth.accessToken, args, function(resp) {
        switch (resp.meta.code) {
          case 200:
            return handler(resp.meta, resp.data);
          case 400:
            localStorage.token = null;
            return this.auth.onFail();
        }
      });
    };
    Client.prototype.popularMedia = function(handler) {
      return get('media/popular', handler);
    };
    return Client;
  })();
  gram.Auth = (function() {
    Auth.url = "https://api.instagram.com/oauth/authorize/";
    function Auth(options) {
      if (options == null) {
        options = {};
      }
      this.redirectUri = options.redirectUri || "http://localhost:8080";
      this.clientId = options.clientId || "ebdbf3f3444f484d885eb58ab53549b4";
      this.token = options.token || localStorage.token;
    }
    Auth.prototype.token = function(at) {
      localStorage.token = at;
      this.token = at;
      return this;
    };
    Auth.prototype.authenticator = function(authenticator) {
      this.authenticator = authenticator;
      return this;
    };
    Auth.prototype.accessToken = function() {
      return this.token;
    };
    Auth.prototype.onFail = function() {
      localStorage.token = null;
      return this.authenticator.authenticate;
    };
    return Auth;
  })();
  gram.UserAgent = (function() {
    function UserAgent(auth) {
      this.auth = auth;
      this.connect = __bind(this.connect, this);;
      this.auth.authenticator(this);
      window.authed = __bind(function(token) {
        return this.handler(new gram.Client(this.auth.token(token)));
      }, this);
      window.authFailed = function(err, reason, desc) {
        return alert(desc);
      };
    }
    UserAgent.prototype.authenticate = function() {
      var height, left, top, width;
      width = 700;
      height = 350;
      left = (screen.width - width) / 2;
      top = (screen.height - height) / 2;
      return window.open("" + gram.Auth.url + "?redirect_uri=" + this.auth.redirectUri + "&client_id=" + this.auth.clientId + "&response_type=token", "oauth", "height=" + height + ",width=" + width + ",top=" + top + ",left=" + left + ",resizable=no");
    };
    UserAgent.prototype.connect = function(btnContainer) {
      this.btnContainer = btnContainer;
      return __bind(function(handler) {
        var btn, frag, qparam, tok, _ref, _ref2;
        this.handler = handler;
        qparam = function(key, alt) {
          var re, _ref;
          if (alt == null) {
            alt = "";
          }
          key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
          re = new RegExp("[\\?&]" + key + "=([^&#]*)");
          return ((_ref = re.exec(window.location.href)) != null ? _ref[1] : void 0) || alt;
        };
        frag = (_ref = window.location.href.split("#")) != null ? _ref[1] : void 0;
        if (frag) {
          tok = (_ref2 = frag.split("=")) != null ? _ref2[1] : void 0;
          if (tok) {
            window.opener.authed(tok);
            self.close();
          }
        } else if (qparam("error")) {
          window.opener.authFailed(qparam("error"), qparam("error_reason"), qparam("error_description").replace(/\+/g, " "));
          self.close();
        }
        if (this.auth.accessToken()) {
          this.handler(new gram.Client(this.auth));
        }
        btn = $('<img id="ig-connect" src="Instagram_normal.png" />');
        btn.bind('click', __bind(function(event) {
          this.authenticate();
          return false;
        }, this));
        return $(this.btnContainer).append(btn);
      }, this);
    };
    return UserAgent;
  })();
  $(function($) {
    return new gram.UserAgent(new gram.Auth()).connect("#connect")(function(G) {
      return console.log(G);
    });
  });
}).call(this);
