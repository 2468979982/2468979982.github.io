---
title: OAuth2 Server 和Ant Design Pro
date: 2025-06-20 16:45:49
tags: ['OAuth2', 'SpringSecurity','AntDesignPro']
draft: false
authors: ['default']
---

## 认证服务器前后端分离

### 后端代码

[demo](https://github.com/2468979982/spring-security-oauth2-sample)

### 前端代码

[demo](https://github.com/2468979982/ant-design-pro-with-oauth2-server)





### 授权流程



前端：ant-design-pro

后端: openid-provider

客户端: relying-party



#### 客户端主要配置



客户端正常向第三方申请授权即可，和其他OAuth2 CLIENT没什么不同，需要主要正确填写端点信息 



yaml配置，客户端不直接与认证服务器后端交互，而是通过前端页面与认证服务器后端交互

```yml

server:

 port: 8070



spring:

 security:

  oauth2:

   client:

​    registration:

​     messaging-client-oidc:

​      provider: client-provider

​      client-id: relive-client

​      client-secret: relive-client

​      authorization-grant-type: authorization_code

​      redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"

​      scope:

​       \- openid

​       \- profile

​       \- email

​      client-name: messaging-client-oidc

​    provider:

​     client-provider:

​      authorization-uri: http://localhost:9528/oauth2/authorize  # 授权地址

​      token-uri: http://localhost:9528/dev-api/oauth2/token # token地址

​      user-info-uri: http://localhost:9528/dev-api/userinfo # 用户信息地址

​      jwk-set-uri: http://localhost:9528/dev-api/oauth2/jwks # jwks地址

​      user-info-authentication-method: header

​      user-name-attribute: sub

```



security配置

```java

@EnableWebSecurity(debug = true)

@Configuration(proxyBeanMethods = false)

public class SecurityConfig extends WebSecurityConfigurerAdapter {



  @Bean

  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

​    http.authorizeHttpRequests()

​        .anyRequest()

​        .authenticated()

​        .and()

//         .formLogin(from -> {

//           from.defaultSuccessUrl("/home");

//         }) // 单点登录不需要formLogin

​        .oauth2Login(Customizer.withDefaults())

​        .csrf().disable();

​    return http.build();

}

```



#### 测试接口

```java

@RestController

public class TestController {



  @@GetMapping("/home")

  public Map<String, String> home(Authentication authentication) {

​    return Collections.singletonMap("name", authentication.getName());

  }

}

```



#### 认证服务器后端主要配置



默认服务器的LogoutSuccessHandler、AuthenticationEntryPoint、AuthenticationSuccessHandler、AuthenticationFailureHandler、AuthenticationSuccessHandler会跳转页面，这里需要自定义返回JSON格式



yaml配置



```yml

server:

 port: 8080



```



server配置

```java

@Configuration(proxyBeanMethods = false)

public class ServerConfig {



 private static final String CUSTOM_CONSENT_PAGE_URI = "http://localhost:9528/dev-api/oauth2/consent";



 @Bean

 @Order(Ordered.HIGHEST_PRECEDENCE)

 public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http,

​                                  JwtDecoder jwtDecoder,

​                                  OidcUserInfoService userInfoService) throws Exception {

   OAuth2AuthorizationServerConfigurer authorizationServerConfigurer =

​       new OAuth2AuthorizationServerConfigurer();



   //Custom User Mapper

   Function<OidcUserInfoAuthenticationContext, OidcUserInfo> userInfoMapper = (context) -> {

​     OidcUserInfoAuthenticationToken authentication = context.getAuthentication();

​     JwtAuthenticationToken principal = (JwtAuthenticationToken) authentication.getPrincipal();

​     return userInfoService.loadUser(principal.getName(), context.getAccessToken().getScopes());

   };

   authorizationServerConfigurer.oidc((oidc) -> {

​     oidc.userInfoEndpoint((userInfo) -> userInfo.userInfoMapper(userInfoMapper));

   });



   //define authorization consent page

   authorizationServerConfigurer.authorizationEndpoint(authorizationEndpoint ->

​       authorizationEndpoint.consentPage(CUSTOM_CONSENT_PAGE_URI)

​           .authorizationResponseHandler(new OAuth2AuthorizationAuthenticationSuccessHandler())

​           .errorResponseHandler(new OAuth2AuthorizationAuthenticationFailureHandler()));



   RequestMatcher endpointsMatcher = authorizationServerConfigurer.getEndpointsMatcher();



   return http.securityMatcher(endpointsMatcher).authorizeHttpRequests((authorizeRequests) ->

​       authorizeRequests.anyRequest().authenticated()

   ).csrf((csrf) -> {

​     csrf.ignoringRequestMatchers(endpointsMatcher);

   }).apply(authorizationServerConfigurer)

​       .and()

​       .addFilterBefore(new BearerTokenAuthenticationFilter(

​           new ProviderManager(new JwtAuthenticationProvider(jwtDecoder))

​       ), AbstractPreAuthenticatedProcessingFilter.class)

​       .exceptionHandling(exceptions -> exceptions.

​           authenticationEntryPoint(new Http401UnauthorizedEntryPoint()))

​       .apply(authorizationServerConfigurer)

​       .and()

​       .build();

 }

}

```





接口，授权页面需要的信息

```java

@RestController

@RequestMapping("/dev-api")

public class UserController {



 @GetMapping(value = "/oauth2/consent")

  public Map<String, Object> consent(Principal principal,

​                    @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,

​                    @RequestParam(OAuth2ParameterNames.SCOPE) String scope,

​                    @RequestParam(OAuth2ParameterNames.STATE) String state) {



​    Set<String> scopesToApprove = new LinkedHashSet<>();

​    RegisteredClient registeredClient = this.registeredClientRepository.findByClientId(clientId);

​    Set<String> scopes = registeredClient.getScopes();

​    for (String requestedScope : StringUtils.delimitedListToStringArray(scope, " ")) {

​      if (scopes.contains(requestedScope)) {

​        scopesToApprove.add(requestedScope);

​      }

​    }

​    Map<String, Object> data = new HashMap<>();

​    data.put("clientId", clientId);

​    data.put("clientName", registeredClient.getClientName());

​    data.put("state", state);

​    data.put("scopes", withDescription(scopesToApprove));

​    data.put("principalName", principal.getName());

​    data.put("redirectUri", registeredClient.getRedirectUris().iterator().next());



​    Map<String, Object> result = new HashMap<>();

​    result.put("code", HttpServletResponse.SC_OK);

​    result.put("data", data);

​    return result;

  }



public static class ScopeWithDescription {

​    private static final String DEFAULT_DESCRIPTION = "We are unable to provide information about this permission";

​    private static final Map<String, String> scopeDescriptions = new HashMap<>();



​    static {

​      scopeDescriptions.put(

​          "profile",

​          "Use your profile picture and nickname"

​      );

​      scopeDescriptions.put(

​          "email",

​          "Get your email"

​      );

​    }



​    public final String scope;

​    public final String description;

​    public final boolean disabled;



​    ScopeWithDescription(String scope) {

​      this.scope = scope;

​      this.description = scopeDescriptions.getOrDefault(scope, DEFAULT_DESCRIPTION);

​      this.disabled = true;

​    }

  }





}

```





#### 前端主要代码

/oauth2/authorize/index.tsx  // 接收客户端请求，获取参数，获取系统参数

```tsx

// 从URL获取参数

const params = new URLSearchParams(window.location.search);

const response_type = params.get('response_type');

const client_id = params.get('client_id');

const scope = params.get('scope');

const redirect_uri = params.get('redirect_uri');

const state = params.get('state');

const nonce = params.get('nonce');





// 请求认证服务器后端，获取系统参数

const consentForm = () => {

  consent({

   response_type,

   client_id,

   scope,

   state,

   redirect_uri,

   nonce,

  })

   .then((res) => {

​    console.log(res);

​    if (res.code === 200) {

​     setData(res.data);

​    }

​    // 如果返回302，则跳转回客户端  这里设置成了无需同意，直接跳转回客户端

​    if (res.code === 302) {

​     window.location.href = res.data;

​    }

   })

   .catch((err) => {

​    console.log(err);

   });

 };

 useEffect(() => {

  const { token } = localStorage;

  // 登录了才发送验证申请

  if (token) {

   consentForm();

   // oauth2Consent();

  }

 }, []);





// 表单提交后跳转回客户端

const onFinish: FormProps<any>['onFinish'] = (values) => {

 console.log('Success:', values);

 const scopes = Object.keys(values).filter((key) => values[key] === true);

 console.log(scopes);



 authorize({

  // grant_type: 'authorization_code',

  code_challenge: PKCE.code_challenge,

  code_challenge_method: PKCE.code_challenge_method,

  response_type: response_type,

  client_id: client_id,

  scope: scopes,

  redirect_uri: redirect_uri,

  state: data.state,

  nonce: nonce,

 })

  .then((res) => {

   console.log('res', res);

   if (res.code === 200) {

​    console.log(res);

   }

   if (res.code === 302) {

​    console.log(res);

​    window.location.href = res.data;

   }

  })

  .catch((err) => {

   console.log(err);

  });

};

```





api.ts

```ts

export async function consent(body: any, options?: { [key: string]: any }) {

 console.log('body', body);

 const formData = new FormData();

 // formData.append('grant_type', body.grant_type);

 formData.append('response_type', body.response_type);

 formData.append('client_id', body.client_id);

 formData.append('redirect_uri', body.redirect_uri);

 formData.append('scope', body.scope);

 formData.append('state', body.state);

 formData.append('nonce', body.nonce);



 return request<{

  data: any;

 }>('/api/oauth2/authorize', {

  method: 'POST',

  headers: {

   Accept: '*/*',

   'Content-Type': 'multipart/form-data',

  },

  // params: {

  //  ...body,

  // },

  data: formData,

  withCredentials: true,

  ...(options || {}),

 });

}



/ 授权 */

export async function authorize(body: any, options?: { [key: string]: any }) {

 console.log('body', body);

 const formData = new FormData();

 formData.append('grant_type', body.grant_type);

 // formData.append('response_type', body.response_type);

 formData.append('client_id', body.client_id);

 formData.append('redirect_uri', body.redirect_uri);

 // formData.append('scope', body.scope);

 // formData.set('scope',body.scope);

 body.scope.forEach((item: any) => {

  formData.append('scope', item);

 });

 formData.append('state', body.state);

 formData.append('nonce', body.nonce);



 return request<{

  data: any;

 }>('/api/oauth2/authorize', {

  method: 'POST',

  headers: {

   Accept: '*/*',

   'Content-Type': 'multipart/form-data',

  },

  // params: {

  //  ...body,

  // },

  data: formData,

  withCredentials: true,

  ...(options || {}),

 });

}



```

#### 授权流程



客户端发送请求：http://127.0.0.1:8070/home

客户端未授权跳转到认证服务器前端页面：http://localhost:9528/oauth2/authorize?response_type=code&client_id=relive-client&scope=openid%20profile%20email&state=iod8348xU8Zs0GV_Y4M2SX-duwdhIdRiIeuNrymQXuY%3D&redirect_uri=http://127.0.0.1:8070/login/oauth2/code/messaging-client-oidc&nonce=A1kMHR57rcMS_0PmS1lKF1by80Kvkw6xMMj2CWUGCuc

前端：GET /api/oauth2/authorize 获取授权参数

用户：选择授权范围

前端：POST /api/oauth2/authorize  获取授权码

后端：返回302 重定向到客户端地址和code JSON信息

前端：302 重定向到客户端地址和code 信息

客户端：POST /api/login/oauth2/code/messaging-client-oidc  获取access_token