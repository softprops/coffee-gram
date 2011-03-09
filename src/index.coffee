# Coffee Gram
#
# A small library for accessing the instagr.am api
# from a browser
#

# tiny namespace
gram = {}

# user-granted access to api methods
class gram.Client

  constructor: (@auth) ->
    console.log("creating client")
    @

  get: (path, args = {}, handler = (meta, data) -> data) ->
    $.getJSON("https://api.instagram.com/v1/#{path}/?callback=?&access_token=#{@auth.accessToken}",
      args,
      (resp) ->
        switch resp.meta.code
          when 200 then handler(resp.meta, resp.data)
          when 400
            localStorage.token = null
            @auth.onFail()
    )

  popularMedia: (handler) ->
    get('media/popular', handler)

# handles authentication flow
#
# usage:
# new Auth({
#  redirectUri: '...',
#  clientId: '...',
#  token: '...'
# })
class gram.Auth

  @url: "https://api.instagram.com/oauth/authorize/"

  # options may contain redirectUri, clientId, and or token
  # values
  constructor: (options = {}) ->
    @redirectUri = options.redirectUri or "http://localhost:8080"
    @clientId = options.clientId or "ebdbf3f3444f484d885eb58ab53549b4"
    @token = options.token or localStorage.token

  # assigns current token
  token: (at) ->
    localStorage.token = at
    @token = at
    @

  # assigns authenticator
  authenticator: (@authenticator) ->
    @

  # access to the token
  accessToken: ->
    @token

  # handle auth failure
  onFail: ->
    localStorage.token = null
    @authenticator.authenticate

# usage:
#  new UserAgent(new Auth({...})).connect("#instagram")((g) ->
#   g.
# )
class gram.UserAgent

  constructor: (@auth) ->
    @auth.authenticator(this)
    window.authed = (token) =>
      @handler(new gram.Client(@auth.token(token)))
    window.authFailed = (err, reason, desc) ->
      alert desc

  # request authentication from user
  authenticate: ->
    width = 700
    height = 350
    left = (screen.width  - width)/2
    top = (screen.height - height)/2
    window.open("#{gram.Auth.url}?redirect_uri=#{@auth.redirectUri}&client_id=#{@auth.clientId}&response_type=token",
                "oauth",
                "height=#{height},width=#{width},top=#{top},left=#{left},resizable=no")

   # bind instagram connection behavior to the page
   # btnContainer represents the selector of the container
   # the connect button will be appended to
   connect: (@btnContainer) =>
     (@handler) =>
      # access a query parameter with an optional default value
      qparam = (key, alt = "") ->
        key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")
        re = new RegExp("[\\?&]#{key}=([^&#]*)")
        re.exec(window.location.href)?[1] or alt

       frag = window.location.href.split("#")?[1]
       if frag # assume this is the auth callback
         tok = frag.split("=")?[1]
         if tok
           window.opener.authed(tok)
           self.close()
       else if qparam("error") # where there errors
         window.opener.authFailed(qparam("error"), qparam("error_reason"), qparam("error_description").replace(/\+/g," "))
         self.close()

       # we are in the app context
       if @auth.accessToken()
         @handler(new gram.Client(@auth))

       btn = $('<img id="ig-connect" src="Instagram_normal.png" />')
       btn.bind 'click', (event) =>
         this.authenticate();
         false
       $(@btnContainer).append(btn)

 $ ($) ->
   #localStorage.clear()
   new gram.UserAgent(new gram.Auth()).connect("#connect")((G)->
     console.log(G);
   )