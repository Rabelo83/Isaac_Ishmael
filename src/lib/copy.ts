// Project-authored page copy for the public preview. It describes purpose and
// method only, drawn from docs/PROJECT_CHARTER.md, docs/RESEARCH_STANDARDS.md,
// and docs/WEBSITE_REQUIREMENTS.md. It contains no historical or legal findings.
import type { Locale } from './content/constants.ts';

export const REPOSITORY_URL = 'https://github.com/Rabelo83/Isaac_Ishmael';

/** "preview" while no reviewed research is published. */
export const SITE_STAGE: 'preview' | 'release' = 'preview';

interface Area {
  title: string;
  body: string;
}

interface Copy {
  previewNotice: string;
  homeLead: string;
  purposeHeading: string;
  purpose: string[];
  areasHeading: string;
  areasIntro: string;
  areas: Area[];
  forthcoming: string;
  methodHeading: string;
  methodSummary: string[];
  methodLink: string;
  notHeading: string;
  notList: string[];
  trackingNote: string;
  repoHeading: string;
  repoBody: string;
  repoLink: string;
  methodologyTitle: string;
  methodology: { heading: string; paragraphs?: string[]; list?: string[] }[];
  footer: string;
}

export const COPY: Record<Locale, Copy> = {
  en: {
    previewNotice:
      'Research content is forthcoming. No historical findings, legal conclusions, or source dossiers have been published yet.',
    homeLead:
      'A bilingual research project on the history of the land that includes present-day Israel, the West Bank, East Jerusalem, and Gaza, and on the rights, legal authorities, and settlement proposals connected with it.',
    purposeHeading: 'Purpose',
    purpose: [
      'The project aims to help readers examine the evidence for themselves and reach their own conclusions. It starts with the earliest available evidence, including the traditions about Abraham, Isaac, and Ishmael read in their textual and historical contexts, and continues to the present, with a stated research cutoff for each release.',
      'It is an educational resource, not a tribunal. It will not issue a verdict on who deserves the land, and it does not score or rank the rights of any people.',
    ],
    areasHeading: 'Planned sections',
    areasIntro: 'The published site will connect six areas, together with a source library. None of them contains reviewed material yet.',
    areas: [
      {
        title: 'History',
        body: 'Populations, institutions, political control, landholding, migration, and displacement from the earliest evidence to the present, with dates and uncertainties clearly identified.',
      },
      {
        title: 'Maps',
        body: 'Map layers by period and type, each with a date, legend, source, reuse rights, uncertainty, and a text alternative.',
      },
      {
        title: 'Peoples and ancestry',
        body: 'Genealogical traditions tied to named texts, kept separate from ancestry claims that can be independently corroborated.',
      },
      {
        title: 'Claims and evidence',
        body: 'Narrowly worded claims, each shown with its supporting, qualifying, and opposing evidence and its review status.',
      },
      {
        title: 'Legal authorities and comparisons',
        body: 'Directly relevant instruments and decisions, separating findings from submissions, followed by comparative cases chosen for stated reasons and shown with their limits.',
      },
      {
        title: 'Proposals and negotiations',
        body: 'Versioned proposals from the parties, mediators, and international bodies, with the named actors’ dated responses, compared topic by topic.',
      },
    ],
    forthcoming: 'Forthcoming',
    methodHeading: 'How the research works',
    methodSummary: [
      'Every published factual assertion will link to its source, with a precise locator such as a page, paragraph, or article where one exists.',
      'Religious and textual traditions, documented history, the positions of named parties, legal findings, and the project’s own synthesis will be labeled separately.',
      'English and Spanish versions must say the same thing with the same level of certainty. Translations made by the project are labeled as such.',
    ],
    methodLink: 'Read the full methodology',
    notHeading: 'What this site will not do',
    notList: [
      'Issue a verdict or rank the rights of any people.',
      'Treat any single actor as the voice of an entire population.',
      'Offer accounts or comments.',
    ],
    trackingNote: 'The project adds no analytics or tracking scripts.',
    repoHeading: 'Open project',
    repoBody: 'The planning documents, research standards, and source code are public.',
    repoLink: 'View the repository on GitHub',
    methodologyTitle: 'Methodology',
    methodology: [
      {
        heading: 'Questions before conclusions',
        paragraphs: [
          'Each record starts from a narrow question about a particular place, period, population, right, or proposal. The project keeps four things apart: what happened, what an actor claimed, what a legal body decided, and what remains unresolved.',
        ],
      },
      {
        heading: 'Evidence categories',
        paragraphs: ['Each record carries one descriptive label, never a numerical confidence score:'],
        list: [
          'Textual or religious tradition',
          'Contemporary record or material evidence',
          'Historical reconstruction',
          'Attributed party position',
          'Legal finding or legal instrument',
          'Project synthesis',
        ],
      },
      {
        heading: 'Sources',
        paragraphs: [
          'The project prefers original documents where relevant: legal texts, judgments, treaties, archival records, inscriptions, excavation reports, and critical editions. Peer-reviewed scholarship supplies context. Publications by governments, movements, and mediators are treated as evidence of those bodies’ own positions. Search snippets, AI output, and unsourced graphics are never treated as final authorities.',
          'For a disputed factual claim, the project seeks independent corroboration and looks for serious counterevidence. When independent corroboration is not available, the record says so and explains the limitation instead of implying certainty. Several publications repeating the same account do not count as independent sources.',
        ],
      },
      {
        heading: 'Citations',
        paragraphs: ['Each citation is attached to a specific assertion and records:'],
        list: [
          'the source’s title, author or issuing body, date, and original language;',
          'a direct link, DOI, or catalog record;',
          'a precise locator, or a stated reason why none exists;',
          'access status: open, paywalled, catalog record only, unavailable, or archived;',
          'whether the full text, an excerpt, or only the metadata was inspected;',
          'whether the source supports, qualifies, contradicts, or contextualizes the assertion, and what it can and cannot establish.',
        ],
      },
      {
        heading: 'Legal authorities',
        paragraphs: [
          'Legal records identify the forum, the procedural stage, the scope of any binding effect, and the exact reference. They distinguish party submissions from findings, and interim measures from decisions on the merits. Comparative cases are chosen by legal question and factual structure, not by which outcome they support. Each comparison states its limits and includes contrary authorities.',
        ],
      },
      {
        heading: 'Maps and population figures',
        paragraphs: [
          'Every map states its date, extent, source, legend, and reuse rights. Administrative boundaries, claimed borders, armistice lines, military control, and private ownership are kept distinct. Population figures state the year, the area covered, the categories used, the method, and the uncertainty.',
        ],
      },
      {
        heading: 'Review, translation, and corrections',
        paragraphs: [
          'A record moves through these stages: lead, source inspected, draft, reviewed, and published. A reviewed record may still be disputed, and the point of disagreement is recorded. Both languages are reviewed for equivalent meaning and certainty. Records keep stable addresses and a dated correction history. Each release states its research cutoff and its known gaps.',
        ],
      },
    ],
    footer: 'Working title. Preview build; content and design may change.',
  },
  es: {
    previewNotice:
      'El contenido de investigación se publicará próximamente. Todavía no se han publicado conclusiones históricas, conclusiones jurídicas ni expedientes de fuentes.',
    homeLead:
      'Un proyecto de investigación bilingüe sobre la historia del territorio que comprende el actual Israel, Cisjordania, Jerusalén Oriental y Gaza, y sobre los derechos, las fuentes jurídicas y las propuestas de solución relacionadas con él.',
    purposeHeading: 'Propósito',
    purpose: [
      'El proyecto busca que cada lector examine las pruebas por sí mismo y forme su propio juicio. Comienza con las pruebas más antiguas disponibles, incluidas las tradiciones sobre Abraham, Isaac e Ismael leídas en su contexto textual e histórico, y llega hasta el presente, con una fecha de corte declarada en cada publicación.',
      'Es un recurso educativo, no un tribunal. No dictará un veredicto sobre quién merece el territorio y no puntúa ni clasifica los derechos de ningún pueblo.',
    ],
    areasHeading: 'Secciones previstas',
    areasIntro: 'El sitio publicado conectará seis áreas, junto con una biblioteca de fuentes. Ninguna contiene todavía material revisado.',
    areas: [
      {
        title: 'Historia',
        body: 'Poblaciones, instituciones, control político, tenencia de la tierra, migración y desplazamiento, desde las pruebas más antiguas hasta el presente, con fechas e incertidumbres claramente indicadas.',
      },
      {
        title: 'Mapas',
        body: 'Capas de mapas por período y tipo, cada una con fecha, leyenda, fuente, derechos de reutilización, incertidumbre y una alternativa textual.',
      },
      {
        title: 'Pueblos y ascendencia',
        body: 'Tradiciones genealógicas vinculadas a textos concretos, separadas de las afirmaciones de ascendencia que pueden corroborarse de forma independiente.',
      },
      {
        title: 'Afirmaciones y pruebas',
        body: 'Afirmaciones formuladas de manera acotada, cada una con las pruebas que la respaldan, la matizan o la contradicen, y con su estado de revisión.',
      },
      {
        title: 'Fuentes jurídicas y comparaciones',
        body: 'Instrumentos y decisiones directamente pertinentes, separando las conclusiones de los alegatos de las partes, seguidos de casos comparados elegidos por razones explícitas y presentados con sus límites.',
      },
      {
        title: 'Propuestas y negociaciones',
        body: 'Propuestas de las partes, mediadores y organismos internacionales, identificadas por versión, con las respuestas fechadas de los actores nombrados, comparadas tema por tema.',
      },
    ],
    forthcoming: 'Próximamente',
    methodHeading: 'Cómo funciona la investigación',
    methodSummary: [
      'Cada afirmación fáctica publicada enlazará a su fuente, con un localizador preciso (página, párrafo o artículo) cuando exista.',
      'Las tradiciones religiosas y textuales, la historia documentada, las posiciones de las partes nombradas, las conclusiones jurídicas y la síntesis propia del proyecto llevarán etiquetas distintas.',
      'Las versiones en inglés y en español deben decir lo mismo y con el mismo grado de certeza. Las traducciones hechas por el proyecto se identifican como tales.',
    ],
    methodLink: 'Leer la metodología completa',
    notHeading: 'Lo que este sitio no hará',
    notList: [
      'Dictar un veredicto ni clasificar los derechos de ningún pueblo.',
      'Tratar a un solo actor como la voz de toda una población.',
      'Ofrecer cuentas de usuario ni comentarios.',
    ],
    trackingNote: 'El proyecto no incorpora herramientas de analítica ni scripts de seguimiento.',
    repoHeading: 'Proyecto abierto',
    repoBody: 'Los documentos de planificación, las normas de investigación y el código fuente son públicos.',
    repoLink: 'Ver el repositorio en GitHub',
    methodologyTitle: 'Metodología',
    methodology: [
      {
        heading: 'Preguntas antes que conclusiones',
        paragraphs: [
          'Cada registro parte de una pregunta acotada sobre un lugar, un período, una población, un derecho o una propuesta concretos. El proyecto distingue cuatro cosas: lo que ocurrió, lo que afirmó un actor, lo que decidió un órgano jurídico y lo que sigue sin resolverse.',
        ],
      },
      {
        heading: 'Categorías de prueba',
        paragraphs: ['Cada registro lleva una etiqueta descriptiva, nunca una puntuación numérica de confianza:'],
        list: [
          'Tradición textual o religiosa',
          'Registro contemporáneo o prueba material',
          'Reconstrucción histórica',
          'Posición atribuida a una parte',
          'Decisión o instrumento jurídico',
          'Síntesis del proyecto',
        ],
      },
      {
        heading: 'Fuentes',
        paragraphs: [
          'Cuando corresponde, el proyecto da preferencia a los documentos originales: textos jurídicos, sentencias, tratados, registros de archivo, inscripciones, informes de excavación y ediciones críticas. La investigación revisada por pares aporta el contexto. Las publicaciones de gobiernos, movimientos y mediadores se tratan como prueba de las posiciones de esos mismos organismos. Los fragmentos de buscadores, los textos generados por IA y los gráficos sin fuente nunca se tratan como autoridad definitiva.',
          'Para una afirmación de hecho controvertida, el proyecto busca corroboración independiente y pruebas en contrario de peso. Cuando no se dispone de corroboración independiente, el registro lo indica y explica esa limitación en lugar de aparentar certeza. Varias publicaciones que repiten el mismo relato no cuentan como fuentes independientes.',
        ],
      },
      {
        heading: 'Citas',
        paragraphs: ['Cada cita está vinculada a una afirmación concreta y registra:'],
        list: [
          'el título de la fuente, su autor u órgano emisor, la fecha y el idioma original;',
          'un enlace directo, un DOI o un registro de catálogo;',
          'un localizador preciso, o la razón por la que no existe;',
          'el estado de acceso: abierto, de pago, solo registro de catálogo, no disponible o archivado;',
          'si se inspeccionó el texto completo, un extracto o solo los metadatos;',
          'si la fuente respalda, matiza, contradice o contextualiza la afirmación, y qué puede y qué no puede establecer.',
        ],
      },
      {
        heading: 'Fuentes jurídicas',
        paragraphs: [
          'Los registros jurídicos identifican el foro, la fase procesal, el alcance de cualquier efecto vinculante y la referencia exacta. Distinguen los alegatos de las partes de las conclusiones, y las medidas provisionales de las decisiones sobre el fondo. Los casos comparados se eligen por la cuestión jurídica y la estructura de los hechos, no por el resultado que favorecen. Cada comparación declara sus límites e incluye las fuentes en sentido contrario.',
        ],
      },
      {
        heading: 'Mapas y cifras de población',
        paragraphs: [
          'Cada mapa indica su fecha, su extensión, su fuente, su leyenda y sus derechos de reutilización. Se distinguen los límites administrativos, las fronteras reclamadas, las líneas de armisticio, el control militar y la propiedad privada. Las cifras de población indican el año, el área que abarcan, las categorías usadas, el método y la incertidumbre.',
        ],
      },
      {
        heading: 'Revisión, traducción y correcciones',
        paragraphs: [
          'Un registro pasa por estas etapas: pista, fuente inspeccionada, borrador, revisado y publicado. Un registro revisado puede seguir en disputa, y se indica en qué punto está el desacuerdo. Ambos idiomas se revisan para que tengan el mismo significado y el mismo grado de certeza. Los registros conservan direcciones estables y un historial de correcciones fechado. Cada publicación indica su fecha de corte y sus lagunas conocidas.',
        ],
      },
    ],
    footer: 'Título provisional. Versión preliminar; el contenido y el diseño pueden cambiar.',
  },
};
