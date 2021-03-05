/* eslint-disable */
import axios from 'axios'
const dataServerUrl = 'http://127.0.0.1:12050/'
const prefix = 'query/'

const $http = axios

/** Request data from host.
@param field the postfix
@returns resolved data
*/
function hostGet(field: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `${dataServerUrl}${prefix}` + field
    $http.get(url).then(
      (response: any) => {
        console.log('promise resolve: ' + field, response)
        resolve(response.data)
      },
      (errResponse: any) => {
        console.log('promise reject: ' + field)
        reject(errResponse)
      }
    )
  })
}

/** Request data from a given url.
@param url the link, note that to combine the params in the address
@returns resolved data
*/
function get(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    $http.get(url).then(
      (response: any) => {
        console.log('promise resolve: ', response)
        resolve(response.data)
      },
      (errResponse: any) => {
        console.log('promise reject: ')
        reject(errResponse)
      }
    )
  })
}

export default {
  hostGet,
  get
}
