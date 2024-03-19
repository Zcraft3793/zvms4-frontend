import axios from '@/plugins/axios'
import type { Response } from '@zvms/zvms4-types'
import { ElNotification } from 'element-plus'
import { temporaryToken } from '@/plugins/short-token'

async function deleteNotification(id: string, uid: string) {
  const tempToken = await temporaryToken(uid)

  await axios(`/notification/${id}`, {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${tempToken}`
    }
  })
}

export { deleteNotification as delete }
