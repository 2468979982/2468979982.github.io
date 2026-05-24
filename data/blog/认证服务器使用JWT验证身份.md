## 认证服务器使用JWT验证身份

使用JWT验证身份，可以释放服务器存储用户身份信息的内存，JWT可以将信息加密，每次请求携带token，同时携带身份信息。

关闭session

```java
http
                .sessionManagement(sessionManagement -> sessionManagement
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                ) //关闭session验证
```

验证token 二选一

如果只是验证token可以选第一种合适

方法2 更多用于手机登录、邮箱登录等登录方式

```java
http
                // 方法1（推荐）
                .oauth2ResourceServer((configurer)-> configurer.jwt(jwtConfigurer -> jwtConfigurer.jwtAuthenticationConverter(jwt -> {
                    Collection<String> authorities = jwt.getClaimAsStringList("authorities");
                    List<GrantedAuthority> authorityList = authorities.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());
                    return new JwtAuthenticationToken(jwt, authorityList);
                })))
//                // 方法2
//                .addFilterAt(new BearerTokenAuthenticationFilter(
//                        new ProviderManager(new CustomJwtAuthenticationProvider(jwtDecoder)) // 自定义JWT解析器,与oauth2ResourceServer.jwt().jwtAuthenticationConverter()二选一
//                ), BearerTokenAuthenticationFilter.class)
```

账号密码登录成功后返回token

```java
public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(30, ChronoUnit.MINUTES);
        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder();
        claimsBuilder.subject(authentication.getName())
                .issuer("http://127.0.0.1:9000")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .notBefore(issuedAt);

        JwsHeader.Builder headersBuilder = JwsHeader.with(SignatureAlgorithm.RS256);

        // 将权限信息保存到JWT中
        JwsHeader headers = headersBuilder.build();
        JwtClaimsSet claims = claimsBuilder
                .claim("authorities", authentication.getAuthorities().stream().map(authority -> authority.getAuthority()).collect(Collectors.toList()))
                .build();

        Jwt jwt = this.jwtEncoder.encode(JwtEncoderParameters.from(headers, claims));
        Map<String, Object> responseClaims = new LinkedHashMap<>();
        responseClaims.put("code", HttpServletResponse.SC_OK);
        responseClaims.put("status", "ok");
        responseClaims.put("data", Collections.singletonMap("token", jwt.getTokenValue()));

        ServletServerHttpResponse httpResponse = new ServletServerHttpResponse(response);
        httpResponse.setStatusCode(HttpStatus.OK);
        this.httpMessageConverter.write(responseClaims, null, httpResponse);
    }
```

