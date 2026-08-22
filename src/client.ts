// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { googleApiClient } from './services/google-api/google-api.shared'
export type { GoogleApiData, GoogleApiResult } from './services/google-api/google-api.shared'

import { exchangeFileClient } from './services/exchange-file/exchange-file.shared'
export type {
  ExchangeFile,
  ExchangeFileData,
  ExchangeFileQuery,
  ExchangeFilePatch
} from './services/exchange-file/exchange-file.shared'

import { noAuthTemplateClient } from './services/no-auth-template/no-auth-template.shared'
export type {
  NoAuthTemplate,
  NoAuthTemplateData,
  NoAuthTemplateQuery,
  NoAuthTemplatePatch
} from './services/no-auth-template/no-auth-template.shared'

import { catalogoLocalidadesClient } from './services/catalogs/catalogo-localidades/catalogo-localidades.shared'
export type {
  CatalogoLocalidades,
  CatalogoLocalidadesData,
  CatalogoLocalidadesQuery,
  CatalogoLocalidadesPatch
} from './services/catalogs/catalogo-localidades/catalogo-localidades.shared'

import { catalogoMunicipiosClient } from './services/catalogs/catalogo-municipios/catalogo-municipios.shared'
export type {
  CatalogoMunicipios,
  CatalogoMunicipiosData,
  CatalogoMunicipiosQuery,
  CatalogoMunicipiosPatch
} from './services/catalogs/catalogo-municipios/catalogo-municipios.shared'

import { catalogoPersonalTypeClient } from './services//catalogs/catalogo-personal-type/catalogo-personal-type.shared'
export type {
  CatalogoPersonalType,
  CatalogoPersonalTypeData,
  CatalogoPersonalTypeQuery,
  CatalogoPersonalTypePatch
} from './services//catalogs/catalogo-personal-type/catalogo-personal-type.shared'

import { catalogoServByTypeClient } from './services/catalogs/catalogo-serv-by-type/catalogo-serv-by-type.shared'
export type {
  CatalogoServByType,
  CatalogoServByTypeData,
  CatalogoServByTypeQuery,
  CatalogoServByTypePatch
} from './services/catalogs/catalogo-serv-by-type/catalogo-serv-by-type.shared'

import { catalogoPaisesClient } from './services/catalogs/catalogo-paises/catalogo-paises.shared'
export type {
  CatalogoPaises,
  CatalogoPaisesData,
  CatalogoPaisesQuery,
  CatalogoPaisesPatch
} from './services/catalogs/catalogo-paises/catalogo-paises.shared'

import { catalogoEstablecimientosClient } from './services/catalogs/catalogo-establecimientos/catalogo-establecimientos.shared'
export type {
  CatalogoEstablecimientos,
  CatalogoEstablecimientosData,
  CatalogoEstablecimientosQuery,
  CatalogoEstablecimientosPatch
} from './services/catalogs/catalogo-establecimientos/catalogo-establecimientos.shared'

import { catalogoEntFedClient } from './services/catalogs/catalogo-ent-fed/catalogo-ent-fed.shared'
export type {
  CatalogoEntFed,
  CatalogoEntFedData,
  CatalogoEntFedQuery,
  CatalogoEntFedPatch
} from './services/catalogs/catalogo-ent-fed/catalogo-ent-fed.shared'

import { catalogoDxcie10Client } from './services/catalogs/catalogo-dxcie-10/catalogo-dxcie-10.shared'
export type {
  CatalogoDxcie10,
  CatalogoDxcie10Data,
  CatalogoDxcie10Query,
  CatalogoDxcie10Patch
} from './services/catalogs/catalogo-dxcie-10/catalogo-dxcie-10.shared'

import { catalogoAfiliacionesClient } from './services/catalogs/catalogo-afiliaciones/catalogo-afiliaciones.shared'
export type {
  CatalogoAfiliaciones,
  CatalogoAfiliacionesData,
  CatalogoAfiliacionesQuery,
  CatalogoAfiliacionesPatch
} from './services/catalogs/catalogo-afiliaciones/catalogo-afiliaciones.shared'

import { logsClient } from './services/logs/logs.shared'
export type { Logs, LogsData, LogsQuery } from './services/logs/logs.shared'

import { ordersClient } from './services/orders/orders.shared'
export type { Orders, OrdersData, OrdersQuery, OrdersPatch } from './services/orders/orders.shared'


import { somasClient } from './services/somas/somas.shared'
export type { Somas, SomasData, SomasQuery, SomasPatch } from './services/somas/somas.shared'

import { agendaClient } from './services/agenda/agenda.shared'
export type { Agenda, AgendaData, AgendaQuery, AgendaPatch } from './services/agenda/agenda.shared'

import { recordsClient } from './services/records/records.shared'
export type { Records, RecordsData, RecordsQuery, RecordsPatch } from './services/records/records.shared'

import { imgsClient } from './services/imgs/imgs.shared'
export type { Imgs, ImgsData, ImgsQuery, ImgsPatch } from './services/imgs/imgs.shared'

import { drugsClient } from './services/drugs/drugs.shared'
export type { Drugs, DrugsData, DrugsQuery, DrugsPatch } from './services/drugs/drugs.shared'

import { labsClient } from './services/labs/labs.shared'
export type { Labs, LabsData, LabsQuery, LabsPatch } from './services/labs/labs.shared'

import { templateClient } from './services/template/template.shared'
export type {
  Template,
  TemplateData,
  TemplateQuery,
  TemplatePatch
} from './services/template/template.shared'

import { groupsClient } from './services/groups/groups.shared'
export type { Groups, GroupsData, GroupsQuery, GroupsPatch } from './services/groups/groups.shared'

import { uploadsClient } from './services/uploads/uploads.shared'
export type { Uploads, UploadsData, UploadsQuery, UploadsPatch } from './services/uploads/uploads.shared'

import { patientsClient } from './services/patients/patients.shared'
export type {
  Patients,
  PatientsData,
  PatientsQuery,
  PatientsPatch
} from './services/patients/patients.shared'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the cronos-backend app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any,>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)
  client.configure(patientsClient)
  client.configure(uploadsClient)
  client.configure(groupsClient)
  client.configure(templateClient)
  client.configure(labsClient)
  client.configure(drugsClient)
  client.configure(imgsClient)
  client.configure(recordsClient)
  client.configure(agendaClient)
  client.configure(somasClient)
  client.configure(ordersClient)
  client.configure(logsClient)

  client.configure(catalogoAfiliacionesClient)
  client.configure(catalogoDxcie10Client)
  client.configure(catalogoEntFedClient)
  client.configure(catalogoEstablecimientosClient)
  client.configure(catalogoPaisesClient)
  client.configure(catalogoServByTypeClient)
  client.configure(catalogoPersonalTypeClient)
  client.configure(catalogoMunicipiosClient)
  client.configure(catalogoLocalidadesClient)
  client.configure(noAuthTemplateClient)
  client.configure(exchangeFileClient)
  client.configure(googleApiClient)
  return client
}
