import fetch from 'node-fetch'


export const esb_url = 'http://146.148.68.236'

export const token_url = 'http://35.202.112.35/oauth/token'

export const credentials = {
  "grant_type": "client_credentials",
  "client_id": "98498xc6516zxcv",
  "client_secret": "azxh_$84cv",
  "audience": "subasta"
}

export const fetchQuery = (url: string, method: string, body: any, head: any) => {
  const headers = { Accept: 'application/json', ...head }
  if (method === "PUT" || method === "POST") {
    headers['Content-Type'] = 'application/json'
  }
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: method,
      body: JSON.stringify(body),
      headers
    })
      .then((response: any) => {
        if (!response.ok) {
          reject(response)
        }
        resolve(response.json())
      })
      .catch(err => {
        reject(err)
      })
  })
}