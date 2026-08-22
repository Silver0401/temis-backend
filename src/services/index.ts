import { googleApi } from './google-api/google-api'
import { exchangeFile } from './exchange-file/exchange-file'
import { noAuthTemplate } from './no-auth-template/no-auth-template'
import { catalogoLocalidades } from './catalogs/catalogo-localidades/catalogo-localidades'
import { catalogoMunicipios } from './catalogs/catalogo-municipios/catalogo-municipios'
import { catalogoPersonalType } from './catalogs/catalogo-personal-type/catalogo-personal-type'
import { catalogoServByType } from './catalogs/catalogo-serv-by-type/catalogo-serv-by-type'
import { catalogoPaises } from './catalogs/catalogo-paises/catalogo-paises'
import { catalogoEstablecimientos } from './catalogs/catalogo-establecimientos/catalogo-establecimientos'
import { catalogoEntFed } from './catalogs/catalogo-ent-fed/catalogo-ent-fed'
import { catalogoDxcie10 } from './catalogs/catalogo-dxcie-10/catalogo-dxcie-10'
import { catalogoAfiliaciones } from './catalogs/catalogo-afiliaciones/catalogo-afiliaciones'
import { logs } from './logs/logs'
import { orders } from './orders/orders'
import { somas } from './somas/somas'
import { agenda } from './agenda/agenda'
import { records } from './records/records'
import { imgs } from './imgs/imgs'
import { drugs } from './drugs/drugs'
import { labs } from './labs/labs'
import { template } from './template/template'
import { groups } from './groups/groups'
import { uploads } from './uploads/uploads'
import { patients } from './patients/patients'
import { user } from './users/users'
import { medicalTeam } from './medical-team/medical-team'
import { adminConsole } from './admin-console/admin-console'
import { scopeByRoleAndTutor } from '../hooks/generic/scope-by-role-and-tutor'
import { verifyNufi } from './verify-nufi/verify-nufi'
import { recordShare } from './record-share/record-share'
import { recordRedeem } from './record-redeem/record-redeem'
import { consents } from './consents/consents'
import { consentSign } from './consent-sign/consent-sign'
import { externalPatientRegistration } from './external-patient-registration/external-patient-registration'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(googleApi)
  app.configure(verifyNufi)
  app.configure(recordShare)
  app.configure(recordRedeem)
  app.configure(consents)
  app.configure(consentSign)
  app.configure(externalPatientRegistration)
  app.configure(exchangeFile)
  app.configure(noAuthTemplate)
  app.configure(catalogoLocalidades)
  app.configure(catalogoMunicipios)
  app.configure(catalogoPersonalType)
  app.configure(catalogoServByType)
  app.configure(catalogoPaises)
  app.configure(catalogoEstablecimientos)
  app.configure(catalogoEntFed)
  app.configure(catalogoDxcie10)
  app.configure(catalogoAfiliaciones)
  app.configure(logs)
  app.configure(orders)
  app.configure(somas)
  app.configure(agenda)
  app.configure(records)
  app.configure(imgs)
  app.configure(drugs)
  app.configure(labs)
  app.configure(template)
  app.configure(groups)
  app.configure(uploads)
  app.configure(patients)
  app.configure(user)
  app.configure(medicalTeam)
  app.configure(adminConsole)
  // Guard transversal: los integrantes de equipo solo ven lo que su tutor les
  // asignó. Se engancha al final para cubrir todos los servicios registrados.
  Object.keys(app.services).forEach((path) => {
    ;(app.service(path as any) as any).hooks({ around: { all: [scopeByRoleAndTutor] } })
  })
  // All services will be registered here
}
