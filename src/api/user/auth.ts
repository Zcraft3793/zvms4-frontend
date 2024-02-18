import axios from '@/plugins/axios'
import type { Response, LoginResult } from '@zvms/zvms4-types'
import { ElNotification } from 'element-plus'
import { encryption } from '@zvms/frontend-utils'
import { base64ToByteArray, byteArrayToHex } from './utils'
import { encryptData, importPublicKey } from './crypto'

export async function getRSAPublicCert(): Promise<string> {
  const result = (
    await axios('/cert', {
      method: 'GET',
      params: {
        type: 'public',
        method: 'RSA'
      }
    })
  ).data as Response<string>
  if (result.status === 'error') {
    ElNotification({
      title: '获取公钥错误（' + result.code + '）',
      message: result.message,
      type: 'error'
    })
    return ''
  }
  return result.data
}

async function UserLogin(user: string, password: string, term: 'long' | 'short' = 'long') {
  const payload = JSON.stringify({
    password: password,
    time: Date.now()
  })
  const publicKey = await importPublicKey(await getRSAPublicCert())
  const credential = await encryptData(publicKey, payload)
  // console.log(credential)
  const hex = byteArrayToHex(new Uint8Array(credential))
  console.log(`User ${user} login with ${term} term, with the credential ${hex}`)
  const result = (await axios('/user/auth', {
    method: 'POST',
    data: {
      id: user.toString(),
      credential: hex,
      mode: term
    }
  })) as Response<LoginResult>
  if (result.status === 'error') {
    ElNotification({
      title: '登录错误（' + result.code + '）',
      message: result.message,
      type: 'error'
    })
    return
  }
  return result.data
}

export { UserLogin as useLongTermAuth }
