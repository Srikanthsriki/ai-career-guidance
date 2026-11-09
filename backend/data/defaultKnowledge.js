// Curated Career Knowledge Base Documents, Verified Learning Resources, and Job/Internship Portals
const defaultKnowledgeDocuments = [
  {
    title: "Full Stack Web Development Career Path & Industry Standards",
    careerCategory: "Full Stack Web Development",
    tags: ["frontend", "backend", "javascript", "react", "node", "databases", "system-design"],
    summary: "Comprehensive guide to full stack software engineering including modern web frameworks, API design, database architecture, and deployment.",
    sourceName: "Mozilla Developer Network (MDN) & Roadmap.sh Standards",
    sourceUrl: "https://developer.mozilla.org",
    verified: true,
    content: `Full Stack Developers design and implement both client-facing and server-side components of modern web applications.
Essential Frontend Competencies:
- Semantic HTML5, CSS3, modern JavaScript (ES6+), TypeScript.
- Component architecture with React.js, state management (Redux, Context API, Zustand).
- Responsive UI design, Accessibility (WCAG 2.1), Web Performance Vitals.
Essential Backend Competencies:
- Node.js, Express.js, asynchronous I/O, middleware architecture.
- RESTful API design principles, GraphQL, WebSockets for real-time communication.
- Relational databases (PostgreSQL, MySQL) with ACID compliance, and NoSQL databases (MongoDB, Redis).
- Authentication & Authorization: JWT, OAuth 2.0, RBAC, session management.
DevOps & Deployment:
- Docker containerization, CI/CD pipelines (GitHub Actions), cloud hosting (AWS, Vercel, Render).
- Observability: logging, error tracing, load balancing, unit and integration testing with Jest and Cypress.`
  },
  {
    title: "AI & Machine Learning Engineering Roadmap and Principles",
    careerCategory: "AI & Machine Learning Engineer",
    tags: ["python", "machine-learning", "deep-learning", "pytorch", "transformers", "rag", "mcp"],
    summary: "Foundational and modern curriculum for AI Engineers specializing in LLMs, deep learning, MLOps, and agentic workflows.",
    sourceName: "Google DeepMind Research & Stanford CS229 / CS230 Curriculum",
    sourceUrl: "https://deepmind.google/technologies",
    verified: true,
    content: `AI and Machine Learning Engineers construct intelligent systems utilizing statistical learning, neural architectures, and generative foundation models.
Mathematical Foundations:
- Multivariable Calculus, Linear Algebra, Probability & Statistics, Convex Optimization.
Core ML & Data Engineering:
- Python, NumPy, Pandas, Scikit-Learn for tabular data, feature engineering, and cross-validation.
Deep Learning & Generative AI:
- PyTorch and TensorFlow for deep neural networks (CNNs, RNNs, Transformers).
- Large Language Models (LLMs), attention mechanisms, prompting techniques, fine-tuning (LoRA, QLoRA).
- Retrieval-Augmented Generation (RAG): vector embeddings, vector databases (Pinecone, ChromaDB, FAISS), chunking strategies, hybrid search.
- Agentic Systems & Model Context Protocol (MCP): tool-use patterns, planning, reflection, deterministic safety boundaries.
MLOps:
- Experiment tracking (MLflow, Weights & Biases), model serving (FastAPI, Triton, vLLM), containerization.`
  },
  {
    title: "Data Science & Advanced Analytics Framework",
    careerCategory: "Data Scientist",
    tags: ["data-science", "statistics", "python", "sql", "tableau", "predictive-modeling"],
    summary: "Comprehensive methodologies for extracting actionable business insights through exploratory data analysis, statistical inference, and machine learning.",
    sourceName: "Harvard Data Science Review & ACM Computing Surveys",
    sourceUrl: "https://hdsr.mitpress.mit.edu",
    verified: true,
    content: `Data Scientists synthesize computer science, domain expertise, and statistical analysis to solve unstructured business problems.
Core Data Competencies:
- Advanced SQL for complex analytical window functions, CTEs, and aggregation.
- Exploratory Data Analysis (EDA) using Python (Seaborn, Matplotlib, Plotly).
- Hypothesis testing, A/B experimentation, Bayesian inference, regression analysis.
Machine Learning in Production:
- Supervised algorithms (Random Forests, XGBoost, LightGBM) and unsupervised clustering (K-Means, PCA).
- Data storytelling, executive dashboards in Tableau or PowerBI.
- Reproducible research using Jupyter Notebooks, Docker, and Git.`
  },
  {
    title: "Cloud Computing, DevOps & Site Reliability Engineering (SRE)",
    careerCategory: "Cloud & DevOps Engineer",
    tags: ["cloud", "aws", "docker", "kubernetes", "terraform", "ci-cd", "linux"],
    summary: "Production infrastructure automation, infrastructure-as-code, high-availability architecture, and container orchestration.",
    sourceName: "Google Cloud SRE Handbook & CNCF Landscape",
    sourceUrl: "https://sre.google/sre-book/table-of-contents",
    verified: true,
    content: `DevOps and Cloud Engineers bridge software engineering and operations to maximize deployment frequency, reliability, and security.
Foundational Skills:
- Advanced Linux administration, Bash scripting, networking protocols (TCP/IP, DNS, HTTP/HTTPS, SSL/TLS).
- Cloud Platforms: AWS (EC2, S3, ECS, Lambda, IAM), GCP, or Azure.
Containerization & Orchestration:
- Docker image optimization, multi-stage builds.
- Kubernetes architecture: Pods, Deployments, Services, Ingress, Helm charts.
Infrastructure as Code (IaC) & CI/CD:
- Terraform, Ansible for declarative infrastructure provisioning.
- Continuous Integration & Deployment with GitHub Actions, GitLab CI, or ArgoCD.
- SRE Metrics: SLIs, SLOs, SLAs, error budgets, Prometheus & Grafana monitoring.`
  },
  {
    title: "Cybersecurity & Information Security Engineering",
    careerCategory: "Cybersecurity Specialist",
    tags: ["cybersecurity", "network-security", "ethical-hacking", "cryptography", "soc", "penetration-testing"],
    summary: "Comprehensive defensive and offensive cybersecurity principles, vulnerability assessment, and threat mitigation.",
    sourceName: "NIST Cybersecurity Framework (CSF) & OWASP Foundation",
    sourceUrl: "https://owasp.org",
    verified: true,
    content: `Cybersecurity Professionals protect networks, computer systems, and applications from malicious intrusion, data breaches, and vulnerabilities.
Key Areas of Practice:
- OWASP Top 10 web vulnerabilities (SQL Injection, XSS, CSRF, Broken Access Control).
- Network Security: Firewalls, IDS/IPS, Wireshark packet inspection, VPNs.
- Defensive Security (Blue Team): SIEM analysis (Splunk, Elastic), incident response, zero-trust architecture.
- Offensive Security (Red Team): Penetration testing (Kali Linux, Metasploit, Burp Suite), ethical hacking.
- Cryptography: Symmetric vs Asymmetric encryption, hashing (SHA-256), PKI, SSL/TLS certificates.`
  },
  {
    title: "Mobile Application Development (iOS & Android)",
    careerCategory: "Mobile App Developer",
    tags: ["mobile", "react-native", "flutter", "android", "ios", "swift", "kotlin"],
    summary: "Cross-platform and native mobile software engineering patterns, offline storage, performance optimization, and app store deployment.",
    sourceName: "Android Developers & Apple Developer Documentation",
    sourceUrl: "https://developer.android.com",
    verified: true,
    content: `Mobile App Developers create resilient, responsive applications running on iOS and Android devices.
Cross-Platform vs Native:
- React Native & Flutter for unified codebases with high native fidelity.
- Swift & SwiftUI for iOS; Kotlin & Jetpack Compose for modern Android.
Mobile Architecture:
- State management, offline-first synchronization with SQLite/WatermelonDB/Realm.
- Push notifications (Firebase Cloud Messaging, APNs).
- Device sensors, camera integrations, background tasks, and App Store / Google Play publishing pipelines.`
  }
];

// Verified external learning resources organized by category and skill
const verifiedLearningResources = [
  {
    career: "Full Stack Web Development",
    title: "MDN Web Docs (Mozilla Developer Network)",
    provider: "Mozilla",
    type: "Documentation & Tutorials",
    skill: "HTML, CSS, JavaScript, Web APIs",
    difficulty: "Beginner to Advanced",
    url: "https://developer.mozilla.org",
    isFree: true,
    description: "The gold standard documentation for HTML, CSS, JavaScript, and Web APIs maintained by Mozilla and open source contributors."
  },
  {
    career: "Full Stack Web Development",
    title: "CS50's Web Programming with Python and JavaScript",
    provider: "Harvard University (edX)",
    type: "Course",
    skill: "Full Stack, Flask, Django, SQL, React",
    difficulty: "Intermediate",
    url: "https://cs50.harvard.edu/web",
    isFree: true,
    description: "Harvard University's acclaimed course covering database design, scalability, security, and user experience."
  },
  {
    career: "Full Stack Web Development",
    title: "freeCodeCamp Full Stack Developer Curriculum",
    provider: "freeCodeCamp",
    type: "Interactive Curriculum",
    skill: "Responsive Design, JS Algorithms, Node.js, Express, MongoDB",
    difficulty: "Beginner to Intermediate",
    url: "https://www.freecodecamp.org",
    isFree: true,
    description: "Hands-on, project-based interactive curriculum granting verified certifications in web development."
  },
  {
    career: "AI & Machine Learning Engineer",
    title: "Machine Learning Specialization by Andrew Ng",
    provider: "DeepLearning.AI & Stanford Online",
    type: "Course",
    skill: "Supervised Learning, Neural Networks, Decision Trees",
    difficulty: "Beginner to Intermediate",
    url: "https://www.deeplearning.ai/courses/machine-learning-specialization/",
    isFree: false,
    auditAvailable: true,
    description: "Foundational machine learning program taught by AI pioneer Andrew Ng covering mathematical intuition and practical algorithms."
  },
  {
    career: "AI & Machine Learning Engineer",
    title: "Hugging Face Deep RL and LLM Course",
    provider: "Hugging Face",
    type: "Interactive Course & Documentation",
    skill: "Transformers, PyTorch, Tokenizers, Fine-Tuning",
    difficulty: "Intermediate to Advanced",
    url: "https://huggingface.co/learn",
    isFree: true,
    description: "Open source community tutorials for mastering NLP, Transformers, diffusion models, and evaluation."
  },
  {
    career: "Data Scientist",
    title: "Kaggle Learn Micro-Courses",
    provider: "Kaggle (Google)",
    type: "Hands-on Labs",
    skill: "Python, Pandas, Data Cleaning, Intro to Deep Learning",
    difficulty: "Beginner",
    url: "https://www.kaggle.com/learn",
    isFree: true,
    description: "Bite-sized, practical coding tutorials with live browser notebooks and real-world datasets."
  },
  {
    career: "Cloud & DevOps Engineer",
    title: "AWS Cloud Practitioner & Architect Essentials",
    provider: "AWS Skill Builder",
    type: "Course & Official Labs",
    skill: "Cloud Architecture, EC2, S3, IAM, VPC",
    difficulty: "Beginner to Intermediate",
    url: "https://aws.amazon.com/training/digital/",
    isFree: true,
    description: "Official AWS digital training covering core cloud fundamentals, security, and architecture."
  },
  {
    career: "Cybersecurity Specialist",
    title: "OWASP Top 10 Security Risks & Mitigations",
    provider: "OWASP Foundation",
    type: "Documentation & Cheat Sheets",
    skill: "Application Security, Vulnerability Prevention",
    difficulty: "Intermediate",
    url: "https://owasp.org/www-project-top-ten/",
    isFree: true,
    description: "Industry-standard awareness document for developers and web application security experts."
  }
];

// Verified entry-level job and internship portals and guides
const verifiedJobOpportunities = [
  {
    title: "Google Students and Early Career Opportunities",
    organization: "Google",
    category: "Software Engineering & Research Internships",
    type: "Internship & Full-time",
    location: "Global / Remote / Hybrid",
    url: "https://www.google.com/about/careers/applications/students/",
    eligibility: "Enrolled in undergraduate, master's or PhD programs in CS or related technical field.",
    description: "Official portal for Google Summer Internships, STEP program, and Associate Product Manager / SWE roles."
  },
  {
    title: "Microsoft University Recruiting",
    organization: "Microsoft",
    category: "Engineering, Product & Cloud Internships",
    type: "Internship & New Graduate",
    location: "Global / US / India / Remote",
    url: "https://careers.microsoft.com/students/us/en",
    eligibility: "Students currently enrolled in an accredited academic institution.",
    description: "Internship positions in Azure, Office, Developer Tools, Windows, and AI development."
  },
  {
    title: "GitHub Campus Experts & GitHub Internships",
    organization: "GitHub",
    category: "Open Source & Developer Tools",
    type: "Student Program & Internships",
    location: "Remote / Hybrid",
    url: "https://education.github.com/students",
    eligibility: "Verified students with GitHub Student Developer Pack.",
    description: "Empowers student leaders and opens paths into developer relations, software development, and open source."
  },
  {
    title: "Wellfound (formerly AngelList Talent)",
    organization: "Wellfound",
    category: "Startup Tech Jobs & Internships",
    type: "Entry-level & Early Stage",
    location: "Global & Remote",
    url: "https://wellfound.com/jobs",
    eligibility: "All candidates; specializes in pre-seed to Series C tech startup hiring.",
    description: "Direct connection with startup founders and engineering leads with transparent equity and salary ranges."
  },
  {
    title: "Internshala Student Internships",
    organization: "Internshala",
    category: "Web Dev, Data Science & Mobile Internships",
    type: "Internship & Work from Home",
    location: "India & Remote",
    url: "https://internshala.com/internships",
    eligibility: "College students and recent graduates across all academic disciplines.",
    description: "Extensive marketplace for paid summer, winter, and remote college internships with verified stipends."
  }
];

module.exports = {
  defaultKnowledgeDocuments,
  verifiedLearningResources,
  verifiedJobOpportunities
};

