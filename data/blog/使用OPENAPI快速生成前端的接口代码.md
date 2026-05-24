### 使用OPENAPI快速生成前端的接口代码

#### 后端配置

引入依赖

```xml
<!--加入springdoc依赖-->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.5.0</version>
        </dependency>
```

swaggerInfo

```java
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("IntelliTicket OpenID Provider API")
                        .contact(new Contact())
                        .description("工单管理平台提供的OpenID Provider API")
                        .version("1.0.0")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org"))
                ).externalDocs(new ExternalDocumentation()
                        .description("IntelliTicket Wiki Documentation")
                        .url("https://github.com/2468979982/intelliticket-openid-provider/wiki")
                );
    }
}
```

swagger 给所有请求添加身份验证

```java
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
            	.servers(new ArrayList<Server>(){
                    {
                         add(new Server().url("http://localhost:9000").description("本地测试环境"));
                         add(new Server().url("http://localhost:9528/api").description("前端测试环境"));
                     }
                })
                .info(new Info().title("IntelliTicket OpenID Provider API")
                        .contact(new Contact())
                        .description("工单管理平台提供的OpenID Provider API")
                        .version("1.0.0")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org"))
                ).externalDocs(new ExternalDocumentation()
                        .description("IntelliTicket Wiki Documentation")
                        .url("https://github.com/2468979982/intelliticket-openid-provider/wiki")
                ).components(new Components()
                        .addSecuritySchemes("Authorization", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .description("JWT Token")
                                .scheme("bearer")
                                .bearerFormat("JWT")
                        ))
                .security(new ArrayList<SecurityRequirement>() {{
                    add(new SecurityRequirement().addList("Authorization"));
                }});
    }
}
```





yml配置

```yml
springdoc:
  api-docs:
    enabled: true
    path: "/v3/api-docs"
  swagger-ui:
    enabled: true
    path: "/swagger-ui/index.html"
```

如果使用了security需要配置下面代码

```java
http
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/actuator/**").permitAll()
```



#### 前端配置

openapi 配置

```config.ts
openAPI: [
    {
      requestLibPath: "import { request } from '@umijs/max'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      // schemaPath: "http://localhost:9000/v3/api-docs"
      schemaPath: join(__dirname, 'oneapi.json'),
      projectName: 'openid-provider',  // 生成services.openid-provider
      apiPrefix: 'process.env.REACT_APP_API_PREFIX',
      mock: false,
    },
    {
      requestLibPath: "import { request } from '@umijs/max'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  
  define: {  // 定义全局变量
    'process.env': {
      REACT_APP_API_PREFIX: "/api",
    }
  }
```