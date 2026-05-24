---
title:  OpenFeign常见问题
date: '2025-07-22 19:40:29'
tags: ['OpenFeign']
draft: false
authors: ['default']
---



## OpenFeign常见问题

### 1、接口返回结果为String，但是想直接装配成Object

#### 抛出异常

```
Could not extract response: no suitable HttpMessageConverter found for
response type [classxxxx] and content type [text/plain]
```

#### 解决方案

```java
public class MyJackson2HttpMessageConverter extends MappingJackson2HttpMessageConverter {

  public MyJackson2HttpMessageConverter() {
    List<MediaType> mediaTypes = new ArrayList<>();
    mediaTypes.add(MediaType.TEXT_PLAIN);
    mediaTypes.add(MediaType.TEXT_HTML);
    setSupportedMediaTypes(mediaTypes);
  }
}

@Configuration
public class OpenFeignLogConfig {

  @Bean
  public Logger.Level feignLoggerLeave() {
    return Logger.Level.FULL;
  }

  @Bean
  public Decoder feignDecoder() {
    MyJackson2HttpMessageConverter converter = new MyJackson2HttpMessageConverter();
    ObjectFactory<HttpMessageConverters> objectFactory = () -> new HttpMessageConverters(converter);
    return new SpringDecoder(objectFactory);
  }
}

// 处理完后调用feign client就不会再报错了，无论类型是application/json还是text/plain，都可以正确反序列化成Object。
```