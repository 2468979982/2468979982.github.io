export async function getStaticProps() {
  return { props: { } }
}

async function login() {
  var myHeaders = new Headers()
  myHeaders.append('User-Agent', 'Apifox/1.0.0 (https://apifox.com)')
  myHeaders.append('Accept', '*/*')
  myHeaders.append('Host', 'localhost:8080')
  myHeaders.append('Connection', 'keep-alive')
  myHeaders.append(
    'Content-Type',
    'multipart/form-data; boundary=--------------------------850886903997443336833408'
  )


  var formdata = new FormData()
  formdata.append('username', 'admin')
  formdata.append('password', '111111')

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow',
  }

  fetch('/api/login', requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log('error', error))
}

async function userInfo() {
  var myHeaders = new Headers()
  myHeaders.append('User-Agent', 'Apifox/1.0.0 (https://apifox.com)')
  myHeaders.append(
    'Authorization',
    'Bearer eyJraWQiOiI0ZWE0ZGI5My1kNGZiLTQ2NzktYjYwMS1iOWRjZDI2NDQ4ZmMiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwODAiLCJzdWIiOiJhZG1pbiIsIm5iZiI6MTc1MDA1NjM5MSwiZXhwIjoxNzUwMDU4MTkxLCJpYXQiOjE3NTAwNTYzOTF9.lLL1d_gzFYxWV4TGpr8iON_XJXj-XGo2TYU6fDjI2g7SoV-eIEepWtkts1dFwSLzDAz4rLzR1e13QeDMRN18VI2-umR_M4Jb3IV_snUd5aHjF3u4LoufxT12jwuxXQ7NroHd4sJXnkDxhe5eKNwN_MUX40ONQ9Gzc3R-jv4FTVAgu8F1PODTOktcihaLKo8nDYd3FGDIU-UN50HtD6pEA3mtoQ8C18z-D6rJFtdkpFn9bmVFCCPTy8mK1BNd1KptZp2XmChxRKZFKLaESr0NPAXcafIcaLPu3cex9lhOkARMmLClXPRLiPRwWU9knsPA_8uUkMdytaX5rvqrBdMQFQ'
  )
  myHeaders.append('Accept', '*/*')
  myHeaders.append('Host', 'localhost:8080')
  myHeaders.append('Connection', 'keep-alive')

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  }

  fetch('/api/user/info', requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log('error', error))
}

export default function Page(res) {
  const data = res;
  console.log("data",data);
  
  return (
    <>
      <h1>用户登录</h1>
      <p>用户名：</p>
      <input name="username" />
      <p>密码：</p>
      <input name="password" />
      <button onClick={async () => {
        const data = await login()
        console.log(data)
      }}>登录</button>
      <form action={'/api/login'} method="post" onSubmit={(e) => {
        console.log('onSubmit')
        // 取消表单提交
        e.preventDefault()
        login()
      }}>
        <label>用户名：</label>
        <input name="username" />
        <label>密码：</label>
        <input name="password" />
        <button type="submit">登录</button>
        <button type='reset'>重置</button>
      </form>
    </>
  )
}
