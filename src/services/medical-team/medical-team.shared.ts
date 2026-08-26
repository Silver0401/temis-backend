import type { ClientApplication } from '../../client'
import type { MedicalTeamService } from './medical-team.class'
import type {
  MedicalTeamData,
  MedicalTeamInvite,
  MedicalTeamMember,
  MedicalTeamPatch,
  MedicalTeamTutor
} from './medical-team.schema'

export type {
  MedicalTeamData,
  MedicalTeamInvite,
  MedicalTeamMember,
  MedicalTeamPatch,
  MedicalTeamTutor
}
export type MedicalTeamClientService = Pick<MedicalTeamService, 'get' | 'create' | 'patch' | 'remove'>

export const medicalTeamPath = 'medical-team'
export const medicalTeamMethods: Array<'get' | 'create' | 'patch' | 'remove'> = [
  'get',
  'create',
  'patch',
  'remove'
]

export const medicalTeamClient = (client: ClientApplication) => {
  const connection = client.get('connection')
  client.use(medicalTeamPath, connection.service(medicalTeamPath), { methods: medicalTeamMethods })
}

declare module '../../client' {
  interface ServiceTypes {
    [medicalTeamPath]: MedicalTeamClientService
  }
}
