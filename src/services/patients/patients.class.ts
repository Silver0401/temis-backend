// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions, AdapterId } from '@feathersjs/mongodb'
import type { Application } from '../../declarations'
import type { Patients, PatientsData, PatientsPatch, PatientsQuery } from './patients.schema'
import { ObjectId } from 'mongodb'
import { normalizeClues } from '../../hooks/generic/scope-by-clues'

export type { Patients, PatientsData, PatientsPatch, PatientsQuery }

export interface PatientsParams extends MongoDBAdapterParams<PatientsDataProps> {}

interface PatientsDataProps {
  data: {
    sectionToUpdate?: 'ch' | 'labs' | 'id'
    fileType?: 'img' | 'text' | 'file'
    patientsList?: Array<Patients>
    text?: string
    labsDate?: string
  }
}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class PatientsService<ServiceParams extends Params = PatientsParams> extends MongoDBService<
  PatientsDataProps,
  PatientsData,
  ServiceParams,
  PatientsPatch
> {
  async get(id: string, params: ServiceParams): Promise<PatientsDataProps> {
    let RetrievedPatients: any = []

    function isObjectId(value: any) {
      // Check if it’s a valid ObjectId and not just a 24-char hex string
      return ObjectId.isValid(value) && String(new ObjectId(value)) === value
    }

    // Aislamiento por CLUES: en llamadas externas solo se ven pacientes que
    // comparten CLUES con el médico. Las internas (provider undefined) no se
    // acotan. `{ $in: [] }` cuando el médico no tiene CLUES no hace match (deny).
    const cluesFilter = params.provider ? { clues: { $in: normalizeClues(params.user?.clues) } } : {}

    //  If Generic Request just fetch the User's last 10 patients
    if (id === 'getRequest') {
      const SlicedElements = params.user?.patientsList.slice(-10)

      // @ts-ignore
      const result = await this.find({
        query: {
          _id: { $in: SlicedElements },
          ...cluesFilter
        },
        $sort: {
          _id: -1
        },
        pipeline: [
          {
            $lookup: {
              from: 'records',
              localField: '_id',
              foreignField: 'patientId',
              pipeline: [
                // { $match: { $expr: { $eq: ['$patientId', '$$patientId'] } } },
                { $sort: { _id: -1 } }, // or _id if you don't have createdAt
                { $limit: 1 }
              ],
              as: 'records'
            }
          }
        ]
      })

      RetrievedPatients = result.data
    } else if (id === 'groupRequest') {
      const GroupPatientIds = params.query?.group_patients?.slice(-10)

      const result =
        // @ts-ignore
        await this.find({
          query: {
            _id: { $in: GroupPatientIds },
            ...cluesFilter
          },
          $sort: {
            _id: -1
          },
          pipeline: [
            {
              $lookup: {
                from: 'records',
                localField: '_id',
                foreignField: 'patientId',
                as: 'records'
              }
            }
          ]
        })

      RetrievedPatients = result.data
    }

    // else if (id === 'giisRequest') {
    //   // @ts-ignore
    //   const startDate: string = params.query?.startDate
    //   // @ts-ignore
    //   const endDate: string = params.query?.endDate

    //   const startObjectId = new ObjectId(
    //     Math.floor(new Date(startDate).getTime() / 1000)
    //       .toString(16)
    //       .padStart(8, '0') + '0000000000000000'
    //   )
    //   const endObjectId = new ObjectId(
    //     Math.floor(new Date(endDate).getTime() / 1000)
    //       .toString(16)
    //       .padStart(8, '0') + 'ffffffffffffffff'
    //   )

    //   const result =
    //     // @ts-ignore
    //     await this.find({
    //       paginate: false,
    //       query: {
    //         _id: { $in: params.user?.patientsList }
    //       },
    //       pipeline: [
    //         {
    //           $lookup: {
    //             from: 'records',
    //             localField: '_id',
    //             foreignField: 'patientId',
    //             pipeline: [
    //               {
    //                 $match: {
    //                   _id: { $gte: startObjectId, $lte: endObjectId }
    //                 }
    //               },
    //               {
    //                 $lookup: {
    //                   from: 'somas',
    //                   localField: '_id',
    //                   foreignField: 'recordId',
    //                   as: 'somas'
    //                 }
    //               },
    //               {
    //                 $lookup: {
    //                   from: 'labs',
    //                   localField: '_id',
    //                   foreignField: 'recordId',
    //                   as: 'labs'
    //                 }
    //               },
    //               {
    //                 $lookup: {
    //                   from: 'imgs',
    //                   localField: '_id',
    //                   foreignField: 'recordId',
    //                   as: 'imgs'
    //                 }
    //               },
    //               {
    //                 $lookup: {
    //                   from: 'drugs',
    //                   localField: '_id',
    //                   foreignField: 'recordId',
    //                   as: 'drugs'
    //                 }
    //               },
    //               {
    //                 $lookup: {
    //                   from: 'maps',
    //                   localField: '_id',
    //                   foreignField: 'recordId',
    //                   as: 'maps'
    //                 }
    //               },
    //               {
    //                 $lookup: {
    //                   from: 'orders',
    //                   localField: '_id',
    //                   foreignField: 'recordId',
    //                   as: 'orders'
    //                 }
    //               }
    //             ],
    //             as: 'records'
    //           }
    //         },
    //         {
    //           $match: { 'records.0': { $exists: true } }
    //         }
    //       ]
    //     })

    //   // Build prestador from the authenticated user
    //   const prestador = {
    //     name: params.user?.name ?? 'XX',
    //     clues: params.user?.clues ?? '9998',
    //     professionType: params.user?.professionType ?? 'MÉDICA(O) GENERAL',
    //     personalInfo: {
    //       curp: params.user?.personalInfo?.curp,
    //       birthPlace: params.user?.personalInfo?.birthPlace
    //     }
    //   }

    //   // Generate one GIIS line per patient-record pair
    //   const giisLines: string[] = []
    //   for (const patient of result as any[]) {
    //     for (const record of patient.records ?? []) {
    //         record: { ...record, _id: String(record._id) },
    //         patient,
    //         prestador,
    //         somas: record.somas ?? []
    //       })
    //       giisLines.push(line)
    //     }
    //   }

    //   // console.log(giisLines)

    //   RetrievedPatients = result

    //   // return {
    //   //   data: {
    //   //     patientsList:

    //   // (result as any[]).length > 0 ? result : [],
    //   // // @ts-ignore
    //   // giisLines
    //   //   }
    //   // }
    // }
    else {
      // Si es un ID de mongo, buscar por Id
      if (isObjectId(id)) {
        const pipeline: any[] = [{ $sort: { _id: -1 } }]

        if (!params.query?.skipRecords) {
          pipeline.push({
            $lookup: {
              from: 'records',
              localField: '_id',
              foreignField: 'patientId',
              as: 'records'
            }
          })
        }

        const result =
          // @ts-ignore
          await this.find({ query: { _id: id, ...cluesFilter }, pipeline })

        RetrievedPatients = result.data
      } else {
        const result =
          // @ts-ignore
          await this.find({
            paginate: false,
            query: {
              // Solo busca por nombre dentro de pacientes con CLUES compartida.
              ...cluesFilter
            },
            pipeline: [
              {
                $match: {
                  $or: [
                    { 'personalInfo.names': { $regex: `${id.toLowerCase()}`, $options: 'im' } },
                    { 'personalInfo.middleName': { $regex: `${id.toLowerCase()}`, $options: 'im' } },
                    { 'personalInfo.lastName': { $regex: `${id.toLowerCase()}`, $options: 'im' } }
                  ]
                }
              },
              {
                $lookup: {
                  from: 'records',
                  localField: '_id',
                  foreignField: 'patientId',
                  as: 'records'
                }
              },
              { $limit: 25 }
            ]
          })

        RetrievedPatients = result
      }
    }

    return {
      data: {
        patientsList:
          RetrievedPatients && RetrievedPatients.length > 0
            ? RetrievedPatients
            : ([] as unknown as Patients[])
      }
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('patients'))
      .then((collection) => {
        // Aislamiento por CLUES: cada find inyecta `clues: { $in: [...] }`.
        // `clues` es un array → índice multikey, sirve para $in.
        collection.createIndex({ clues: 1 })
        return collection
      })
  }
}
