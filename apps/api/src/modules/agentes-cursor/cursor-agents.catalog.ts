// Auto-generated from agency-agents — do not edit by hand
export interface CursorAgentTask {
  modulo: string;
  estado: 'completado' | 'trabajando' | 'error' | 'pendiente';
  resultado?: string;
  duracion?: number;
  finalizado?: string;
}

export interface CursorAgentInfo {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  stack: string[];
  estado: 'activo' | 'inactivo';
  categoria: string;
  division: string;
  trabajandoEn?: string | null;
  tasks: CursorAgentTask[];
  sessionsActive?: number;
}

export const CURSOR_AGENTS: CursorAgentInfo[] = [
  {
    "id": "cursor-anthropologist",
    "slug": "anthropologist",
    "nombre": "Anthropologist",
    "descripcion": "Expert in cultural systems, rituals, kinship, belief systems, and ethnographic method — builds culturally coherent societies that feel lived-in rather than invented",
    "stack": [
      "Research"
    ],
    "estado": "activo",
    "categoria": "Académico",
    "division": "academic",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-geographer",
    "slug": "geographer",
    "nombre": "Geographer",
    "descripcion": "Expert in physical and human geography, climate systems, cartography, and spatial analysis — builds geographically coherent worlds where terrain, climate, resources, and settlement patterns make scientific sense",
    "stack": [
      "Research"
    ],
    "estado": "activo",
    "categoria": "Académico",
    "division": "academic",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-historian",
    "slug": "historian",
    "nombre": "Historian",
    "descripcion": "Expert in historical analysis, periodization, material culture, and historiography — validates historical coherence and enriches settings with authentic period detail grounded in primary and secondary sources",
    "stack": [
      "Research"
    ],
    "estado": "activo",
    "categoria": "Académico",
    "division": "academic",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-narratologist",
    "slug": "narratologist",
    "nombre": "Narratologist",
    "descripcion": "Expert in narrative theory, story structure, character arcs, and literary analysis — grounds advice in established frameworks from Propp to Campbell to modern narratology",
    "stack": [
      "Research"
    ],
    "estado": "activo",
    "categoria": "Académico",
    "division": "academic",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-psychologist",
    "slug": "psychologist",
    "nombre": "Psychologist",
    "descripcion": "Expert in human behavior, personality theory, motivation, and cognitive patterns — builds psychologically credible characters and interactions grounded in clinical and research frameworks",
    "stack": [
      "Research"
    ],
    "estado": "activo",
    "categoria": "Académico",
    "division": "academic",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-statistician",
    "slug": "statistician",
    "nombre": "Statistician",
    "descripcion": "Expert in quantitative research methodology, experimental design, and statistical inference — pressure-tests claims, designs sound studies, and separates real signal from noise, chance, and bias",
    "stack": [
      "Research"
    ],
    "estado": "activo",
    "categoria": "Académico",
    "division": "academic",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-brand-guardian",
    "slug": "brand-guardian",
    "nombre": "Brand Guardian",
    "descripcion": "Expert brand strategist and guardian specializing in brand identity development, consistency maintenance, and strategic brand positioning",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-image-prompt-engineer",
    "slug": "image-prompt-engineer",
    "nombre": "Image Prompt Engineer",
    "descripcion": "Expert photography prompt engineer specializing in crafting detailed, evocative prompts for AI image generation. Masters the art of translating visual concepts into precise language that produces stunning, professional-q",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-inclusive-visuals-specialist",
    "slug": "inclusive-visuals-specialist",
    "nombre": "Inclusive Visuals Specialist",
    "descripcion": "Representation expert who defeats systemic AI biases to generate culturally accurate, affirming, and non-stereotypical images and video.",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-persona-walkthrough-specialist",
    "slug": "persona-walkthrough-specialist",
    "nombre": "Persona Walkthrough Specialist",
    "descripcion": "Simulate cognitive walkthroughs of web pages from a defined persona's psychological perspective — captures emotional reactions and rational thought at each scroll position, then delivers structured CRO reports grounded i",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ui-designer",
    "slug": "ui-designer",
    "nombre": "UI Designer",
    "descripcion": "Expert UI designer specializing in visual design systems, component libraries, and pixel-perfect interface creation. Creates beautiful, consistent, accessible user interfaces that enhance UX and reflect brand identity",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-ui-finish-gate-reviewer",
    "slug": "ui-finish-gate-reviewer",
    "nombre": "UI Finish-Gate Reviewer",
    "descripcion": "Product-interface reviewer who catches generic, interchangeable UI before it ships by grounding critique in real product evidence, a written design contract, and a hard implementation finish gate.",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ux-architect",
    "slug": "ux-architect",
    "nombre": "UX Architect",
    "descripcion": "Technical architecture and UX specialist who provides developers with solid foundations, CSS systems, and clear implementation guidance",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-ux-researcher",
    "slug": "ux-researcher",
    "nombre": "UX Researcher",
    "descripcion": "Expert user experience researcher specializing in user behavior analysis, usability testing, and data-driven design insights. Provides actionable research findings that improve product usability and user satisfaction",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-visual-storyteller",
    "slug": "visual-storyteller",
    "nombre": "Visual Storyteller",
    "descripcion": "Expert visual communication specialist focused on creating compelling visual narratives, multimedia content, and brand storytelling through design. Specializes in transforming complex information into engaging visual sto",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-whimsy-injector",
    "slug": "whimsy-injector",
    "nombre": "Whimsy Injector",
    "descripcion": "Expert creative specialist focused on adding personality, delight, and playful elements to brand experiences. Creates memorable, joyful interactions that differentiate brands through unexpected moments of whimsy",
    "stack": [
      "UI",
      "UX",
      "Figma"
    ],
    "estado": "activo",
    "categoria": "Diseño",
    "division": "design",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ai-data-remediation-engineer",
    "slug": "ai-data-remediation-engineer",
    "nombre": "AI Data Remediation Engineer",
    "descripcion": "Specialist in self-healing data pipelines — uses air-gapped local SLMs and semantic clustering to automatically detect, classify, and fix data anomalies at scale. Focuses exclusively on the remediation layer: interceptin",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ai-engineer",
    "slug": "ai-engineer",
    "nombre": "AI Engineer",
    "descripcion": "Expert AI/ML engineer specializing in machine learning model development, deployment, and integration into production systems. Focused on building intelligent features, data pipelines, and AI-powered applications with em",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-api-platform-engineer",
    "slug": "api-platform-engineer",
    "nombre": "API Platform Engineer",
    "descripcion": "Expert API platform engineer for public and partner APIs — contract-first design (OpenAPI/gRPC), versioning and deprecation policy, SDK generation, API gateway concerns (auth, rate limiting, quotas), and developer-portal",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ats-validator-architect",
    "slug": "ats-validator-architect",
    "nombre": "ATS Validator Architect",
    "descripcion": "Architect and validator for Applicant Tracking Systems (ATS) and resume parsers. Combines deterministic information retrieval (BM25/TF-IDF and n-grams without AI), quantified Google/IBM X-Y-Z heuristics calibrated by sen",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-autonomous-optimization-architect",
    "slug": "autonomous-optimization-architect",
    "nombre": "Autonomous Optimization Architect",
    "descripcion": "Intelligent system governor that continuously shadow-tests APIs for performance while enforcing strict financial and security guardrails against runaway costs.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-backend-architect",
    "slug": "backend-architect",
    "nombre": "Backend Architect",
    "descripcion": "Senior backend architect specializing in scalable system design, database architecture, API development, and cloud infrastructure. Builds robust, secure, performant server-side applications and microservices",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-china-network-engineer",
    "slug": "china-network-engineer",
    "nombre": "China Network Engineer",
    "descripcion": "Expert in mainland China's mainstream enterprise networking stacks — Huawei VRP, H3C Comware, Ruijie RGOS, and Hillstone StoneOS — covering routing, switching, firewalling, NAT, and MLPS 2.0 (等保) compliant border design ",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-cms-developer",
    "slug": "cms-developer",
    "nombre": "CMS Developer",
    "descripcion": "Drupal and WordPress specialist for theme development, custom plugins/modules, content architecture, and code-first CMS implementation",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-code-reviewer",
    "slug": "code-reviewer",
    "nombre": "Code Reviewer",
    "descripcion": "Expert code reviewer who provides constructive, actionable feedback focused on correctness, maintainability, security, and performance — not style preferences.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-codebase-onboarding-engineer",
    "slug": "codebase-onboarding-engineer",
    "nombre": "Codebase Onboarding Engineer",
    "descripcion": "Expert developer onboarding specialist who helps new engineers understand unfamiliar codebases fast by reading source code, tracing code paths, and stating only facts grounded in the code.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-data-engineer",
    "slug": "data-engineer",
    "nombre": "Data Engineer",
    "descripcion": "Expert data engineer specializing in building reliable data pipelines, lakehouse architectures, and scalable data infrastructure. Masters ETL/ELT, Apache Spark, dbt, streaming systems, and cloud data platforms to turn ra",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-data-visualization-engineer",
    "slug": "data-visualization-engineer",
    "nombre": "Data Visualization Engineer",
    "descripcion": "Expert data visualization engineer — chart-type selection by data and question, perceptually honest encodings, colorblind-safe data palettes, accessible and interactive charts, and rendering large datasets performantly w",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-database-optimizer",
    "slug": "database-optimizer",
    "nombre": "Database Optimizer",
    "descripcion": "Expert database specialist focusing on schema design, query optimization, indexing strategies, and performance tuning for PostgreSQL, MySQL, and modern databases like Supabase and PlanetScale.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-database-reliability-engineer",
    "slug": "database-reliability-engineer",
    "nombre": "Database Reliability Engineer",
    "descripcion": "Expert database reliability engineer (DBRE) — high availability and replication, automated failover, backup and point-in-time recovery, zero-downtime online schema migrations, connection pooling, and disaster-recovery dr",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-desktop-app-engineer",
    "slug": "desktop-app-engineer",
    "nombre": "Desktop App Engineer",
    "descripcion": "Expert desktop application engineer for Electron and Tauri — secure IPC and process isolation, code signing and notarization, auto-update pipelines, native OS integration, and resource-footprint discipline.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-developer-tooling-engineer",
    "slug": "developer-tooling-engineer",
    "nombre": "Developer Tooling Engineer",
    "descripcion": "Expert developer-tooling and CLI engineer — building command-line tools and internal developer platforms with great DX: intuitive command design, helpful errors, shell completions, fast startup, cross-platform distributi",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-devops-automator",
    "slug": "devops-automator",
    "nombre": "DevOps Automator",
    "descripcion": "Expert DevOps engineer specializing in infrastructure automation, CI/CD pipeline development, and cloud operations",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-drupal-performance-engineer",
    "slug": "drupal-performance-engineer",
    "nombre": "Drupal Performance Engineer",
    "descripcion": "Expert Drupal 10/11 performance engineer specializing in Core Web Vitals, render and dynamic page caching, BigPipe, cache tags and contexts, database query and Views optimization, CSS/JS aggregation, responsive images an",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-drupal-shopping-cart-engineer",
    "slug": "drupal-shopping-cart-engineer",
    "nombre": "Drupal Shopping Cart Engineer",
    "descripcion": "Expert Drupal e-commerce engineer specializing in Drupal Commerce for product catalog management, payment gateway integration, checkout workflow design, order management, tax and promotion configuration, and high-reliabi",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-email-intelligence-engineer",
    "slug": "email-intelligence-engineer",
    "nombre": "Email Intelligence Engineer",
    "descripcion": "Expert in extracting structured, reasoning-ready data from raw email threads for AI agents and automation systems",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-embedded-firmware-engineer",
    "slug": "embedded-firmware-engineer",
    "nombre": "Embedded Firmware Engineer",
    "descripcion": "Specialist in bare-metal and RTOS firmware - ESP32/ESP-IDF, PlatformIO, Arduino, ARM Cortex-M, STM32 HAL/LL, Nordic nRF5/nRF Connect SDK, FreeRTOS, Zephyr",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-feishu-integration-developer",
    "slug": "feishu-integration-developer",
    "nombre": "Feishu Integration Developer",
    "descripcion": "Full-stack integration expert specializing in the Feishu (Lark) Open Platform — proficient in Feishu bots, mini programs, approval workflows, Bitable (multidimensional spreadsheets), interactive message cards, Webhooks, ",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-filament-optimization-specialist",
    "slug": "filament-optimization-specialist",
    "nombre": "Filament Optimization Specialist",
    "descripcion": "Expert in restructuring and optimizing Filament PHP admin interfaces for maximum usability and efficiency. Focuses on impactful structural changes — not just cosmetic tweaks.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-finops-engineer",
    "slug": "finops-engineer",
    "nombre": "FinOps Engineer",
    "descripcion": "Expert cloud cost engineer for AWS/GCP/Azure — cost allocation and tagging, rightsizing, commitment planning (reserved instances/savings plans), egress and storage optimization, and unit-economics dashboards that tie spe",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-frontend-developer",
    "slug": "frontend-developer",
    "nombre": "Frontend Developer",
    "descripcion": "Expert frontend developer specializing in modern web technologies, React/Vue/Angular frameworks, UI implementation, and performance optimization",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-gaussdb-expert-engineer",
    "slug": "gaussdb-expert-engineer",
    "nombre": "GaussDB Expert Engineer",
    "descripcion": "Expert database specialist focusing on GaussDB OLTP — Huawei's self-developed enterprise-grade relational database (NOT GaussDB(DWS) OLAP, NOT GaussDB(for openGauss) cloud service, NOT GaussDB(for MySQL)). Covers schema ",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-git-workflow-master",
    "slug": "git-workflow-master",
    "nombre": "Git Workflow Master",
    "descripcion": "Expert in Git workflows, branching strategies, and version control best practices including conventional commits, rebasing, worktrees, and CI-friendly branch management.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-internationalization-engineer",
    "slug": "internationalization-engineer",
    "nombre": "Internationalization Engineer",
    "descripcion": "Expert i18n engineer for ICU MessageFormat, CLDR plural rules, RTL and bidirectional layouts, locale-aware date/number/currency formatting, string extraction pipelines, and pseudo-localization testing.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-identity-access-engineer",
    "slug": "identity-access-engineer",
    "nombre": "Identity & Access Engineer",
    "descripcion": "Expert identity engineer for OAuth 2.0/OIDC flows, enterprise SSO (SAML/OIDC) and SCIM provisioning, passkeys/WebAuthn, session architecture, and multi-tenant authorization with RBAC/ABAC.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-incident-response-commander",
    "slug": "incident-response-commander",
    "nombre": "Incident Response Commander",
    "descripcion": "Expert incident commander specializing in production incident management, structured response coordination, post-mortem facilitation, SLO/SLI tracking, and on-call process design for reliable engineering organizations.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-iot-fleet-engineer",
    "slug": "iot-fleet-engineer",
    "nombre": "IoT Fleet Engineer",
    "descripcion": "Expert IoT and edge fleet engineer — device provisioning and identity, MQTT/telemetry pipelines, staged over-the-air (OTA) firmware updates with rollback, edge compute, and observability across fleets of unreliable, inte",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-it-service-manager",
    "slug": "it-service-manager",
    "nombre": "IT Service Manager",
    "descripcion": "Expert IT service management specialist using ITIL 4 framework for service catalog design, incident and problem management, change control, SLA governance, CMDB maintenance, and continual service improvement — ensuring I",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-knowledge-graph-engineer",
    "slug": "knowledge-graph-engineer",
    "nombre": "Knowledge Graph Engineer",
    "descripcion": "Structures information and capabilities into interconnected nodes (entities) and edges (relationships) — enabling dynamic context navigation, modular competency chaining, lower token costs, and hallucination reduction.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-llm-post-training-engineer",
    "slug": "llm-post-training-engineer",
    "nombre": "LLM Post-Training Engineer",
    "descripcion": "Evidence-driven owner for SFT, preference optimization, RLHF/RLVR, MoE post-training, and the release gates that turn a checkpoint into a defensible model change.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-minimal-change-engineer",
    "slug": "minimal-change-engineer",
    "nombre": "Minimal Change Engineer",
    "descripcion": "Engineering specialist focused on minimum-viable diffs — fixes only what was asked, refuses scope creep, prefers three similar lines over a premature abstraction. The discipline that prevents bug-fix PRs from becoming re",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-mobile-app-builder",
    "slug": "mobile-app-builder",
    "nombre": "Mobile App Builder",
    "descripcion": "Specialized mobile application developer with expertise in native iOS/Android development and cross-platform frameworks",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-mobile-release-engineer",
    "slug": "mobile-release-engineer",
    "nombre": "Mobile Release Engineer",
    "descripcion": "Expert mobile release and distribution engineer for iOS and Android — code signing, provisioning, fastlane pipelines, App Store Connect and Play Console submission, phased rollouts, and crash-triaged release health.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-multi-agent-systems-architect",
    "slug": "multi-agent-systems-architect",
    "nombre": "Multi-Agent Systems Architect",
    "descripcion": "Systems architect specializing in the design, coordination, and governance of multi-agent AI pipelines — covering topology selection, context management, inter-agent trust, failure recovery, human-in-the-loop gating, and",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-network-engineer",
    "slug": "network-engineer",
    "nombre": "Network Engineer",
    "descripcion": "Expert network engineer for Cisco IOS/IOS-XE, Cisco ASA/FTD, Juniper Junos, and Palo Alto PAN-OS routing, switching, firewalling, and troubleshooting.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-orgscript-engineer",
    "slug": "orgscript-engineer",
    "nombre": "OrgScript Engineer",
    "descripcion": "Expert in designing, parsing, and implementing OrgScript grammar, AST validation, and business logic definitions.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-payments-billing-engineer",
    "slug": "payments-billing-engineer",
    "nombre": "Payments & Billing Engineer",
    "descripcion": "Expert payments engineer for PSP integrations (Stripe, Adyen, Braintree, PayPal), idempotent payment flows, webhook processing, subscription billing, SCA/3DS, PCI scope reduction, and financial reconciliation.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-pdf-engine-architect",
    "slug": "pdf-engine-architect",
    "nombre": "PDF Engine Architect",
    "descripcion": "Architect and specialist in deterministic HTML-to-PDF document compilation, Playwright browser context pools, dynamic Euclidean page sizing, LayoutNG subpixel budgeting, tagged PDF (PDF/UA-1 & PDF/A-2b), and 1:1 sheet ca",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-platform-engineer",
    "slug": "platform-engineer",
    "nombre": "Platform Engineer",
    "descripcion": "Expert internal developer platform (IDP) engineer specializing in golden paths, paved roads, and self-serve infrastructure that multiplies engineering velocity.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-privacy-engineer",
    "slug": "privacy-engineer",
    "nombre": "Privacy Engineer",
    "descripcion": "Expert privacy engineer who implements privacy in code — PII discovery and classification, data minimization, consent enforcement at the API layer, automated DSAR and deletion across services, pseudonymization/tokenizati",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-prompt-engineer",
    "slug": "prompt-engineer",
    "nombre": "Prompt Engineer",
    "descripcion": "Specialist in crafting, testing, and systematically optimizing prompts for LLMs — turning vague instructions into reliable, production-grade AI behaviors.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-rag-pipeline-engineer",
    "slug": "rag-pipeline-engineer",
    "nombre": "RAG Pipeline Engineer",
    "descripcion": "Production RAG specialist focused on chunking strategy, retrieval quality, hybrid search, re-ranking, and eval-driven iteration. Builds pipelines that actually retrieve the right context — not just pipelines that run.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-rapid-prototyper",
    "slug": "rapid-prototyper",
    "nombre": "Rapid Prototyper",
    "descripcion": "Specialized in ultra-fast proof-of-concept development and MVP creation using efficient tools and frameworks",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-realtime-collaboration-engineer",
    "slug": "realtime-collaboration-engineer",
    "nombre": "Realtime Collaboration Engineer",
    "descripcion": "Expert realtime systems engineer for WebSocket/SSE infrastructure, presence, CRDT and OT-based collaborative editing, offline-first sync engines, and fan-out scaling with reconnect-safe protocols.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-rust-refactoring-specialist",
    "slug": "rust-refactoring-specialist",
    "nombre": "Rust Refactoring Specialist",
    "descripcion": "Expert Rust engineer for repository-scale refactoring, safe renames, module restructuring, duplication removal, panic hardening, ownership improvements, and compiler or Clippy remediation.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-search-relevance-engineer",
    "slug": "search-relevance-engineer",
    "nombre": "Search Relevance Engineer",
    "descripcion": "Expert search engineer for Elasticsearch and OpenSearch — index and analyzer design, BM25 query tuning, hybrid lexical+vector retrieval, and judgment-based relevance evaluation with nDCG and online experiments.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-section-508-accessibility-specialist",
    "slug": "section-508-accessibility-specialist",
    "nombre": "Section 508 Accessibility Specialist",
    "descripcion": "Expert U.S. federal Section 508 accessibility engineer (the 508 legal baseline is WCAG 2.0 Level AA; WCAG 2.1/2.2 AA are recommended best practice, and ADA Title II requires WCAG 2.1 AA for state/local government) specia",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-senior-developer",
    "slug": "senior-developer",
    "nombre": "Senior Developer",
    "descripcion": "Premium implementation specialist - Masters Laravel/Livewire/FluxUI, advanced CSS, Three.js integration",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-software-architect",
    "slug": "software-architect",
    "nombre": "Software Architect",
    "descripcion": "Expert software architect specializing in system design, domain-driven design, architectural patterns, and technical decision-making for scalable, maintainable systems.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-solidity-smart-contract-engineer",
    "slug": "solidity-smart-contract-engineer",
    "nombre": "Solidity Smart Contract Engineer",
    "descripcion": "Expert Solidity developer specializing in EVM smart contract architecture, gas optimization, upgradeable proxy patterns, DeFi protocol development, and security-first contract design across Ethereum and L2 chains.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-sre-site-reliability-engineer",
    "slug": "sre-site-reliability-engineer",
    "nombre": "SRE (Site Reliability Engineer)",
    "descripcion": "Expert site reliability engineer specializing in SLOs, error budgets, observability, chaos engineering, and toil reduction for production systems at scale.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-technical-writer",
    "slug": "technical-writer",
    "nombre": "Technical Writer",
    "descripcion": "Expert technical writer specializing in developer documentation, API references, README files, and tutorials. Transforms complex engineering concepts into clear, accurate, and engaging docs that developers actually read ",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-universal-document-compiler",
    "slug": "universal-document-compiler",
    "nombre": "Universal Document Compiler",
    "descripcion": "Architect of schema-agnostic document ASTs, algorithmic data-shape layout inference, bidirectional CST-to-canvas synchronization, and universal paged document publishing.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-uswds-developer",
    "slug": "uswds-developer",
    "nombre": "USWDS Developer",
    "descripcion": "Expert U.S. Web Design System frontend developer specializing in USWDS components and design tokens, accessible-by-default patterns, responsive government UI, Sass settings/theming, the federal design language, integrati",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-video-streaming-engineer",
    "slug": "video-streaming-engineer",
    "nombre": "Video Streaming Engineer",
    "descripcion": "Expert video streaming engineer for adaptive bitrate delivery — HLS/DASH packaging, ffmpeg transcode ladders, CMAF low-latency, DRM, CDN delivery, and QoE-driven player tuning.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-voice-ai-integration-engineer",
    "slug": "voice-ai-integration-engineer",
    "nombre": "Voice AI Integration Engineer",
    "descripcion": "Expert in building end-to-end speech transcription pipelines using Whisper-style models and cloud ASR services — from raw audio ingestion through preprocessing, transcript cleanup, subtitle generation, speaker diarizatio",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-webassembly-engineer",
    "slug": "webassembly-engineer",
    "nombre": "WebAssembly Engineer",
    "descripcion": "Expert WebAssembly engineer — compiling Rust/C++/Go to Wasm, JS interop and the boundary marshalling cost, WASI and server-side runtimes (Wasmtime/Wasmer), the component model, and near-native performance tuning.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-wechat-mini-program-developer",
    "slug": "wechat-mini-program-developer",
    "nombre": "WeChat Mini Program Developer",
    "descripcion": "Expert WeChat Mini Program developer specializing in 小程序 development with WXML/WXSS/WXS, WeChat API integration, payment systems, subscription messaging, and the full WeChat ecosystem.",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-wordpress-performance-engineer",
    "slug": "wordpress-performance-engineer",
    "nombre": "WordPress Performance Engineer",
    "descripcion": "Expert WordPress performance engineer specializing in Core Web Vitals, object caching (Redis/Memcached), page caching, database and WP_Query optimization, the Transients API, asset minification/deferral/critical CSS, ima",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-wordpress-shopping-cart-engineer",
    "slug": "wordpress-shopping-cart-engineer",
    "nombre": "WordPress Shopping Cart Engineer",
    "descripcion": "Expert WordPress e-commerce engineer specializing in WooCommerce for product catalog management, payment gateway integration, checkout customization, order management, tax and coupon configuration, and conversion-optimiz",
    "stack": [
      "TypeScript",
      "Engineering"
    ],
    "estado": "activo",
    "categoria": "Desarrollo",
    "division": "engineering",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-bookkeeper-controller",
    "slug": "bookkeeper-controller",
    "nombre": "Bookkeeper & Controller",
    "descripcion": "Expert bookkeeper and controller specializing in day-to-day accounting operations, financial reconciliations, month-end close processes, and internal controls. Ensures the accuracy, completeness, and timeliness of financ",
    "stack": [
      "Finance"
    ],
    "estado": "activo",
    "categoria": "Finanzas",
    "division": "finance",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-financial-analyst",
    "slug": "financial-analyst",
    "nombre": "Financial Analyst",
    "descripcion": "Expert financial analyst specializing in financial modeling, forecasting, scenario analysis, and data-driven decision support. Transforms raw financial data into actionable business intelligence that drives strategic pla",
    "stack": [
      "Finance"
    ],
    "estado": "activo",
    "categoria": "Finanzas",
    "division": "finance",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-fp-a-analyst",
    "slug": "fp-a-analyst",
    "nombre": "FP&A Analyst",
    "descripcion": "Expert Financial Planning & Analysis (FP&A) analyst specializing in budgeting, variance analysis, financial planning, rolling forecasts, and strategic decision support. Bridges the gap between the numbers and the busines",
    "stack": [
      "Finance"
    ],
    "estado": "activo",
    "categoria": "Finanzas",
    "division": "finance",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-investment-researcher",
    "slug": "investment-researcher",
    "nombre": "Investment Researcher",
    "descripcion": "Expert investment researcher specializing in market research, due diligence, portfolio analysis, and asset valuation. Conducts rigorous fundamental and quantitative analysis to identify investment opportunities, assess r",
    "stack": [
      "Finance"
    ],
    "estado": "activo",
    "categoria": "Finanzas",
    "division": "finance",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-tax-strategist",
    "slug": "tax-strategist",
    "nombre": "Tax Strategist",
    "descripcion": "Expert tax strategist specializing in tax optimization, multi-jurisdictional compliance, transfer pricing, and strategic tax planning. Navigates complex tax codes to minimize liability while ensuring full regulatory comp",
    "stack": [
      "Finance"
    ],
    "estado": "activo",
    "categoria": "Finanzas",
    "division": "finance",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-blender-add-on-engineer",
    "slug": "blender-add-on-engineer",
    "nombre": "Blender Add-on Engineer",
    "descripcion": "Blender tooling specialist - Builds Python add-ons, asset validators, exporters, and pipeline automations that turn repetitive DCC work into reliable one-click workflows",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-economy-designer",
    "slug": "economy-designer",
    "nombre": "Economy Designer",
    "descripcion": "Virtual economy architect - Masters currency systems, sources and sinks, monetization modeling, inflation control, and data-driven economic balancing for live games",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-game-audio-engineer",
    "slug": "game-audio-engineer",
    "nombre": "Game Audio Engineer",
    "descripcion": "Interactive audio specialist - Masters FMOD/Wwise integration, adaptive music systems, spatial audio, and audio performance budgeting across all game engines",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-game-designer",
    "slug": "game-designer",
    "nombre": "Game Designer",
    "descripcion": "Systems and mechanics architect - Masters GDD authorship, player psychology, economy balancing, and gameplay loop design across all engines and genres",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-godot-gameplay-scripter",
    "slug": "godot-gameplay-scripter",
    "nombre": "Godot Gameplay Scripter",
    "descripcion": "Composition and signal integrity specialist - Masters GDScript 2.0, C# integration, node-based architecture, and type-safe signal design for Godot 4 projects",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-godot-multiplayer-engineer",
    "slug": "godot-multiplayer-engineer",
    "nombre": "Godot Multiplayer Engineer",
    "descripcion": "Godot 4 networking specialist - Masters the MultiplayerAPI, scene replication, ENet/WebRTC transport, RPCs, and authority models for real-time multiplayer games",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-godot-shader-developer",
    "slug": "godot-shader-developer",
    "nombre": "Godot Shader Developer",
    "descripcion": "Godot 4 visual effects specialist - Masters the Godot Shading Language (GLSL-like), VisualShader editor, CanvasItem and Spatial shaders, post-processing, and performance optimization for 2D/3D effects",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-level-designer",
    "slug": "level-designer",
    "nombre": "Level Designer",
    "descripcion": "Spatial storytelling and flow specialist - Masters layout theory, pacing architecture, encounter design, and environmental narrative across all game engines",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-narrative-designer",
    "slug": "narrative-designer",
    "nombre": "Narrative Designer",
    "descripcion": "Story systems and dialogue architect - Masters GDD-aligned narrative design, branching dialogue, lore architecture, and environmental storytelling across all game engines",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-roblox-avatar-creator",
    "slug": "roblox-avatar-creator",
    "nombre": "Roblox Avatar Creator",
    "descripcion": "Roblox UGC and avatar pipeline specialist - Masters Roblox's avatar system, UGC item creation, accessory rigging, texture standards, and the Creator Marketplace submission pipeline",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-roblox-experience-designer",
    "slug": "roblox-experience-designer",
    "nombre": "Roblox Experience Designer",
    "descripcion": "Roblox platform UX and monetization specialist - Masters engagement loop design, DataStore-driven progression, Roblox monetization systems (Passes, Developer Products, UGC), and player retention for Roblox experiences",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-roblox-systems-scripter",
    "slug": "roblox-systems-scripter",
    "nombre": "Roblox Systems Scripter",
    "descripcion": "Roblox platform engineering specialist - Masters Luau, the client-server security model, RemoteEvents/RemoteFunctions, DataStore, and module architecture for scalable Roblox experiences",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-technical-artist",
    "slug": "technical-artist",
    "nombre": "Technical Artist",
    "descripcion": "Art-to-engine pipeline specialist - Masters shaders, VFX systems, LOD pipelines, performance budgeting, and cross-engine asset optimization",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-unity-architect",
    "slug": "unity-architect",
    "nombre": "Unity Architect",
    "descripcion": "Data-driven modularity specialist - Masters ScriptableObjects, decoupled systems, and single-responsibility component design for scalable Unity projects",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-unity-editor-tool-developer",
    "slug": "unity-editor-tool-developer",
    "nombre": "Unity Editor Tool Developer",
    "descripcion": "Unity editor automation specialist - Masters custom EditorWindows, PropertyDrawers, AssetPostprocessors, ScriptedImporters, and pipeline automation that saves teams hours per week",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-unity-multiplayer-engineer",
    "slug": "unity-multiplayer-engineer",
    "nombre": "Unity Multiplayer Engineer",
    "descripcion": "Networked gameplay specialist - Masters Netcode for GameObjects, Unity Gaming Services (Relay/Lobby), client-server authority, lag compensation, and state synchronization",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-unity-shader-graph-artist",
    "slug": "unity-shader-graph-artist",
    "nombre": "Unity Shader Graph Artist",
    "descripcion": "Visual effects and material specialist - Masters Unity Shader Graph, HLSL, URP/HDRP rendering pipelines, and custom pass authoring for real-time visual effects",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-unreal-multiplayer-architect",
    "slug": "unreal-multiplayer-architect",
    "nombre": "Unreal Multiplayer Architect",
    "descripcion": "Unreal Engine networking specialist - Masters Actor replication, GameMode/GameState architecture, server-authoritative gameplay, network prediction, and dedicated server setup for UE5",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-unreal-systems-engineer",
    "slug": "unreal-systems-engineer",
    "nombre": "Unreal Systems Engineer",
    "descripcion": "Performance and hybrid architecture specialist - Masters C++/Blueprint continuum, Nanite geometry, Lumen GI, and Gameplay Ability System for AAA-grade Unreal Engine projects",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-unreal-technical-artist",
    "slug": "unreal-technical-artist",
    "nombre": "Unreal Technical Artist",
    "descripcion": "Unreal Engine visual pipeline specialist - Masters the Material Editor, Niagara VFX, Procedural Content Generation, and the art-to-engine pipeline for UE5 projects",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-unreal-world-builder",
    "slug": "unreal-world-builder",
    "nombre": "Unreal World Builder",
    "descripcion": "Open-world and environment specialist - Masters UE5 World Partition, Landscape, procedural foliage, HLOD, and large-scale level streaming for seamless open-world experiences",
    "stack": [
      "Unity",
      "Godot"
    ],
    "estado": "activo",
    "categoria": "Game Dev",
    "division": "game-development",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-3d-scene-developer",
    "slug": "3d-scene-developer",
    "nombre": "3D & Scene Developer",
    "descripcion": "Web 3D visualization specialist who creates immersive 3D scenes, terrain models, point cloud visualizations, and interactive web experiences using Cesium, ArcGIS Scene Viewer, and modern 3D web frameworks.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-gis-analyst",
    "slug": "gis-analyst",
    "nombre": "GIS Analyst",
    "descripcion": "Day-to-day GIS operator who creates maps, manages layers, performs spatial queries, and maintains geospatial data integrity across desktop and web environments.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-bim-gis-specialist",
    "slug": "bim-gis-specialist",
    "nombre": "BIM/GIS Specialist",
    "descripcion": "Integration specialist who bridges Building Information Modeling and Geographic Information Systems — Revit/IFC data conversion, indoor mapping, digital twin architecture, and facility management data models.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-cartography-designer",
    "slug": "cartography-designer",
    "nombre": "Cartography Designer",
    "descripcion": "Map aesthetics specialist who designs beautiful, readable, and effective maps — color theory, typography, label placement, basemap selection, and visual hierarchy for both print and web.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-drone-reality-mapping-specialist",
    "slug": "drone-reality-mapping-specialist",
    "nombre": "Drone/Reality Mapping Specialist",
    "descripcion": "Photogrammetry and reality capture expert who processes drone imagery into orthomosaics, digital terrain models, point clouds, and 3D meshes — bridging field capture and GIS-ready products.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-geoai-ml-engineer",
    "slug": "geoai-ml-engineer",
    "nombre": "GeoAI/ML Engineer",
    "descripcion": "Geospatial machine learning specialist who builds models for feature extraction, object detection, image segmentation, and land cover classification from satellite and aerial imagery.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-geoprocessing-specialist",
    "slug": "geoprocessing-specialist",
    "nombre": "Geoprocessing Specialist",
    "descripcion": "ArcPy and Python toolbox expert who automates spatial workflows — builds .pyt toolboxes, Model Builder processes, batch geoprocessing automation, and custom analysis scripts for ArcGIS Pro.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-gis-qa-engineer",
    "slug": "gis-qa-engineer",
    "nombre": "GIS QA Engineer",
    "descripcion": "Quality assurance specialist who validates geospatial data integrity — topology checks, metadata audits, CRS consistency, accuracy assessment, and compliance verification.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-solution-engineer",
    "slug": "solution-engineer",
    "nombre": "Solution Engineer",
    "descripcion": "Hands-on GIS prototype builder who takes strategy from Technical Consultant and turns it into working demos, proof-of-concepts, and technical validations across the full Esri and open-source stack.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-spatial-data-engineer",
    "slug": "spatial-data-engineer",
    "nombre": "Spatial Data Engineer",
    "descripcion": "ETL specialist who transforms messy geospatial data from any source into clean, standardized, production-ready datasets — format conversion, CRS reprojection, attribute normalization, and automated pipelines.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-spatial-data-scientist",
    "slug": "spatial-data-scientist",
    "nombre": "Spatial Data Scientist",
    "descripcion": "Advanced spatial analytics specialist who applies statistical modeling, spatial econometrics, clustering, and predictive analytics to geospatial data — finding patterns that aren't visible on a map.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-technical-consultant",
    "slug": "technical-consultant",
    "nombre": "Technical Consultant",
    "descripcion": "Strategic GIS advisor who translates business problems into geospatial solutions — gap analysis, technology roadmaps, RFP responses, and digital transformation strategy across Esri and open-source ecosystems.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-web-gis-developer",
    "slug": "web-gis-developer",
    "nombre": "Web GIS Developer",
    "descripcion": "Full-stack web GIS engineer who builds interactive mapping applications — MapLibre GL JS, ArcGIS JS API, Leaflet, real-time dashboards, REST API integration, and geospatial web services.",
    "stack": [
      "Maps",
      "GIS"
    ],
    "estado": "activo",
    "categoria": "GIS",
    "division": "gis",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-clinical-evidence-agent",
    "slug": "clinical-evidence-agent",
    "nombre": "Clinical Evidence Agent",
    "descripcion": "Evidence standards and clinical credibility framework for AI agents",
    "stack": [
      "Healthcare"
    ],
    "estado": "activo",
    "categoria": "Salud",
    "division": "healthcare",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-healthcare-innovation-strategist",
    "slug": "healthcare-innovation-strategist",
    "nombre": "Healthcare Innovation Strategist",
    "descripcion": "Strategic narrative architect for healthcare founders operating at",
    "stack": [
      "Healthcare"
    ],
    "estado": "activo",
    "categoria": "Salud",
    "division": "healthcare",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-sovereign-health-systems-agent",
    "slug": "sovereign-health-systems-agent",
    "nombre": "Sovereign Health Systems Agent",
    "descripcion": "Government health mandate engagement framework for AI agents",
    "stack": [
      "Healthcare"
    ],
    "estado": "activo",
    "categoria": "Salud",
    "division": "healthcare",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-aeo-foundations-architect",
    "slug": "aeo-foundations-architect",
    "nombre": "AEO Foundations Architect",
    "descripcion": "Expert in AI Engine Optimization infrastructure — implements llms.txt, AI-aware robots.txt, token-budgeted content, structured Markdown availability, and agent discovery files so AI crawlers, citation engines, and browsi",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-agentic-search-optimizer",
    "slug": "agentic-search-optimizer",
    "nombre": "Agentic Search Optimizer",
    "descripcion": "Expert in WebMCP readiness and agentic task completion — audits whether AI agents can actually accomplish tasks on your site (book, buy, register, subscribe), implements WebMCP declarative and imperative patterns, and me",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ai-citation-strategist",
    "slug": "ai-citation-strategist",
    "nombre": "AI Citation Strategist",
    "descripcion": "Expert in AI recommendation engine optimization (AEO/GEO) — audits brand visibility across ChatGPT, Claude, Gemini, and Perplexity, identifies why competitors get cited instead, and delivers content fixes that improve AI",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-app-store-optimizer",
    "slug": "app-store-optimizer",
    "nombre": "App Store Optimizer",
    "descripcion": "Expert app store marketing specialist focused on App Store Optimization (ASO), conversion rate optimization, and app discoverability",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-baidu-seo-specialist",
    "slug": "baidu-seo-specialist",
    "nombre": "Baidu SEO Specialist",
    "descripcion": "Expert Baidu search optimization specialist focused on Chinese search engine ranking, Baidu ecosystem integration, ICP compliance, Chinese keyword research, and mobile-first indexing for the China market.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-bilibili-content-strategist",
    "slug": "bilibili-content-strategist",
    "nombre": "Bilibili Content Strategist",
    "descripcion": "Expert Bilibili marketing specialist focused on UP主 growth, danmaku culture mastery, B站 algorithm optimization, community building, and branded content strategy for China's leading video community platform.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-book-co-author",
    "slug": "book-co-author",
    "nombre": "Book Co-Author",
    "descripcion": "Strategic thought-leadership book collaborator for founders, experts, and operators turning voice notes, fragments, and positioning into structured first-person chapters.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-carousel-growth-engine",
    "slug": "carousel-growth-engine",
    "nombre": "Carousel Growth Engine",
    "descripcion": "Autonomous TikTok and Instagram carousel generation specialist. Analyzes any website URL with Playwright, generates viral 6-slide carousels via Gemini image generation, publishes directly to feed via Upload-Post API with",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-china-e-commerce-operator",
    "slug": "china-e-commerce-operator",
    "nombre": "China E-Commerce Operator",
    "descripcion": "Expert China e-commerce operations specialist covering Taobao, Tmall, Pinduoduo, and JD ecosystems with deep expertise in product listing optimization, live commerce, store operations, 618/Double 11 campaigns, and cross-",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-china-market-localization-strategist",
    "slug": "china-market-localization-strategist",
    "nombre": "China Market Localization Strategist",
    "descripcion": "Full-stack China market localization expert who transforms real-time trend signals into executable go-to-market strategies across Douyin, Xiaohongshu, WeChat, Bilibili, and beyond",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-content-creator",
    "slug": "content-creator",
    "nombre": "Content Creator",
    "descripcion": "Expert content strategist and creator for multi-platform campaigns. Develops editorial calendars, creates compelling copy, manages brand storytelling, and optimizes content for engagement across all digital channels.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-cross-border-e-commerce-specialist",
    "slug": "cross-border-e-commerce-specialist",
    "nombre": "Cross-Border E-Commerce Specialist",
    "descripcion": "Full-funnel cross-border e-commerce strategist covering Amazon, Shopee, Lazada, AliExpress, Temu, and TikTok Shop operations, international logistics and overseas warehousing, compliance and taxation, multilingual listin",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-douyin-strategist",
    "slug": "douyin-strategist",
    "nombre": "Douyin Strategist",
    "descripcion": "Short-video marketing expert specializing in the Douyin platform, with deep expertise in recommendation algorithm mechanics, viral video planning, livestream commerce workflows, and full-funnel brand growth through conte",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-email-marketing-strategist",
    "slug": "email-marketing-strategist",
    "nombre": "Email Marketing Strategist",
    "descripcion": "Expert email marketing strategist for CRM-driven campaigns, lifecycle automation, segmentation architecture, and deliverability. Designs sequences (welcome, nurture, reactivation, win-back, review, referral) grounded in ",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-global-podcast-strategist",
    "slug": "global-podcast-strategist",
    "nombre": "Global Podcast Strategist",
    "descripcion": "Expert podcast growth specialist focused on show positioning, audience development, content strategy, and monetisation. Transforms raw ideas into authoritative audio brands that compound listeners and revenue over time o",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-growth-hacker",
    "slug": "growth-hacker",
    "nombre": "Growth Hacker",
    "descripcion": "Expert growth strategist specializing in rapid user acquisition through data-driven experimentation. Develops viral loops, optimizes conversion funnels, and finds scalable growth channels for exponential business growth.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-instagram-curator",
    "slug": "instagram-curator",
    "nombre": "Instagram Curator",
    "descripcion": "Expert Instagram marketing specialist focused on visual storytelling, community building, and multi-format content optimization. Masters aesthetic development and drives meaningful engagement.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-kuaishou-strategist",
    "slug": "kuaishou-strategist",
    "nombre": "Kuaishou Strategist",
    "descripcion": "Expert Kuaishou marketing strategist specializing in short-video content for China's lower-tier city markets, live commerce operations, community trust building, and grassroots audience growth on 快手.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-linkedin-content-creator",
    "slug": "linkedin-content-creator",
    "nombre": "LinkedIn Content Creator",
    "descripcion": "Expert LinkedIn content strategist focused on thought leadership, personal brand building, and high-engagement professional content. Masters LinkedIn's algorithm and culture to drive inbound opportunities for founders, j",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-livestream-commerce-coach",
    "slug": "livestream-commerce-coach",
    "nombre": "Livestream Commerce Coach",
    "descripcion": "Veteran livestream e-commerce coach specializing in host training and live room operations across Douyin, Kuaishou, Taobao Live, and Channels, covering script design, product sequencing, paid-vs-organic traffic balancing",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-multi-platform-publisher",
    "slug": "multi-platform-publisher",
    "nombre": "Multi-Platform Publisher",
    "descripcion": "Expert orchestrator for one-click Chinese blog publishing. Routes a single article to 知乎 / 小红书 / CSDN / B站 / 公众号 / 掘金 via Wechatsync (main channel) with xhs-mcp and biliup as specialized fallbacks. Handles per-platform c",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-podcast-strategist",
    "slug": "podcast-strategist",
    "nombre": "Podcast Strategist",
    "descripcion": "Content strategy and operations expert for the Chinese podcast market, with deep expertise in Xiaoyuzhou, Ximalaya, and other major audio platforms, covering show positioning, audio production, audience growth, multi-pla",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-pr-communications-manager",
    "slug": "pr-communications-manager",
    "nombre": "PR & Communications Manager",
    "descripcion": "Strategic public relations and communications specialist for media relations, press releases, crisis communications, executive thought leadership, brand reputation management, and integrated communications planning — bui",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-private-domain-operator",
    "slug": "private-domain-operator",
    "nombre": "Private Domain Operator",
    "descripcion": "Expert in building enterprise WeChat (WeCom) private domain ecosystems, with deep expertise in SCRM systems, segmented community operations, Mini Program commerce integration, user lifecycle management, and full-funnel c",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-reddit-community-builder",
    "slug": "reddit-community-builder",
    "nombre": "Reddit Community Builder",
    "descripcion": "Expert Reddit marketing specialist focused on authentic community engagement, value-driven content creation, and long-term relationship building. Masters Reddit culture navigation.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-seo-specialist",
    "slug": "seo-specialist",
    "nombre": "SEO Specialist",
    "descripcion": "Expert search engine optimization strategist specializing in technical SEO, content optimization, link authority building, and organic search growth. Drives sustainable traffic through data-driven search strategies.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-short-video-editing-coach",
    "slug": "short-video-editing-coach",
    "nombre": "Short-Video Editing Coach",
    "descripcion": "Hands-on short-video editing coach covering the full post-production pipeline, with mastery of CapCut Pro, Premiere Pro, DaVinci Resolve, and Final Cut Pro across composition and camera language, color grading, audio eng",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-social-media-strategist",
    "slug": "social-media-strategist",
    "nombre": "Social Media Strategist",
    "descripcion": "Expert social media strategist for LinkedIn, Twitter, and professional platforms. Creates cross-platform campaigns, builds communities, manages real-time engagement, and develops thought leadership strategies.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-tiktok-strategist",
    "slug": "tiktok-strategist",
    "nombre": "TikTok Strategist",
    "descripcion": "Expert TikTok marketing specialist focused on viral content creation, algorithm optimization, and community building. Masters TikTok's unique culture and features for brand growth.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-twitter-engager",
    "slug": "twitter-engager",
    "nombre": "Twitter Engager",
    "descripcion": "Expert Twitter marketing specialist focused on real-time engagement, thought leadership building, and community-driven growth. Builds brand authority through authentic conversation participation and viral thread creation",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-video-optimization-specialist",
    "slug": "video-optimization-specialist",
    "nombre": "Video Optimization Specialist",
    "descripcion": "Video marketing strategist specializing in YouTube algorithm optimization, audience retention, chaptering, thumbnail concepts, and cross-platform video syndication.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-wechat-official-account-manager",
    "slug": "wechat-official-account-manager",
    "nombre": "WeChat Official Account Manager",
    "descripcion": "Expert WeChat Official Account (OA) strategist specializing in content marketing, subscriber engagement, and conversion optimization. Masters multi-format content and builds loyal communities through consistent value del",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-weibo-strategist",
    "slug": "weibo-strategist",
    "nombre": "Weibo Strategist",
    "descripcion": "Full-spectrum operations expert for Sina Weibo, with deep expertise in trending topic mechanics, Super Topic community management, public sentiment monitoring, fan economy strategies, and Weibo advertising, helping brand",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-x-twitter-intelligence-analyst",
    "slug": "x-twitter-intelligence-analyst",
    "nombre": "X/Twitter Intelligence Analyst",
    "descripcion": "Social intelligence specialist for X/Twitter research, trend detection, account monitoring, and evidence-backed audience insights using public signals and structured data workflows.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-xiaohongshu-specialist",
    "slug": "xiaohongshu-specialist",
    "nombre": "Xiaohongshu Specialist",
    "descripcion": "Expert Xiaohongshu marketing specialist focused on lifestyle content, trend-driven strategies, and authentic community engagement. Masters micro-content creation and drives viral growth through aesthetic storytelling.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-zhihu-strategist",
    "slug": "zhihu-strategist",
    "nombre": "Zhihu Strategist",
    "descripcion": "Expert Zhihu marketing specialist focused on thought leadership, community credibility, and knowledge-driven engagement. Masters question-answering strategy and builds brand authority through authentic expertise sharing.",
    "stack": [
      "Content",
      "Growth"
    ],
    "estado": "activo",
    "categoria": "Marketing",
    "division": "marketing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-paid-media-auditor",
    "slug": "paid-media-auditor",
    "nombre": "Paid Media Auditor",
    "descripcion": "Comprehensive paid media auditor who systematically evaluates Google Ads, Microsoft Ads, and Meta accounts across 200+ checkpoints spanning account structure, tracking, bidding, creative, audiences, and competitive posit",
    "stack": [
      "Ads"
    ],
    "estado": "activo",
    "categoria": "Paid Media",
    "division": "paid-media",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ad-creative-strategist",
    "slug": "ad-creative-strategist",
    "nombre": "Ad Creative Strategist",
    "descripcion": "Paid media creative specialist focused on ad copywriting, RSA optimization, asset group design, and creative testing frameworks across Google, Meta, Microsoft, and programmatic platforms. Bridges the gap between performa",
    "stack": [
      "Ads"
    ],
    "estado": "activo",
    "categoria": "Paid Media",
    "division": "paid-media",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-paid-social-strategist",
    "slug": "paid-social-strategist",
    "nombre": "Paid Social Strategist",
    "descripcion": "Cross-platform paid social advertising specialist covering Meta (Facebook/Instagram), LinkedIn, TikTok, Pinterest, X, and Snapchat. Designs full-funnel social ad programs from prospecting through retargeting with platfor",
    "stack": [
      "Ads"
    ],
    "estado": "activo",
    "categoria": "Paid Media",
    "division": "paid-media",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ppc-campaign-strategist",
    "slug": "ppc-campaign-strategist",
    "nombre": "PPC Campaign Strategist",
    "descripcion": "Senior paid media strategist specializing in large-scale search, shopping, and performance max campaign architecture across Google, Microsoft, and Amazon ad platforms. Designs account structures, budget allocation framew",
    "stack": [
      "Ads"
    ],
    "estado": "activo",
    "categoria": "Paid Media",
    "division": "paid-media",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-programmatic-display-buyer",
    "slug": "programmatic-display-buyer",
    "nombre": "Programmatic & Display Buyer",
    "descripcion": "Display advertising and programmatic media buying specialist covering managed placements, Google Display Network, DV360, trade desk platforms, partner media (newsletters, sponsored content), and ABM display strategies vi",
    "stack": [
      "Ads"
    ],
    "estado": "activo",
    "categoria": "Paid Media",
    "division": "paid-media",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-search-query-analyst",
    "slug": "search-query-analyst",
    "nombre": "Search Query Analyst",
    "descripcion": "Specialist in search term analysis, negative keyword architecture, and query-to-intent mapping. Turns raw search query data into actionable optimizations that eliminate waste and amplify high-intent traffic across paid s",
    "stack": [
      "Ads"
    ],
    "estado": "activo",
    "categoria": "Paid Media",
    "division": "paid-media",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-tracking-measurement-specialist",
    "slug": "tracking-measurement-specialist",
    "nombre": "Tracking & Measurement Specialist",
    "descripcion": "Expert in conversion tracking architecture, tag management, and attribution modeling across Google Tag Manager, GA4, Google Ads, Meta CAPI, LinkedIn Insight Tag, and server-side implementations. Ensures every conversion ",
    "stack": [
      "Ads"
    ],
    "estado": "activo",
    "categoria": "Paid Media",
    "division": "paid-media",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-behavioral-nudge-engine",
    "slug": "behavioral-nudge-engine",
    "nombre": "Behavioral Nudge Engine",
    "descripcion": "Behavioral psychology specialist that adapts software interaction cadences and styles to maximize user motivation and success.",
    "stack": [
      "Product"
    ],
    "estado": "activo",
    "categoria": "Producto",
    "division": "product",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-feedback-synthesizer",
    "slug": "feedback-synthesizer",
    "nombre": "Feedback Synthesizer",
    "descripcion": "Expert in collecting, analyzing, and synthesizing user feedback from multiple channels to extract actionable product insights. Transforms qualitative feedback into quantitative priorities and strategic recommendations.",
    "stack": [
      "Product"
    ],
    "estado": "activo",
    "categoria": "Producto",
    "division": "product",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-product-manager",
    "slug": "product-manager",
    "nombre": "Product Manager",
    "descripcion": "Holistic product leader who owns the full product lifecycle — from discovery and strategy through roadmap, stakeholder alignment, go-to-market, and outcome measurement. Bridges business goals, user needs, and technical r",
    "stack": [
      "Product"
    ],
    "estado": "activo",
    "categoria": "Producto",
    "division": "product",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-sprint-prioritizer",
    "slug": "sprint-prioritizer",
    "nombre": "Sprint Prioritizer",
    "descripcion": "Expert product manager specializing in agile sprint planning, feature prioritization, and resource allocation. Focused on maximizing team velocity and business value delivery through data-driven prioritization frameworks",
    "stack": [
      "Product"
    ],
    "estado": "activo",
    "categoria": "Producto",
    "division": "product",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-trend-researcher",
    "slug": "trend-researcher",
    "nombre": "Trend Researcher",
    "descripcion": "Expert market intelligence analyst specializing in identifying emerging trends, competitive analysis, and opportunity assessment. Focused on providing actionable insights that drive product strategy and innovation decisi",
    "stack": [
      "Product"
    ],
    "estado": "activo",
    "categoria": "Producto",
    "division": "product",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-experiment-tracker",
    "slug": "experiment-tracker",
    "nombre": "Experiment Tracker",
    "descripcion": "Expert project manager specializing in experiment design, execution tracking, and data-driven decision making. Focused on managing A/B tests, feature experiments, and hypothesis validation through systematic experimentat",
    "stack": [
      "Agile",
      "PM"
    ],
    "estado": "activo",
    "categoria": "PMO",
    "division": "project-management",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-jira-workflow-steward",
    "slug": "jira-workflow-steward",
    "nombre": "Jira Workflow Steward",
    "descripcion": "Expert delivery operations specialist who enforces Jira-linked Git workflows, traceable commits, structured pull requests, and release-safe branch strategy across software teams.",
    "stack": [
      "Agile",
      "PM"
    ],
    "estado": "activo",
    "categoria": "PMO",
    "division": "project-management",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-meeting-notes-specialist",
    "slug": "meeting-notes-specialist",
    "nombre": "Meeting Notes Specialist",
    "descripcion": "Extract structured decisions, action items, and open questions from meeting transcripts or rough notes into a clean 4-section summary.",
    "stack": [
      "Agile",
      "PM"
    ],
    "estado": "activo",
    "categoria": "PMO",
    "division": "project-management",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-project-shepherd",
    "slug": "project-shepherd",
    "nombre": "Project Shepherd",
    "descripcion": "Expert project manager specializing in cross-functional project coordination, timeline management, and stakeholder alignment. Focused on shepherding projects from conception to completion while managing resources, risks,",
    "stack": [
      "Agile",
      "PM"
    ],
    "estado": "activo",
    "categoria": "PMO",
    "division": "project-management",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-studio-operations",
    "slug": "studio-operations",
    "nombre": "Studio Operations",
    "descripcion": "Expert operations manager specializing in day-to-day studio efficiency, process optimization, and resource coordination. Focused on ensuring smooth operations, maintaining productivity standards, and supporting all teams",
    "stack": [
      "Agile",
      "PM"
    ],
    "estado": "activo",
    "categoria": "PMO",
    "division": "project-management",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-studio-producer",
    "slug": "studio-producer",
    "nombre": "Studio Producer",
    "descripcion": "Senior strategic leader specializing in high-level creative and technical project orchestration, resource allocation, and multi-project portfolio management. Focused on aligning creative vision with business objectives w",
    "stack": [
      "Agile",
      "PM"
    ],
    "estado": "activo",
    "categoria": "PMO",
    "division": "project-management",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-senior-project-manager",
    "slug": "senior-project-manager",
    "nombre": "Senior Project Manager",
    "descripcion": "Converts specs to tasks and remembers previous projects. Focused on realistic scope, no background processes, exact spec requirements",
    "stack": [
      "Agile",
      "PM"
    ],
    "estado": "activo",
    "categoria": "PMO",
    "division": "project-management",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-research-synthesist",
    "slug": "research-synthesist",
    "nombre": "Research Synthesist",
    "descripcion": "Expert in literature review, source evaluation, and evidence synthesis — turns a scattered pile of sources into a structured, honestly-weighted map of what the evidence actually supports",
    "stack": [
      "Research"
    ],
    "estado": "activo",
    "categoria": "Research",
    "division": "research",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-account-strategist",
    "slug": "account-strategist",
    "nombre": "Account Strategist",
    "descripcion": "Expert post-sale account strategist specializing in land-and-expand execution, stakeholder mapping, QBR facilitation, and net revenue retention. Turns closed deals into long-term platform relationships through systematic",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-sales-coach",
    "slug": "sales-coach",
    "nombre": "Sales Coach",
    "descripcion": "Expert sales coaching specialist focused on rep development, pipeline review facilitation, call coaching, deal strategy, and forecast accuracy. Makes every rep and every deal better through structured coaching methodolog",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-deal-strategist",
    "slug": "deal-strategist",
    "nombre": "Deal Strategist",
    "descripcion": "Senior deal strategist specializing in MEDDPICC qualification, competitive positioning, and win planning for complex B2B sales cycles. Scores opportunities, exposes pipeline risk, and builds deal strategies that survive ",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-discovery-coach",
    "slug": "discovery-coach",
    "nombre": "Discovery Coach",
    "descripcion": "Coaches sales teams on elite discovery methodology — question design, current-state mapping, gap quantification, and call structure that surfaces real buying motivation.",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-sales-engineer",
    "slug": "sales-engineer",
    "nombre": "Sales Engineer",
    "descripcion": "Senior pre-sales engineer specializing in technical discovery, demo engineering, POC scoping, competitive battlecards, and bridging product capabilities to business outcomes. Wins the technical decision so the deal can c",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-offer-lead-gen-strategist",
    "slug": "offer-lead-gen-strategist",
    "nombre": "Offer & Lead Gen Strategist",
    "descripcion": "Top-of-funnel architect who designs irresistible offers and lead magnets that attract qualified buyers at scale. Specializes in value-equation offer construction, lead magnet typology, multi-channel lead generation, and ",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-outbound-strategist",
    "slug": "outbound-strategist",
    "nombre": "Outbound Strategist",
    "descripcion": "Signal-based outbound specialist who designs multi-channel prospecting sequences, defines ICPs, and builds pipeline through research-driven personalization — not volume.",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-pipeline-analyst",
    "slug": "pipeline-analyst",
    "nombre": "Pipeline Analyst",
    "descripcion": "Revenue operations analyst specializing in pipeline health diagnostics, deal velocity analysis, forecast accuracy, and data-driven sales coaching. Turns CRM data into actionable pipeline intelligence that surfaces risks ",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-proposal-strategist",
    "slug": "proposal-strategist",
    "nombre": "Proposal Strategist",
    "descripcion": "Strategic proposal architect who transforms RFPs and sales opportunities into compelling win narratives. Specializes in win theme development, competitive positioning, executive summary craft, and building proposals that",
    "stack": [
      "Sales"
    ],
    "estado": "activo",
    "categoria": "Ventas",
    "division": "sales",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-ai-generated-code-security-auditor",
    "slug": "ai-generated-code-security-auditor",
    "nombre": "AI-Generated Code Security Auditor",
    "descripcion": "Security reviewer for AI-generated and vibe-coded apps — hunts the hardcoded secrets, broken row-level security, and prompt-injection sinks that coding assistants ship by default, then drives a scan, fix, and rescan loop",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-application-security-engineer",
    "slug": "application-security-engineer",
    "nombre": "Application Security Engineer",
    "descripcion": "AppSec specialist who secures the software development lifecycle through threat modeling, secure code review, SAST/DAST integration, and developer security education that makes secure code the default.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-security-architect",
    "slug": "security-architect",
    "nombre": "Security Architect",
    "descripcion": "Expert security architect specializing in threat modeling, secure-by-design architecture, trust-boundary analysis, defense-in-depth, and risk-based security reviews across web, API, cloud-native, and distributed systems.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-blockchain-security-auditor",
    "slug": "blockchain-security-auditor",
    "nombre": "Blockchain Security Auditor",
    "descripcion": "Expert smart contract security auditor specializing in vulnerability detection, formal verification, exploit analysis, and comprehensive audit report writing for DeFi protocols and blockchain applications.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-cloud-security-architect",
    "slug": "cloud-security-architect",
    "nombre": "Cloud Security Architect",
    "descripcion": "Cloud-native security specialist designing zero trust architectures, implementing defense-in-depth across AWS, Azure, and GCP, and securing infrastructure-as-code pipelines from day one.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-compliance-auditor",
    "slug": "compliance-auditor",
    "nombre": "Compliance Auditor",
    "descripcion": "Expert technical compliance auditor specializing in SOC 2, ISO 27001, HIPAA, and PCI-DSS audits — from readiness assessment through evidence collection to certification.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-incident-responder",
    "slug": "incident-responder",
    "nombre": "Incident Responder",
    "descripcion": "Digital forensics and incident response specialist who leads breach investigations, contains active threats, coordinates crisis response, and writes post-mortems that prevent recurrence.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-penetration-tester",
    "slug": "penetration-tester",
    "nombre": "Penetration Tester",
    "descripcion": "Offensive security specialist conducting authorized penetration tests, red team operations, and vulnerability assessments across networks, web applications, and cloud infrastructure.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-secrets-credential-hygiene-engineer",
    "slug": "secrets-credential-hygiene-engineer",
    "nombre": "Secrets & Credential Hygiene Engineer",
    "descripcion": "Owns the full lifecycle of secrets and credentials — detection, prevention, vaulting, rotation, and leak response — so an application runs on short-lived, least-privilege credentials that are never in the code and are al",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-senior-secops-engineer",
    "slug": "senior-secops-engineer",
    "nombre": "Senior SecOps Engineer",
    "descripcion": "Defensive application security specialist who scans every code submission for secrets and sensitive data exposure before anything else, then implements or audits security controls following the organization's security st",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-threat-detection-engineer",
    "slug": "threat-detection-engineer",
    "nombre": "Threat Detection Engineer",
    "descripcion": "Expert detection engineer specializing in SIEM rule development, MITRE ATT&CK coverage mapping, threat hunting, alert tuning, and detection-as-code pipelines for security operations teams.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-threat-intelligence-analyst",
    "slug": "threat-intelligence-analyst",
    "nombre": "Threat Intelligence Analyst",
    "descripcion": "Cyber threat intelligence specialist who tracks adversary groups, maps attack campaigns to MITRE ATT&CK, produces actionable intelligence reports, and builds detection rules that catch real threats.",
    "stack": [
      "Security"
    ],
    "estado": "activo",
    "categoria": "Seguridad",
    "division": "security",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-macos-spatial-metal-engineer",
    "slug": "macos-spatial-metal-engineer",
    "nombre": "macOS Spatial/Metal Engineer",
    "descripcion": "Native Swift and Metal specialist building high-performance 3D rendering systems and spatial computing experiences for macOS and Vision Pro",
    "stack": [
      "AR",
      "VR"
    ],
    "estado": "activo",
    "categoria": "Spatial",
    "division": "spatial-computing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-terminal-integration-specialist",
    "slug": "terminal-integration-specialist",
    "nombre": "Terminal Integration Specialist",
    "descripcion": "Terminal emulation, text rendering optimization, and SwiftTerm integration for modern Swift applications",
    "stack": [
      "AR",
      "VR"
    ],
    "estado": "activo",
    "categoria": "Spatial",
    "division": "spatial-computing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-visionos-spatial-engineer",
    "slug": "visionos-spatial-engineer",
    "nombre": "visionOS Spatial Engineer",
    "descripcion": "Native visionOS spatial computing, SwiftUI volumetric interfaces, and Liquid Glass design implementation",
    "stack": [
      "AR",
      "VR"
    ],
    "estado": "activo",
    "categoria": "Spatial",
    "division": "spatial-computing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-xr-cockpit-interaction-specialist",
    "slug": "xr-cockpit-interaction-specialist",
    "nombre": "XR Cockpit Interaction Specialist",
    "descripcion": "Specialist in designing and developing immersive cockpit-based control systems for XR environments",
    "stack": [
      "AR",
      "VR"
    ],
    "estado": "activo",
    "categoria": "Spatial",
    "division": "spatial-computing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-xr-immersive-developer",
    "slug": "xr-immersive-developer",
    "nombre": "XR Immersive Developer",
    "descripcion": "Expert WebXR and immersive technology developer with specialization in browser-based AR/VR/XR applications",
    "stack": [
      "AR",
      "VR"
    ],
    "estado": "activo",
    "categoria": "Spatial",
    "division": "spatial-computing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-xr-interface-architect",
    "slug": "xr-interface-architect",
    "nombre": "XR Interface Architect",
    "descripcion": "Spatial interaction designer and interface strategist for immersive AR/VR/XR environments",
    "stack": [
      "AR",
      "VR"
    ],
    "estado": "activo",
    "categoria": "Spatial",
    "division": "spatial-computing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-accounts-payable-agent",
    "slug": "accounts-payable-agent",
    "nombre": "Accounts Payable Agent",
    "descripcion": "Autonomous payment processing specialist that executes vendor payments, contractor invoices, and recurring bills across any payment rail — crypto, fiat, stablecoins. Integrates with AI agent workflows via tool calls.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-agentic-identity-trust-architect",
    "slug": "agentic-identity-trust-architect",
    "nombre": "Agentic Identity & Trust Architect",
    "descripcion": "Designs identity, authentication, and trust verification systems for autonomous AI agents operating in multi-agent environments. Ensures agents can prove who they are, what they're authorized to do, and what they actuall",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-agents-orchestrator",
    "slug": "agents-orchestrator",
    "nombre": "Agents Orchestrator",
    "descripcion": "Autonomous pipeline manager that orchestrates the entire development workflow. You are the leader of this process.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-automation-governance-architect",
    "slug": "automation-governance-architect",
    "nombre": "Automation Governance Architect",
    "descripcion": "Governance-first architect for business automations (n8n-first) who audits value, risk, and maintainability before implementation.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-business-strategist",
    "slug": "business-strategist",
    "nombre": "Business Strategist",
    "descripcion": "Senior management consulting specialist for competitive analysis, market entry strategy, business model design, growth planning, organizational strategy, and strategic decision-making — translating complex market dynamic",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-change-management-consultant",
    "slug": "change-management-consultant",
    "nombre": "Change Management Consultant",
    "descripcion": "Expert change management specialist using ADKAR, Kotter, and Prosci frameworks to guide organizations through technology implementations, restructuring, culture transformation, and M&A integration — managing resistance, ",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-chief-financial-officer",
    "slug": "chief-financial-officer",
    "nombre": "Chief Financial Officer",
    "descripcion": "Strategic finance executive who governs capital allocation, treasury operations, financial planning, M&A finance, investor relations, and board reporting — translating financial complexity into clear decisions that drive",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-corporate-training-designer",
    "slug": "corporate-training-designer",
    "nombre": "Corporate Training Designer",
    "descripcion": "Expert in enterprise training system design and curriculum development — proficient in training needs analysis, instructional design methodology, blended learning program design, internal trainer development, leadership ",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-customer-service",
    "slug": "customer-service",
    "nombre": "Customer Service",
    "descripcion": "Friendly, professional customer service specialist for any industry — handling inquiries, complaints, account support, FAQs, and seamless escalation with warmth, efficiency, and a genuine commitment to customer satisfact",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-customer-success-manager",
    "slug": "customer-success-manager",
    "nombre": "Customer Success Manager",
    "descripcion": "Strategic customer success specialist for onboarding, health scoring, QBR facilitation, churn prevention, expansion identification, and renewal management — driving net revenue retention by turning customers into long-te",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-data-consolidation-agent",
    "slug": "data-consolidation-agent",
    "nombre": "Data Consolidation Agent",
    "descripcion": "AI agent that consolidates extracted sales data into live reporting dashboards with territory, rep, and pipeline summaries",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-data-privacy-officer",
    "slug": "data-privacy-officer",
    "nombre": "Data Privacy Officer",
    "descripcion": "Corporate data privacy specialist and DPO who builds GDPR, CCPA, and global privacy compliance programs — covering data mapping, privacy impact assessments, consent management, breach response, vendor due diligence, and ",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-esg-sustainability-officer",
    "slug": "esg-sustainability-officer",
    "nombre": "ESG & Sustainability Officer",
    "descripcion": "Corporate sustainability strategist and ESG reporting specialist who builds environmental, social, and governance programs, manages disclosures, drives decarbonization initiatives, and aligns business strategy with stake",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-government-digital-presales-consultant",
    "slug": "government-digital-presales-consultant",
    "nombre": "Government Digital Presales Consultant",
    "descripcion": "Presales expert for China's government digital transformation market (ToG), proficient in policy interpretation, solution design, bid document preparation, POC validation, compliance requirements (classified protection/c",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-grant-writer",
    "slug": "grant-writer",
    "nombre": "Grant Writer",
    "descripcion": "Expert grant writing specialist for nonprofits, research institutions, and social enterprises — covering prospect research, letter of inquiry writing, full proposal development, budget narratives, federal and foundation ",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-aging-parent-care-companion",
    "slug": "aging-parent-care-companion",
    "nombre": "Aging Parent Care Companion",
    "descripcion": "Compassionate, HIPAA-aligned care coordination and decision-support agent for family caregivers managing an aging parent's appointments, medications, care team communication, and their own caregiver wellbeing",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-healthcare-marketing-compliance-specialist",
    "slug": "healthcare-marketing-compliance-specialist",
    "nombre": "Healthcare Marketing Compliance Specialist",
    "descripcion": "Expert in healthcare marketing compliance in China, proficient in the Advertising Law, Medical Advertisement Management Measures, Drug Administration Law, and related regulations — covering pharmaceuticals, medical devic",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-hospitality-guest-services",
    "slug": "hospitality-guest-services",
    "nombre": "Hospitality Guest Services",
    "descripcion": "Comprehensive hospitality guest services specialist for hotels, resorts, restaurants, and event venues — covering reservations, check-in/check-out, concierge services, guest complaint resolution, loyalty program manageme",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-hr-onboarding",
    "slug": "hr-onboarding",
    "nombre": "HR Onboarding",
    "descripcion": "Comprehensive HR onboarding specialist for employee orientation, documentation management, compliance tracking, benefits enrollment, culture integration, and new hire support — delivering a seamless first-day-to-first-ye",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-identity-graph-operator",
    "slug": "identity-graph-operator",
    "nombre": "Identity Graph Operator",
    "descripcion": "Operates a shared identity graph that multiple AI agents resolve against. Ensures every agent in a multi-agent system gets the same canonical answer for \"who is this entity?\" - deterministically, even under concurrent wr",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-language-translator",
    "slug": "language-translator",
    "nombre": "Language Translator",
    "descripcion": "Real-time Spanish ↔ English translation specialist with cultural context, regional dialect awareness, travel phrase guidance, and tone-appropriate communication for everyday, business, and emergency situations",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-legal-billing-time-tracking",
    "slug": "legal-billing-time-tracking",
    "nombre": "Legal Billing & Time Tracking",
    "descripcion": "Comprehensive legal billing and time tracking specialist for accurate time capture, invoice generation, billing narrative writing, collections management, trust account compliance, and billing analysis — maximizing reven",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-legal-client-intake",
    "slug": "legal-client-intake",
    "nombre": "Legal Client Intake",
    "descripcion": "Comprehensive legal client intake specialist for qualifying prospects, collecting case information, scheduling consultations, managing conflict checks, and delivering attorney-ready intake summaries across any practice a",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-legal-document-review",
    "slug": "legal-document-review",
    "nombre": "Legal Document Review",
    "descripcion": "Comprehensive legal document review specialist for contracts, litigation documents, and real estate agreements — summarizing documents, flagging risk clauses, comparing contract versions, and checking compliance across a",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-loan-officer-assistant",
    "slug": "loan-officer-assistant",
    "nombre": "Loan Officer Assistant",
    "descripcion": "Comprehensive loan officer assistant for mortgage and lending professionals — covering borrower intake, pre-qualification, document collection, pipeline management, compliance tracking, rate quoting, and closing coordina",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-lsp-index-engineer",
    "slug": "lsp-index-engineer",
    "nombre": "LSP/Index Engineer",
    "descripcion": "Language Server Protocol specialist building unified code intelligence systems through LSP client orchestration and semantic indexing",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-m-a-integration-manager",
    "slug": "m-a-integration-manager",
    "nombre": "M&A Integration Manager",
    "descripcion": "Mergers and acquisitions integration specialist who designs and executes post-merger integration programs — covering Day 1 readiness, 100-day planning, synergy tracking, cultural integration, functional workstream coordi",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-medical-billing-coding-specialist",
    "slug": "medical-billing-coding-specialist",
    "nombre": "Medical Billing & Coding Specialist",
    "descripcion": "Expert medical billing and coding specialist for ICD-10-CM/PCS, CPT, and HCPCS coding, claim submission, denial management, revenue cycle optimization, compliance auditing, and payer contract analysis — maximizing clean ",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-operations-manager",
    "slug": "operations-manager",
    "nombre": "Operations Manager",
    "descripcion": "Business operations specialist who applies Lean, Six Sigma, and systems thinking to process mapping, capacity planning, KPI governance, vendor management, and organizational efficiency — turning operational complexity in",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-organizational-psychologist",
    "slug": "organizational-psychologist",
    "nombre": "Organizational Psychologist",
    "descripcion": "Applied organizational psychologist who diagnoses team dynamics, psychological safety, burnout risk, and culture health — using evidence-based frameworks to help leaders build high-performing, resilient, and psychologica",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-personal-growth-mentor",
    "slug": "personal-growth-mentor",
    "nombre": "Personal Growth Mentor",
    "descripcion": "Cross-domain personal development mentor for goal clarity, habit design, strategic decisions, and accountability without motivational fluff.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-real-estate-buyer-seller",
    "slug": "real-estate-buyer-seller",
    "nombre": "Real Estate Buyer & Seller",
    "descripcion": "Comprehensive real estate agent assistant for buyer representation, seller representation, listing management, offer negotiation, transaction coordination, and closing support — delivering a world-class client experience",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-recruitment-specialist",
    "slug": "recruitment-specialist",
    "nombre": "Recruitment Specialist",
    "descripcion": "Expert recruitment operations and talent acquisition specialist — skilled in China's major hiring platforms, talent assessment frameworks, and labor law compliance. Helps companies efficiently attract, screen, and retain",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-report-distribution-agent",
    "slug": "report-distribution-agent",
    "nombre": "Report Distribution Agent",
    "descripcion": "AI agent that automates distribution of consolidated sales reports to representatives based on territorial parameters",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-resume-tailor",
    "slug": "resume-tailor",
    "nombre": "Resume Tailor",
    "descripcion": "Candidate-side resume optimization specialist who analyzes job descriptions, maps real experience to role requirements, improves ATS keyword alignment, and rewrites bullets without fabricating qualifications.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-retail-customer-returns",
    "slug": "retail-customer-returns",
    "nombre": "Retail Customer Returns",
    "descripcion": "Comprehensive retail customer returns specialist for processing returns, exchanges, and refunds across in-store, online, and omnichannel retail — handling policy enforcement, fraud prevention, customer retention, vendor ",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-sales-data-extraction-agent",
    "slug": "sales-data-extraction-agent",
    "nombre": "Sales Data Extraction Agent",
    "descripcion": "AI agent specialized in monitoring Excel files and extracting key sales metrics (MTD, YTD, Year End) for internal live reporting",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-sales-outreach",
    "slug": "sales-outreach",
    "nombre": "Sales Outreach",
    "descripcion": "Consultative B2B sales outreach specialist for cold prospecting, lead follow-up, objection handling, proposal writing, and pipeline management — combining data-driven targeting with genuine relationship-building to open ",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-chief-of-staff",
    "slug": "chief-of-staff",
    "nombre": "Chief of Staff",
    "descripcion": "Master coordinator for founders and executives — filters noise, owns processes, enforces consistency, routes decisions, and positions outputs for impact so the boss can think clearly.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-civil-engineer",
    "slug": "civil-engineer",
    "nombre": "Civil Engineer",
    "descripcion": "Expert civil and structural engineer with global standards coverage — Eurocode, DIN, ACI, AISC, ASCE, AS/NZS, CSA, GB, IS, AIJ, and more. Specializes in structural analysis, geotechnical design, construction documentatio",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-codebase-archaeologist",
    "slug": "codebase-archaeologist",
    "nombre": "Codebase Archaeologist",
    "descripcion": "Multi-session, multi-tool drift detection specialist who audits codebases touched by several AI coding tools (Claude, Cursor, Copilot, Windsurf, etc.) over time, finding silent logic mismatches, dead code, and doc-vs-cod",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-cultural-intelligence-strategist",
    "slug": "cultural-intelligence-strategist",
    "nombre": "Cultural Intelligence Strategist",
    "descripcion": "CQ specialist that detects invisible exclusion, researches global context, and ensures software resonates authentically across intersectional identities.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-developer-advocate",
    "slug": "developer-advocate",
    "nombre": "Developer Advocate",
    "descripcion": "Expert developer advocate specializing in building developer communities, creating compelling technical content, optimizing developer experience (DX), and driving platform adoption through authentic engineering engagemen",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-document-generator",
    "slug": "document-generator",
    "nombre": "Document Generator",
    "descripcion": "Expert document creation specialist who generates professional PDF, PPTX, DOCX, and XLSX files using code-based approaches with proper formatting, charts, and data visualization.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-fedramp-rmf-compliance-engineer",
    "slug": "fedramp-rmf-compliance-engineer",
    "nombre": "FedRAMP & RMF Compliance Engineer",
    "descripcion": "Expert FedRAMP and NIST Risk Management Framework compliance engineer specializing in both FedRAMP authorization pathways — the traditional Rev5 path (NIST 800-53 Rev 5 control implementation, System Security Plans, 3PAO",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-focus-music-architect",
    "slug": "focus-music-architect",
    "nombre": "Focus Music Architect",
    "descripcion": "Instrumental focus music specialist and neuroacoustic prompt engineer — crafts high-yield prompts, soundscape architectures, BPM curves, and binaural layers for deep cognitive flow and generative audio models.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-french-consulting-market-navigator",
    "slug": "french-consulting-market-navigator",
    "nombre": "French Consulting Market Navigator",
    "descripcion": "Navigate the French ESN/SI freelance ecosystem — margin models, platform mechanics (Malt, collective.work), portage salarial, rate positioning, and payment cycle realities",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-korean-business-navigator",
    "slug": "korean-business-navigator",
    "nombre": "Korean Business Navigator",
    "descripcion": "Korean business culture for foreign professionals — 품의 decision process, nunchi reading, KakaoTalk business etiquette, hierarchy navigation, and relationship-first deal mechanics",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-master-plan-architect",
    "slug": "master-plan-architect",
    "nombre": "Master Plan Architect",
    "descripcion": "Master planning architect, technical educator, and ruthless plan critic who specializes in deep architectural teaching, Red Teaming / risk critique, and crafting comprehensive Implementation Plans in Markdown with ZERO c",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-mcp-builder",
    "slug": "mcp-builder",
    "nombre": "MCP Builder",
    "descripcion": "Expert Model Context Protocol developer who designs, builds, and tests MCP servers that extend AI agent capabilities with custom tools, resources, and prompts.",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-model-qa-specialist",
    "slug": "model-qa-specialist",
    "nombre": "Model QA Specialist",
    "descripcion": "Independent model QA expert who audits ML and statistical models end-to-end - from documentation review and data reconstruction to replication, calibration testing, interpretability analysis, performance monitoring, and ",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-pricing-analyst",
    "slug": "pricing-analyst",
    "nombre": "Pricing Analyst",
    "descripcion": "Specialized pricing analyst who develops optimal pricing models through market research, competitor analysis, cost structure evaluation, and margin optimization — turning pricing from guesswork into a data-driven competi",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-salesforce-architect",
    "slug": "salesforce-architect",
    "nombre": "Salesforce Architect",
    "descripcion": "Solution architecture for Salesforce platform — multi-cloud design, integration patterns, governor limits, deployment strategy, and data model governance for enterprise-scale orgs",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-strategy-duel-agent",
    "slug": "strategy-duel-agent",
    "nombre": "Strategy Duel Agent",
    "descripcion": "Conducts live strategy duels using game theory and the 36 Chinese stratagems",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-workflow-architect",
    "slug": "workflow-architect",
    "nombre": "Workflow Architect",
    "descripcion": "Workflow design specialist who maps complete workflow trees for every system, user journey, and agent interaction — covering happy paths, all branch conditions, failure modes, recovery paths, handoff contracts, and obser",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-study-abroad-advisor",
    "slug": "study-abroad-advisor",
    "nombre": "Study Abroad Advisor",
    "descripcion": "Full-spectrum study abroad planning expert covering the US, UK, Canada, Australia, Europe, Hong Kong, and Singapore — proficient in undergraduate, master's, and PhD application strategy, school selection, essay coaching,",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-supply-chain-strategist",
    "slug": "supply-chain-strategist",
    "nombre": "Supply Chain Strategist",
    "descripcion": "Expert supply chain management and procurement strategy specialist — skilled in supplier development, strategic sourcing, quality control, and supply chain digitalization. Grounded in China's manufacturing ecosystem, hel",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-zk-steward",
    "slug": "zk-steward",
    "nombre": "ZK Steward",
    "descripcion": "Knowledge-base steward in the spirit of Niklas Luhmann's Zettelkasten. Default perspective: Luhmann; switches to domain experts (Feynman, Munger, Ogilvy, etc.) by task. Enforces atomic notes, connectivity, and validation",
    "stack": [
      "Specialized"
    ],
    "estado": "activo",
    "categoria": "Especializados",
    "division": "specialized",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-analytics-reporter",
    "slug": "analytics-reporter",
    "nombre": "Analytics Reporter",
    "descripcion": "Expert data analyst transforming raw data into actionable business insights. Creates dashboards, performs statistical analysis, tracks KPIs, and provides strategic decision support through data visualization and reportin",
    "stack": [
      "Support",
      "Ops"
    ],
    "estado": "activo",
    "categoria": "Soporte",
    "division": "support",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-executive-summary-generator",
    "slug": "executive-summary-generator",
    "nombre": "Executive Summary Generator",
    "descripcion": "Consultant-grade AI specialist trained to think and communicate like a senior strategy consultant. Transforms complex business inputs into concise, actionable executive summaries using McKinsey SCQA, BCG Pyramid Principl",
    "stack": [
      "Support",
      "Ops"
    ],
    "estado": "activo",
    "categoria": "Soporte",
    "division": "support",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-finance-tracker",
    "slug": "finance-tracker",
    "nombre": "Finance Tracker",
    "descripcion": "Expert financial analyst and controller specializing in financial planning, budget management, and business performance analysis. Maintains financial health, optimizes cash flow, and provides strategic financial insights",
    "stack": [
      "Support",
      "Ops"
    ],
    "estado": "activo",
    "categoria": "Soporte",
    "division": "support",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-infrastructure-maintainer",
    "slug": "infrastructure-maintainer",
    "nombre": "Infrastructure Maintainer",
    "descripcion": "Expert infrastructure specialist focused on system reliability, performance optimization, and technical operations management. Maintains robust, scalable infrastructure supporting business operations with security, perfo",
    "stack": [
      "Support",
      "Ops"
    ],
    "estado": "activo",
    "categoria": "Soporte",
    "division": "support",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-legal-compliance-checker",
    "slug": "legal-compliance-checker",
    "nombre": "Legal Compliance Checker",
    "descripcion": "Expert legal and compliance specialist ensuring business operations, data handling, and content creation comply with relevant laws, regulations, and industry standards across multiple jurisdictions.",
    "stack": [
      "Support",
      "Ops"
    ],
    "estado": "activo",
    "categoria": "Soporte",
    "division": "support",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-support-responder",
    "slug": "support-responder",
    "nombre": "Support Responder",
    "descripcion": "Expert customer support specialist delivering exceptional customer service, issue resolution, and user experience optimization. Specializes in multi-channel support, proactive customer care, and turning support interacti",
    "stack": [
      "Support",
      "Ops"
    ],
    "estado": "activo",
    "categoria": "Soporte",
    "division": "support",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-accessibility-auditor",
    "slug": "accessibility-auditor",
    "nombre": "Accessibility Auditor",
    "descripcion": "Expert accessibility specialist who audits interfaces against WCAG standards, tests with assistive technologies, and ensures inclusive design. Defaults to finding barriers — if it's not tested with a screen reader, it's ",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-api-tester",
    "slug": "api-tester",
    "nombre": "API Tester",
    "descripcion": "Expert API testing specialist focused on comprehensive API validation, performance testing, and quality assurance across all systems and third-party integrations",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-evidence-collector",
    "slug": "evidence-collector",
    "nombre": "Evidence Collector",
    "descripcion": "Screenshot-obsessed, fantasy-allergic QA specialist - Default to finding 3-5 issues, requires visual proof for everything",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-performance-benchmarker",
    "slug": "performance-benchmarker",
    "nombre": "Performance Benchmarker",
    "descripcion": "Expert performance testing and optimization specialist focused on measuring, analyzing, and improving system performance across all applications and infrastructure",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-reality-checker",
    "slug": "reality-checker",
    "nombre": "Reality Checker",
    "descripcion": "Stops fantasy approvals, evidence-based certification - Default to \"NEEDS WORK\", requires overwhelming proof for production readiness",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [
      {
        "modulo": "AMD ERP",
        "estado": "completado",
        "resultado": "Disponible vía orquestador Cursor",
        "duracion": 0,
        "finalizado": "2026-09-22T22:50:00Z"
      }
    ],
    "sessionsActive": 1
  },
  {
    "id": "cursor-test-automation-engineer",
    "slug": "test-automation-engineer",
    "nombre": "Test Automation Engineer",
    "descripcion": "Expert end-to-end test automation engineer for Playwright and Cypress — resilient selectors, flake elimination, isolated test data, CI parallelization, and trace-driven failure debugging.",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-test-results-analyzer",
    "slug": "test-results-analyzer",
    "nombre": "Test Results Analyzer",
    "descripcion": "Expert test analysis specialist focused on comprehensive test result evaluation, quality metrics analysis, and actionable insight generation from testing activities",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-tool-evaluator",
    "slug": "tool-evaluator",
    "nombre": "Tool Evaluator",
    "descripcion": "Expert technology assessment specialist focused on evaluating, testing, and recommending tools, software, and platforms for business use and productivity optimization",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  },
  {
    "id": "cursor-workflow-optimizer",
    "slug": "workflow-optimizer",
    "nombre": "Workflow Optimizer",
    "descripcion": "Expert process improvement specialist focused on analyzing, optimizing, and automating workflows across all business functions for maximum productivity and efficiency",
    "stack": [
      "QA",
      "Testing"
    ],
    "estado": "activo",
    "categoria": "Calidad",
    "division": "testing",
    "trabajandoEn": null,
    "tasks": [],
    "sessionsActive": 0
  }
] as CursorAgentInfo[];
