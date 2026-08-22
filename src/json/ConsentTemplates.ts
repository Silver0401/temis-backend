import { createHash } from 'crypto'

export interface ConsentTemplate {
  templateId: string
  title: string
  docVersion: string
  body: string
}

export const calculateConsentDocHash = (body: string): string =>
  createHash('sha256').update(body, 'utf8').digest('hex')

export const CONSENT_TEMPLATES: readonly ConsentTemplate[] = [
  {
    templateId: 'privacy-notice-mx',
    title: 'Aviso de privacidad para consultorio médico',
    docVersion: '1.0.0',
    body: `AVISO DE PRIVACIDAD INTEGRAL

[NOMBRE DEL RESPONSABLE O CONSULTORIO], con domicilio en [DOMICILIO COMPLETO], es responsable del tratamiento y protección de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y demás disposiciones aplicables. Para cualquier asunto relacionado con privacidad puede comunicarse al correo [CORREO DE PRIVACIDAD] o al teléfono [TELÉFONO].

DATOS PERSONALES QUE SE RECABAN

Para identificarle, contactarle y prestarle servicios de atención médica podremos recabar datos de identificación y contacto; información demográfica; datos de familiares, tutores o contactos de emergencia; antecedentes personales y heredofamiliares; signos vitales; diagnósticos; tratamientos; prescripciones; resultados de laboratorio y gabinete; imágenes clínicas; notas médicas; información sobre discapacidad, embarazo, salud sexual y reproductiva, salud mental, consumo de sustancias y cualquier otro dato necesario para integrar y conservar su expediente clínico. También podremos tratar datos administrativos, fiscales, de aseguramiento y pago cuando resulten necesarios.

Los datos relativos a su estado de salud, características biométricas y demás información íntima son datos personales sensibles. Serán tratados bajo medidas administrativas, técnicas y físicas orientadas a preservar su confidencialidad, integridad, disponibilidad y acceso restringido.

FINALIDADES PRIMARIAS

Sus datos serán utilizados para: verificar su identidad; abrir, integrar, actualizar, conservar y consultar su expediente clínico; valorar su estado de salud; emitir diagnósticos y planes de manejo; prestar atención presencial o a distancia; solicitar y analizar estudios; emitir recetas, constancias, referencias e interconsultas; dar seguimiento clínico; contactar a la persona que usted designe ante una urgencia; coordinar la atención con otros profesionales o establecimientos cuando sea necesario; atender obligaciones sanitarias, de expediente clínico, facturación, auditoría, seguridad y conservación; y ejercer o defender derechos derivados de la relación médico-paciente.

Estas finalidades son necesarias para la prestación segura del servicio médico. Si usted no proporciona la información clínica indispensable, el responsable podrá encontrarse imposibilitado para valorar adecuadamente su caso o prestar determinados servicios.

FINALIDADES SECUNDARIAS

Con su autorización separada, sus datos de contacto podrán emplearse para recordatorios preventivos, encuestas de calidad, información sobre nuevos servicios o comunicaciones educativas. Usted puede oponerse a estas finalidades en cualquier momento mediante los datos de contacto señalados, sin que ello afecte la atención médica necesaria.

TRANSFERENCIAS Y ENCARGADOS

La información podrá comunicarse, en la medida necesaria y con deber de confidencialidad, a profesionales de la salud que participen en su atención; laboratorios, gabinetes, hospitales, farmacias, servicios de urgencias, aseguradoras o administradores de beneficios que usted indique; proveedores tecnológicos que actúen por cuenta del responsable; autoridades competentes cuando exista mandato fundado; y terceros cuando la transferencia esté prevista o permitida por la legislación aplicable. Cuando una transferencia requiera consentimiento, se solicitará antes de realizarla.

No se venderán sus datos personales ni se utilizarán para finalidades incompatibles con la relación clínica. Los proveedores que almacenen o procesen información deberán sujetarse a instrucciones, confidencialidad y medidas de seguridad acordes con el riesgo.

DERECHOS ARCO, REVOCACIÓN Y LIMITACIÓN

Usted o su representante legal puede solicitar acceso a sus datos; rectificación cuando sean inexactos o incompletos; cancelación cuando proceda; u oposición a un tratamiento específico. También puede revocar el consentimiento o limitar el uso y divulgación de sus datos. La solicitud deberá enviarse a [CORREO DE PRIVACIDAD] e incluir nombre del titular, medio para recibir respuesta, documentos que acrediten identidad o representación, descripción clara de la petición y, en su caso, documentos que faciliten la localización o corrección de la información.

La revocación y cancelación no tienen efectos retroactivos y pueden resultar improcedentes respecto de información que deba conservarse por obligaciones sanitarias, contractuales, de responsabilidad profesional o defensa jurídica. La respuesta se emitirá dentro de los plazos previstos por la legislación aplicable.

CONSERVACIÓN, SEGURIDAD E INCIDENTES

El expediente y los datos asociados se conservarán durante los plazos legales y por el tiempo razonablemente necesario para la continuidad asistencial y la atención de responsabilidades. El responsable aplicará controles de acceso, registros de actividad, respaldos y medidas de protección proporcionales al riesgo. Ningún sistema elimina por completo la posibilidad de un incidente; si ocurre uno que afecte significativamente sus derechos, se realizarán las notificaciones y acciones exigidas por la ley.

MEDIOS DIGITALES Y ATENCIÓN A DISTANCIA

Cuando se utilicen portales, correo, mensajería o videocomunicación, se procurarán canales autorizados y medidas razonables de seguridad. Usted debe proteger sus dispositivos, contraseñas y enlaces de acceso, evitar compartirlos y avisar de inmediato si sospecha un uso no autorizado.

CAMBIOS AL AVISO

Este aviso puede modificarse por cambios legales, operativos o de los servicios. La versión vigente estará disponible en [SITIO WEB O DOMICILIO DEL CONSULTORIO], indicando la fecha de actualización. Los cambios que requieran un nuevo consentimiento serán informados por un medio apropiado.

CONSENTIMIENTO

Declaro que tuve acceso a este aviso, pude formular preguntas y conozco las finalidades y medios para ejercer mis derechos. Cuando la legislación lo requiera, autorizo expresamente el tratamiento de mis datos personales sensibles para las finalidades médicas descritas.`
  },
  {
    templateId: 'generic-medical-consent',
    title: 'Consentimiento informado para procedimiento o tratamiento médico',
    docVersion: '1.0.0',
    body: `CARTA DE CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTO O TRATAMIENTO MÉDICO

Este documento deja constancia de la decisión libre e informada del paciente o de su representante. Debe integrarse al expediente clínico y complementarse con la descripción específica del diagnóstico, procedimiento, sitio anatómico, materiales, medicamentos, riesgos particulares, alternativas y pronóstico explicados por el profesional tratante. No sustituye los formatos especiales exigidos para actos que, por su naturaleza o por disposición normativa, requieran contenido adicional, testigos u otras formalidades.

INFORMACIÓN RECIBIDA

Declaro que el profesional de la salud me explicó en lenguaje claro mi estado de salud, el diagnóstico o impresión diagnóstica, la evolución esperada sin intervención y el propósito del procedimiento o tratamiento propuesto. También me informó en qué consiste, cómo se realizará, su duración aproximada, cuidados previos y posteriores, molestias previsibles y señales de alarma.

BENEFICIOS Y RESULTADOS ESPERADOS

Comprendo que el objetivo es prevenir, diagnosticar, aliviar, controlar o tratar mi padecimiento según corresponda. Se me explicaron los beneficios razonablemente esperados, así como que la medicina no ofrece resultados garantizados y que la respuesta puede variar por mis condiciones individuales, enfermedades concomitantes, adherencia, evolución biológica y circunstancias no previsibles.

RIESGOS Y COMPLICACIONES

Recibí información sobre los riesgos frecuentes y relevantes del acto propuesto, incluidos dolor, sangrado, infección, inflamación, reacción alérgica o adversa, lesión de tejidos u órganos, cicatrización anormal, fracaso terapéutico, necesidad de repetir o modificar el manejo, hospitalización, secuelas temporales o permanentes y, en situaciones excepcionales, riesgo vital. El profesional señaló los riesgos particulares relacionados con mis antecedentes, medicamentos, alergias y condición clínica, y tuve oportunidad de comunicarlos.

ALTERNATIVAS

Se me explicaron las alternativas razonables disponibles, sus ventajas, limitaciones y riesgos, incluida la posibilidad de no realizar el procedimiento o tratamiento. Entiendo las consecuencias previsibles de rechazarlo o posponerlo y que puedo solicitar una segunda opinión cuando las circunstancias clínicas lo permitan.

ANESTESIA, MEDICAMENTOS Y MATERIAL BIOLÓGICO

Cuando resulte aplicable, se me informará el tipo de anestesia o sedación, sus riesgos y la participación del personal correspondiente. Autorizo la administración de medicamentos, soluciones y materiales necesarios para el acto consentido dentro de la práctica clínica aceptada. Cualquier uso de muestras, imágenes o datos con fines de investigación, docencia identificable o publicación requerirá una autorización distinta cuando así proceda.

CONTINGENCIAS Y CAMBIOS NECESARIOS

Autorizo al equipo tratante a realizar medidas inmediatas razonablemente necesarias ante una urgencia o hallazgo imprevisto que ponga en riesgo mi vida, función o integridad y que no permita obtener oportunamente una nueva autorización. Los cambios no urgentes o que impliquen un acto sustancialmente distinto deberán explicarse y consentirse antes de llevarse a cabo.

DERECHO A PREGUNTAR, ACEPTAR O RECHAZAR

Pude hacer preguntas y recibí respuestas comprensibles. Entiendo que puedo retirar mi consentimiento antes del procedimiento o tratamiento, sin represalias y sin perder el derecho a recibir información y atención de urgencia. La revocación deberá comunicarse al profesional y quedará documentada; no afectará los actos ya realizados ni evitará las consecuencias clínicas de interrumpir un tratamiento.

DECLARACIÓN DEL PACIENTE O REPRESENTANTE

Declaro que proporcioné información veraz sobre mis antecedentes, alergias, embarazo posible o confirmado, medicamentos y sustancias que consumo. He leído o me fue leído este documento, comprendo su alcance y acepto voluntariamente el procedimiento o tratamiento específico explicado y asentado en mi expediente clínico. Si firmo como representante, manifiesto contar con facultades suficientes y actuar en beneficio del paciente.

DECLARACIÓN DEL PROFESIONAL DE LA SALUD

El profesional tratante deberá dejar asentados en el expediente el acto autorizado, los riesgos y beneficios individualizados, las alternativas, la fecha y hora, su nombre, cédula profesional y firma, así como los nombres y firmas de testigos cuando sean exigibles conforme a la NOM-004-SSA3-2012 y demás disposiciones aplicables.`
  },
  {
    templateId: 'telemedicine-consent',
    title: 'Consentimiento para telemedicina y uso de datos clínicos',
    docVersion: '1.0.0',
    body: `CONSENTIMIENTO INFORMADO PARA ATENCIÓN MÉDICA A DISTANCIA Y USO DE DATOS CLÍNICOS

NATURALEZA DEL SERVICIO

Acepto recibir atención médica a distancia mediante tecnologías de información y comunicación. La atención puede incluir entrevista clínica, orientación, seguimiento, revisión de documentos, imágenes o resultados, interconsulta y, cuando sea técnicamente posible, observación por audio o video. Comprendo que esta modalidad no equivale en todos los casos a una valoración presencial y que el profesional decidirá si la información disponible es suficiente para emitir recomendaciones seguras.

IDENTIDAD Y ENTORNO

Me comprometo a proporcionar datos correctos para verificar mi identidad y a informar quiénes se encuentran presentes durante la consulta. Procuraré conectarme desde un lugar privado, con iluminación, audio, video y conexión adecuados. Entiendo que el profesional puede solicitar la participación de otro personal de salud o de una persona de apoyo cuando resulte necesario, informándome de ello.

BENEFICIOS Y LIMITACIONES

Los beneficios posibles incluyen acceso oportuno, continuidad del seguimiento, disminución de traslados y comunicación entre profesionales. Las limitaciones incluyen fallas de conexión o equipo, calidad insuficiente de audio o imagen, imposibilidad de realizar una exploración física completa, pérdida de información no perceptible a distancia, retrasos y riesgos de interpretación. Por estas razones, el profesional puede suspender la sesión, solicitar estudios o indicar atención presencial.

URGENCIAS

La telemedicina no sustituye a los servicios de urgencias. Si presento dificultad respiratoria, dolor intenso o súbito, alteración de la conciencia, sangrado importante, signos neurológicos agudos, riesgo de autolesión u otra situación potencialmente grave, buscaré atención de emergencia inmediata y no esperaré respuesta por la plataforma. Informaré mi ubicación al inicio cuando el profesional lo considere necesario para un plan de contingencia.

DATOS CLÍNICOS Y EXPEDIENTE

Autorizo la obtención, consulta, registro, almacenamiento y transmisión de los datos necesarios para la atención, incluidos antecedentes, notas, mensajes, archivos, imágenes, resultados, audio o video en tiempo real y metadatos técnicos básicos. La información clínicamente relevante formará parte de mi expediente y se conservará conforme a las obligaciones sanitarias y al aviso de privacidad aplicable.

El acceso se limitará al personal y proveedores que requieran intervenir en la prestación, soporte o seguridad del servicio, sujetos a deberes de confidencialidad. Se aplicarán medidas razonables para proteger la confidencialidad, integridad y disponibilidad de la información; sin embargo, reconozco que toda comunicación digital conserva riesgos residuales, como acceso no autorizado, malware, pérdida de dispositivo o interrupción del servicio.

GRABACIÓN Y USOS ADICIONALES

La consulta no será grabada de manera intencional salvo que se me informe la finalidad y otorgue una autorización específica. No autorizo por este documento el uso identificable de mi imagen, voz o información para publicidad, redes sociales, docencia, investigación o publicación. Dichos usos requerirán una autorización separada cuando corresponda.

COMUNICACIONES Y RESPONSABILIDADES DEL PACIENTE

Utilizaré canales indicados por el prestador, mantendré en reserva contraseñas y enlaces, actualizaré mis datos de contacto y evitaré enviar información clínica desde cuentas o redes que considere inseguras. No compartiré recetas, accesos ni documentos destinados exclusivamente a mi atención. Avisaré si detecto un incidente o si recibo información que no me corresponde.

PRESCRIPCIONES, DIAGNÓSTICO Y SEGUIMIENTO

Comprendo que cualquier diagnóstico o prescripción dependerá del juicio profesional, de la información disponible y de las disposiciones aplicables. El médico puede negarse a prescribir, requerir una valoración presencial o referirme a otro establecimiento. Me comprometo a seguir las indicaciones, comunicar cambios relevantes y acudir a las revisiones o estudios recomendados.

VOLUNTARIEDAD Y REVOCACIÓN

Pude formular preguntas sobre la modalidad, alternativas, privacidad y costos. Acepto voluntariamente la atención a distancia y puedo retirar mi consentimiento para sesiones futuras, sin afectar los actos ya realizados ni mi derecho a solicitar atención presencial, sujeto a disponibilidad. La revocación no elimina información que deba conservarse en el expediente clínico.

DECLARACIÓN FINAL

Declaro que leí o me fue leído este documento, que comprendo beneficios, límites y riesgos, y que la información proporcionada será veraz y completa. Autorizo la atención médica a distancia y el tratamiento de mis datos clínicos exclusivamente para las finalidades asistenciales, administrativas, de seguridad y legales informadas.`
  }
] as const

export const getConsentTemplate = (templateId: string): ConsentTemplate | undefined =>
  CONSENT_TEMPLATES.find((template) => template.templateId === templateId)
