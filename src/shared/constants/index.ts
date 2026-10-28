import { 
    Educator, Project, Task, Bid, AppNotification, ProjectStatus, BidStatus, 
    AssignmentType, AssignmentStatus, WithdrawalRequest, Transaction, InboxMessage, 
    SupportTicket, EducatorStatus, ProjectCreationType, VerificationStatus, Language, 
    Skill, User, EducationalRequest, EducationalRequestStatus, PaymentStatus, 
    FulfillmentStatus, PricingType, UserStatus, EducatorApplication, 
    CertificationApplication as CertificationApp, Invoice, InvoiceStatus, AdminActivity, 
    AdminMessage, Service, WorkExperience, Certification, VerifiableDocument, 
    SupportTicketStatus, Gender, ExperienceLevel, IdType, SkillLevel, LanguageLevel, AvailabilityStatus 
} from '../types';

export const CURRENT_EDUCATOR_ID = 'e2'; // We will simulate being logged in as فاطمة الزهراء
export const ADMIN_USER = {
  id: 'admin1',
  name: 'فريق الدعم',
  email: 'admin@example.com',
  avatarUrl: 'https://i.pravatar.cc/100?u=admin1',
};

export const PREDEFINED_SKILLS = ['تطوير المناهج', 'التدريس عن بعد', 'البحث العلمي', 'تصميم التجارب', 'تحليل البيانات', 'الكتابة الأكاديمية', 'التقييم التربوي', 'برمجة Python', 'تصميم الجرافيك'];
export const PREDEFINED_MAJORS = [
  'هندسة البرمجيات',
  'علوم الحاسوب',
  'علوم الحاسب',
  'الذكاء الاصطناعي',
  'علم البيانات',
  'الهندسة المدنية',
  'الهندسة الميكانيكية',
  'الطب',
  'إدارة الأعمال',
  'القانون',
  'التربية',
  'التصميم الجرافيكي',
  'الفيزياء النظرية',
  'فيزياء الجسيمات',
  'الكيمياء العضوية',
  'الأدب العربي',
  'التاريخ الإسلامي',
  'الاقتصاد',
  'علم الأحياء'
];
export const PREDEFINED_SERVICES = ['كتابة محتوى تعليمي متخصص', 'تصميم اختبارات وتقييمات', 'مراجعة علمية وتدقيق', 'ترجمة أكاديمية', 'استشارات بحثية', 'تطوير تطبيقات الويب'];


export const EDUCATORS: Educator[] = [
  { 
    id: 'e2', 
    name: 'فاطمة الزهراء', 
    email: 'fatima.z@example.com', 
    phone: '+201001112222',
    discipline: 'الفيزياء النظرية',
    schoolName: 'جامعة القاهرة',
    country: 'مصر',
    city: 'القاهرة',
    status: EducatorStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/100?u=e2', 
    rating: 4.9, 
    availabilityStatus: AvailabilityStatus.AVAILABLE,
    bio: 'متخصصة في الفيزياء بخبرة تزيد عن 10 سنوات في تبسيط المفاهيم المعقدة وتطوير محتوى تعليمي جذاب. حاصلة على درجة الماجستير في الفيزياء النظرية.',
    profile: {
        gender: Gender.FEMALE, birthDate: '1985-05-20', nationality: 'مصرية', educationLevel: 'ماجستير',
        experienceYears: 12, employmentStatus: 'عمل حر', profileCompletion: 95,
        identityStatus: VerificationStatus.VERIFIED, experienceLevel: ExperienceLevel.EXPERT, idType: IdType.NATIONAL_ID,
        idNumber: '28505200100123', idDocumentUrl: 'https://via.placeholder.com/400x250.png?text=ID+Document',
    },
    academicMajors: [
      { id: 'am-1', majorName: 'الفيزياء النظرية', isCustom: false, institution: 'جامعة القاهرة', graduationYear: '2012', degree: 'ماجستير', documentUrl: 'https://via.placeholder.com/300x400.png?text=Master+Degree', verificationStatus: VerificationStatus.VERIFIED, },
      { id: 'am-2', majorName: 'فيزياء الجسيمات', isCustom: true, institution: 'جامعة عين شمس', graduationYear: '2010', degree: 'بكالوريوس', verificationStatus: VerificationStatus.REJECTED, rejectionReason: 'المستند غير واضح.' }
    ],
    skills: [
      { id: 'skill-1', name: 'الميكانيكا الكلاسيكية', level: SkillLevel.EXPERT, isCustom: false },
      { id: 'skill-2', name: 'الكهرومغناطيسية', level: SkillLevel.EXPERT, isCustom: false },
      { id: 'skill-3', name: 'تطوير محتوى الفيديو', level: SkillLevel.INTERMEDIATE, isCustom: true }
    ],
    languages: [ { id: 'lang-1', name: 'العربية', level: LanguageLevel.NATIVE }, { id: 'lang-2', name: 'الإنجليزية', level: LanguageLevel.ADVANCED } ],
    workExperience: [
      { id: 'exp-1', title: 'مطور مناهج فيزياء', organization: 'شركة تطوير التعليم', startDate: '2015-01-01', endDate: '2024-01-01', description: 'عملت على تطوير وتحديث مناهج الفيزياء للمرحلة الثانوية لتتواكب مع المعايير الدولية.', documentUrl: 'https://via.placeholder.com/300x200.png?text=Experience+Proof', verificationStatus: VerificationStatus.VERIFIED },
      { id: 'exp-2', title: 'مساعد باحث', organization: 'جامعة القاهرة', startDate: '2012-06-01', endDate: '2014-12-31', description: 'المشاركة في أبحاث متعلقة بفيزياء الطاقة العالية ونشر ورقتين علميتين.', verificationStatus: VerificationStatus.VERIFIED }
    ],
    certifications: [ { id: 'cert-1', title: 'شهادة في التصميم التعليمي', issuingAuthority: 'Coursera', issueDate: '2020-03-15', description: 'دورة مكثفة في مبادئ التصميم التعليمي وتكنولوجيا التعليم.', documentUrl: 'https://via.placeholder.com/400x300.png?text=Coursera+Cert', verificationStatus: VerificationStatus.PENDING } ],
    services: [
        { id: 'serv-1', name: 'كتابة محتوى تعليمي متخصص', description: 'كتابة شروحات ومقالات علمية مبسطة وموثوقة.', isCustom: false },
        { id: 'serv-2', name: 'تصميم اختبارات وتقييمات', description: 'إعداد بنوك أسئلة واختبارات قياس مستوى للطلاب.', isCustom: false },
    ],
    socialLinks: [ { platform: 'linkedin', url: '#' }, { platform: 'twitter', url: '#' } ],
    paymentInfo: {
        bankName: 'البنك الأهلي المصري',
        accountHolderName: 'فاطمة الزهراء محمد',
        iban: 'EG830001000200000000012345678',
    }
  },
  {
    id: 'e3', name: 'علي حسن', email: 'ali.h@example.com', phone: '+966501234567', discipline: 'علوم الحاسب', schoolName: 'جامعة الملك سعود', country: 'السعودية', city: 'الرياض', status: EducatorStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/100?u=e3', rating: 4.8, availabilityStatus: AvailabilityStatus.AVAILABLE, bio: 'مبرمج ومطور ويب متخصص في بناء تطبيقات تعليمية تفاعلية. خبرة في Python, JavaScript, و React.',
    profile: { gender: Gender.MALE, birthDate: '1990-02-15', nationality: 'سعودي', educationLevel: 'بكالوريوس', experienceYears: 8, employmentStatus: 'موظف', profileCompletion: 90, identityStatus: VerificationStatus.VERIFIED, experienceLevel: ExperienceLevel.EXPERT, idType: IdType.NATIONAL_ID, idNumber: '109021501234', idDocumentUrl: 'https://via.placeholder.com/400x250.png?text=ID+Document' },
    academicMajors: [ { id: 'am-3', majorName: 'علوم الحاسب', isCustom: false, institution: 'جامعة الملك سعود', graduationYear: '2013', degree: 'بكالوريوس', documentUrl: 'https://via.placeholder.com/300x400.png?text=Bachelor+Degree', verificationStatus: VerificationStatus.VERIFIED } ],
    skills: [ { id: 'skill-4', name: 'برمجة Python', level: SkillLevel.EXPERT, isCustom: false }, { id: 'skill-5', name: 'React', level: SkillLevel.EXPERT, isCustom: false }, ],
    languages: [ { id: 'lang-3', name: 'العربية', level: LanguageLevel.NATIVE }, { id: 'lang-4', name: 'الإنجليزية', level: LanguageLevel.ADVANCED } ],
    workExperience: [ { id: 'exp-3', title: 'مطور تطبيقات ويب', organization: 'شركة تقنية', startDate: '2014-01-01', endDate: '2023-12-31', description: 'تطوير وصيانة تطبيقات ويب متكاملة.', documentUrl: 'https://via.placeholder.com/300x200.png?text=Experience+Proof', verificationStatus: VerificationStatus.VERIFIED } ],
    certifications: [], services: [ { id: 'serv-4', name: 'تطوير تطبيقات الويب', description: 'بناء وتطوير تطبيقات ويب تعليمية.', isCustom: true } ], socialLinks: [ { platform: 'github', url: '#' } ],
    paymentInfo: { bankName: 'بنك الراجحي', accountHolderName: 'علي حسن عبدالله', iban: 'SA0380000123456789012345' }
  },
  {
    id: 'e4', name: 'نورة خالد', email: 'noura.k@example.com', phone: '+971501112233', discipline: 'الأدب العربي', schoolName: 'جامعة الإمارات', country: 'الإمارات', city: 'دبي', status: EducatorStatus.PENDING_REVIEW,
    avatarUrl: 'https://i.pravatar.cc/100?u=e4', rating: 0, availabilityStatus: AvailabilityStatus.UNAVAILABLE, bio: 'باحثة في الأدب العربي الحديث، متخصصة في النقد الأدبي وكتابة المحتوى الإبداعي.',
    profile: { gender: Gender.FEMALE, birthDate: '1992-11-30', nationality: 'إمارات��ة', educationLevel: 'ماجستير', experienceYears: 5, employmentStatus: 'باحث', profileCompletion: 75, identityStatus: VerificationStatus.PENDING, experienceLevel: ExperienceLevel.INTERMEDIATE, idType: IdType.PASSPORT, idNumber: 'E12345678', idDocumentUrl: 'https://via.placeholder.com/400x250.png?text=ID+Document' },
    academicMajors: [ { id: 'am-4', majorName: 'الأدب العربي', isCustom: false, institution: 'جامعة الإمارات', graduationYear: '2018', degree: 'ماجستير', documentUrl: 'https://via.placeholder.com/300x400.png?text=Master+Degree', verificationStatus: VerificationStatus.PENDING } ],
    skills: [ { id: 'skill-6', name: 'الكتابة الإبداعية', level: SkillLevel.EXPERT, isCustom: true }, { id: 'skill-7', name: 'النقد الأدبي', level: SkillLevel.INTERMEDIATE, isCustom: false } ],
    languages: [ { id: 'lang-5', name: 'العربية', level: LanguageLevel.NATIVE } ], workExperience: [], certifications: [], services: [], socialLinks: [],
    paymentInfo: { bankName: '', accountHolderName: '', iban: '' }
  },
   {
    id: 'e5', name: 'يوسف أحمد', email: 'youssef.a@example.com', phone: '+201234567890', discipline: 'الكيمياء', schoolName: 'جامعة الإسكندرية', country: 'مصر', city: 'الإسكندرية', status: EducatorStatus.REJECTED,
    avatarUrl: 'https://i.pravatar.cc/100?u=e5', rating: 0, availabilityStatus: AvailabilityStatus.UNAVAILABLE, bio: 'معلم كيمياء للمرحلة الثانوية.',
    profile: { gender: Gender.MALE, birthDate: '1988-08-08', nationality: 'مصري', educationLevel: 'بكالوريوس', experienceYears: 7, employmentStatus: 'موظف', profileCompletion: 60, identityStatus: VerificationStatus.REJECTED, experienceLevel: ExperienceLevel.INTERMEDIATE, idType: IdType.NATIONAL_ID, idNumber: '28808080200555', idDocumentUrl: 'https://via.placeholder.com/400x250.png?text=ID+Document' },
    academicMajors: [ { id: 'am-5', majorName: 'الكيمياء', isCustom: false, institution: 'جامعة الإسكندرية', graduationYear: '2010', degree: 'بكالوريوس', documentUrl: 'https://via.placeholder.com/300x400.png?text=Bachelor+Degree', verificationStatus: VerificationStatus.REJECTED, rejectionReason: 'المستند غير واضح.' } ],
    skills: [], languages: [], workExperience: [], certifications: [], services: [], socialLinks: [],
    paymentInfo: { bankName: '', accountHolderName: '', iban: '' }
  },
  {
    id: 'e6', name: 'ليلى إبراهيم', email: 'layla.i@example.com', phone: '+96512345678', discipline: 'الهندسة الميكانيكية', schoolName: 'جامعة الكويت', country: 'الكويت', city: 'مدينة الكويت', status: EducatorStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/100?u=e6', rating: 4.7, availabilityStatus: AvailabilityStatus.AVAILABLE, bio: 'مهندسة ميكانيكية بخبرة في التصميم والتحليل، وشغوفة بتبسيط المفاهيم الهندسية للطلاب.',
    profile: { gender: Gender.FEMALE, birthDate: '1989-03-25', nationality: 'كويتية', educationLevel: 'بكالوريوس', experienceYears: 9, employmentStatus: 'عمل حر', profileCompletion: 98, identityStatus: VerificationStatus.VERIFIED, experienceLevel: ExperienceLevel.EXPERT, idType: IdType.NATIONAL_ID, idNumber: '289032501234', idDocumentUrl: 'https://via.placeholder.com/400x250.png?text=ID+Document' },
    academicMajors: [ { id: 'am-6', majorName: 'الهندسة الميكانيكية', isCustom: false, institution: 'جامعة الكويت', graduationYear: '2012', degree: 'بكالوريوس', documentUrl: 'https://via.placeholder.com/300x400.png?text=Bachelor+Degree', verificationStatus: VerificationStatus.VERIFIED } ],
    skills: [ { id: 'skill-8', name: 'AutoCAD', level: SkillLevel.EXPERT, isCustom: true }, { id: 'skill-9', name: 'SolidWorks', level: SkillLevel.EXPERT, isCustom: true } ],
    languages: [ { id: 'lang-6', name: 'العربية', level: LanguageLevel.NATIVE }, { id: 'lang-7', name: 'الإنجليزية', level: LanguageLevel.ADVANCED } ],
    workExperience: [], certifications: [], services: [], socialLinks: [],
    paymentInfo: { bankName: 'بنك الكويت الوطني', accountHolderName: 'ليلى إبراهيم', iban: 'KW81NBOK0000000000001234567890' }
  },
  {
    id: 'e7', name: 'عمر سعيد', email: 'omar.s@example.com', phone: '+962791234567', discipline: 'التاريخ', schoolName: 'الجامعة الأردنية', country: 'الأردن', city: 'عمان', status: EducatorStatus.SUSPENDED,
    avatarUrl: 'https://i.pravatar.cc/100?u=e7', rating: 4.5, availabilityStatus: AvailabilityStatus.UNAVAILABLE, bio: 'باحث في التاريخ الإسلامي والوسيط.',
    profile: { gender: Gender.MALE, birthDate: '1980-01-01', nationality: 'أردني', educationLevel: 'دكتوراه', experienceYears: 15, employmentStatus: 'أكاديمي', profileCompletion: 92, identityStatus: VerificationStatus.VERIFIED, experienceLevel: ExperienceLevel.EXPERT, idType: IdType.NATIONAL_ID, idNumber: '180010101234', idDocumentUrl: 'https://via.placeholder.com/400x250.png?text=ID+Document' },
    academicMajors: [], skills: [], languages: [], workExperience: [], certifications: [], services: [], socialLinks: [],
    paymentInfo: { bankName: '', accountHolderName: '', iban: '' }
  }
];

const TASKS_P1: Task[] = [
    { id: 't1-1', title: 'الفصل الأول: مقدمة في الجبر', description: 'كتابة محتوى تعليمي وشرح مبسط للمفاهيم الأساسية.', status: ProjectStatus.COMPLETED, assignments: [{ id: 'a1-1-1', educatorId: 'e6', type: AssignmentType.DIRECT, status: AssignmentStatus.ACCEPTED, amount: 1450 }], deadline: '2024-08-10', budget: 1500, isPublic: false, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-07-01', activityLog: [] },
    { id: 't1-2', title: 'الفصل الثاني: المعادلات الخطية', description: 'إعداد تمارين وتطبيقات عملية على المعادلات.', status: ProjectStatus.IN_PROGRESS, assignments: [], deadline: '2024-08-20', budget: 1500, isPublic: true, biddingStatus: 'OPEN', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-07-01', activityLog: [] },
    { id: 't1-3', title: 'إعداد الاختبار النصفي', description: 'تصميم اختبار يغطي الفصول الأولى.', status: ProjectStatus.PENDING, assignments: [{ id: 'a1-3-1', educatorId: 'e2', type: AssignmentType.INVITATION, status: AssignmentStatus.PENDING }], deadline: '2024-08-25', budget: 1000, isPublic: false, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-07-01', activityLog: [] },
    { id: 't1-4', title: 'مراجعة وتدقيق المحتوى', description: 'مراجعة لغوية وعلمية للفصل الأول والثاني.', status: ProjectStatus.IN_PROGRESS, assignments: [{ id: 'a1-4-1', educatorId: 'e2', type: AssignmentType.DIRECT, status: AssignmentStatus.ACCEPTED, amount: 900 }], deadline: '2024-09-01', budget: 900, isPublic: false, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-10', activityLog: [] },
];

const TASKS_P2: Task[] = [
    { 
        id: 't2-1', title: 'تجربة قياس التسارع', description: 'تصوير فيديو للتجربة وشرح الخطوات. يجب أن يكون الفيديو عالي الدقة والصوت واضح. المدة المستهدفة 10-15 دقيقة.', status: ProjectStatus.IN_PROGRESS, 
        assignments: [{id: 't2-a1', educatorId: 'e2', type: AssignmentType.FROM_BID, status: AssignmentStatus.ACCEPTED, amount: 1400}], 
        deadline: '2024-09-05', budget: 1800, isPublic: true, biddingStatus: 'CLOSED',
        subTasks: [ { id: 'st-2-1-1', title: 'كتابة سيناريو الفيديو', completed: true, createdBy: 'admin', attachments: [], createdAt: '2024-07-11' }, { id: 'st-2-1-2', title: 'تجهيز الأدوات والمواد للتجربة', completed: true, createdBy: 'admin', attachments: [], createdAt: '2024-07-12', modifiedAt: '2024-07-13' }, { id: 'st-2-1-3', title: 'تصوير التجربة', completed: false, createdBy: 'provider', providerId: 'e2', attachments: [ { id: 'sta-1', title: 'قائمة اللقطات المقترحة', name: 'shot_list.docx', url: '#', size: '22KB', type: 'DOCX', uploadedBy: 'provider' } ], createdAt: '2024-07-14' }, { id: 'st-2-1-4', title: 'مونتاج الفيديو وإضافة الرسومات', completed: false, createdBy: 'provider', providerId: 'e2', attachments: [], createdAt: '2024-07-15' }, ],
        attachments: [ { id: 'ta-1', name: 'ارشادات_السلامة.pdf', url: '#', size: '1.2MB', type: 'PDF', uploadedBy: 'admin' }, ], deliverables: [ { id: 'del-1', title: 'فيديو التجربة - النسخة الأولى', name: 'experiment_v1.mp4', url: '#', size: '25.6MB', type: 'Video', uploadedBy: 'provider' }, ],
        notes: [ { id: 'tn-2', content: 'بالتأكيد، تم التنسيق مع قسم الإعلام لتوفير المعدات اللازمة.', createdAt: 'منذ يوم', createdBy: 'admin', authorName: 'محمد سعيد', authorAvatar: 'https://i.pravatar.cc/100?u=admin' }, { id: 'tn-1', content: 'هل يمكن توفير كاميرا احترافية للتصوير؟', createdAt: 'منذ يومين', createdBy: 'provider', authorName: 'فاطمة الزهراء', authorAvatar: 'https://i.pravatar.cc/100?u=e2' }, ],
        creationDate: '2024-07-10', modifiedAt: '2024-07-15', activityLog: []
    },
    { id: 't2-2', title: 'تحليل البيانات وكتابة التقرير', description: 'تحليل النتائج المستخلصة من التجربة وكتابة تقرير علمي مفصل.', status: ProjectStatus.COMPLETED, assignments: [{ id: 'a2-2-1', educatorId: 'e2', type: AssignmentType.FROM_BID, status: AssignmentStatus.ACCEPTED, amount: 1200 }], deadline: '2024-08-15', budget: 1700, isPublic: true, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-07-10', activityLog: [] },
];

const TASKS_P3: Task[] = [
    { id: 't3-1', title: 'إعداد المادة العلمية للورشة', description: 'جمع وتلخيص المادة العلمية.', status: ProjectStatus.PENDING, assignments: [], deadline: '2024-09-20', budget: 800, isPublic: true, biddingStatus: 'OPEN', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-01', activityLog: [] },
    { id: 't3-2', title: 'تصميم العرض التقديمي', description: 'تصميم عرض تقديمي جذاب.', status: ProjectStatus.PENDING, assignments: [], deadline: '2024-09-25', budget: 1200, isPublic: true, biddingStatus: 'OPEN', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-01', activityLog: [] }
];

const TASKS_P4: Task[] = [
    { id: 't4-1', title: 'شرح أساسيات الكيمياء العضوية', description: 'كتابة محتوى تفصيلي ومبسط.', status: ProjectStatus.COMPLETED, assignments: [{ id: 'a4-1-1', educatorId: 'e2', type: AssignmentType.DIRECT, status: AssignmentStatus.ACCEPTED, amount: 2000 }], deadline: '2024-08-20', budget: 2000, isPublic: false, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-05', activityLog: [] },
    { id: 't4-2', title: 'تصميم تجارب معملية افتراضية', description: 'تصميم 5 تجارب تفاعلية.', status: ProjectStatus.IN_PROGRESS, assignments: [{ id: 'a4-2-1', educatorId: 'e3', type: AssignmentType.DIRECT, status: AssignmentStatus.ACCEPTED, amount: 3000 }], deadline: '2024-09-15', budget: 3000, isPublic: false, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-05', activityLog: [] },
    { id: 't4-3', title: 'إعداد بنك أسئلة', description: 'إعداد 100 سؤال متنوع.', status: ProjectStatus.PENDING, assignments: [], deadline: '2024-09-25', budget: 1500, isPublic: false, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-05', activityLog: [] },
];

const TASKS_P5: Task[] = [
    { id: 't5-1', title: 'بناء الواجهة الأمامية للموقع', description: 'باستخدام React و Tailwind CSS.', status: ProjectStatus.PENDING, assignments: [], deadline: '2024-10-10', budget: 4000, isPublic: true, biddingStatus: 'OPEN', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-15', activityLog: [] },
    { id: 't5-2', title: 'تطوير الواجهة الخلفية وقاعدة البيانات', description: 'باستخدام Node.js و PostgreSQL.', status: ProjectStatus.PENDING, assignments: [], deadline: '2024-10-20', budget: 5000, isPublic: true, biddingStatus: 'OPEN', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-15', activityLog: [] },
];

const TASKS_P6: Task[] = [
    { id: 't6-1', title: 'بحث وتوثيق فترة الخلفاء الراشدين', description: 'كتابة تقرير بحثي من 50 صفحة.', status: ProjectStatus.COMPLETED, assignments: [{ id: 'a6-1-1', educatorId: 'e7', type: AssignmentType.DIRECT, status: AssignmentStatus.ACCEPTED, amount: 3500 }], deadline: '2024-07-30', budget: 3500, isPublic: false, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-06-15', activityLog: [] },
    { id: 't6-2', title: 'مراجعة وتدقيق التقرير', description: 'مراجعة لغوية وتاريخية.', status: ProjectStatus.COMPLETED, assignments: [{ id: 'a6-2-1', educatorId: 'e4', type: AssignmentType.DIRECT, status: AssignmentStatus.ACCEPTED, amount: 1500 }], deadline: '2024-08-05', budget: 1500, isPublic: false, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-06-15', activityLog: [] },
];

const TASKS_P7: Task[] = [
    { id: 't7-1', title: 'تحليل قصيدة المتنبي', description: 'تحليل بلاغي ونقدي.', status: ProjectStatus.CANCELED, assignments: [], deadline: '2024-09-01', budget: 1000, isPublic: true, biddingStatus: 'CLOSED', subTasks: [], attachments: [], deliverables: [], notes: [], creationDate: '2024-08-10', activityLog: [] },
];

export const PROJECTS: Project[] = [
  { id: 'p1', title: 'تطوير منهج الرياضيات للمرحلة الإعدادية', description: 'مشروع متكامل لتطوير وتحديث منهج الرياضيات للصف الثاني الإعدادي.', status: ProjectStatus.IN_PROGRESS, budget: 6000, tags: ['رياضيات', 'مناهج', 'تطوير محتوى'], isPublished: true, tasks: TASKS_P1, creationType: ProjectCreationType.STANDALONE, createdBy: 'الإدارة', createdAt: '2024-07-20', deadline: null, educationalRequestId: null, activityLog: [] },
  { id: 'p2', title: 'إنشاء محتوى فيديو لمادة الفيزياء', description: 'مطلوب معلم متخصص لإنشاء سلسلة فيديوهات تعليمية عالية الجودة تشرح مفاهيم الفيزياء الحديثة.', status: ProjectStatus.IN_PROGRESS, budget: 3500, tags: ['فيزياء', 'فيديو تعليمي'], isPublished: true, tasks: TASKS_P2, creationType: ProjectCreationType.PUBLIC, createdBy: 'الإدارة', createdAt: '2024-07-20', deadline: null, educationalRequestId: null, activityLog: [] },
  { id: 'p3', title: 'ورشة عمل عن الشعر الجاهلي', description: 'تنظيم وإعداد محتوى لورشة عمل تفاعلية عن أبرز شعراء العصر الجاهلي وأعمالهم.', status: ProjectStatus.PENDING, budget: 2000, tags: ['لغة عربية', 'أدب', 'ورشة عمل'], isPublished: true, tasks: TASKS_P3, creationType: ProjectCreationType.PUBLIC, createdBy: 'الإدارة', createdAt: '2024-08-01', deadline: null, educationalRequestId: null, activityLog: [] },
  { id: 'p4', title: 'تطوير محتوى تفاعلي للكيمياء العضوية', description: 'مشروع لإنشاء محتوى تفاعلي شامل لمادة الكيمياء العضوية للمرحلة الجامعية.', status: ProjectStatus.IN_PROGRESS, budget: 6500, tags: ['كيمياء', 'محتوى تفاعلي', 'جامعي'], isPublished: false, tasks: TASKS_P4, creationType: ProjectCreationType.FROM_REQUEST, createdBy: 'خالد الفهد', createdAt: '2024-08-05', deadline: '2024-10-01', educationalRequestId: 'er3', activityLog: [] },
  { id: 'p5', title: 'بناء موقع تعليمي إلكتروني', description: 'مطلوب فريق لتطوير موقع تعليمي متكامل لعرض الدورات والمواد.', status: ProjectStatus.PENDING, budget: 9000, tags: ['برمجة', 'تطوير ويب', 'React'], isPublished: true, tasks: TASKS_P5, creationType: ProjectCreationType.PUBLIC, createdBy: 'الإدارة', createdAt: '2024-08-15', deadline: '2024-11-01', educationalRequestId: null, activityLog: [] },
  { id: 'p6', title: 'موسوعة تاريخية مبسطة', description: 'مشروع لإنشاء محتوى موسوعي عن فترة تاريخية محددة.', status: ProjectStatus.COMPLETED, budget: 5000, tags: ['تاريخ', '��وسوعة', 'كتابة محتوى'], isPublished: false, tasks: TASKS_P6, creationType: ProjectCreationType.STANDALONE, createdBy: 'الإدارة', createdAt: '2024-06-10', deadline: '2024-08-10', educationalRequestId: null, activityLog: [] },
  { id: 'p7', title: 'سلسلة مقالات أدبية', description: 'كتابة سلسلة مقالات نقدية حول الأدب العربي المعاصر.', status: ProjectStatus.CANCELED, budget: 1000, tags: ['أدب', 'مقالات'], isPublished: false, tasks: TASKS_P7, creationType: ProjectCreationType.PUBLIC, createdBy: 'الإدارة', createdAt: '2024-08-10', deadline: null, educationalRequestId: null, activityLog: [] },
];

export const BIDS: Bid[] = [
    { id: 'b1', projectId: 'p2', educatorId: 'e2', bidTasks: [{ taskId: 't2-1', status: BidStatus.ASSIGNED, amount: 1400, approvalMessage: 'عرض ممتاز، نتطلع للعمل معك.' }, { taskId: 't2-2', status: BidStatus.ASSIGNED, amount: 1200 }], deliveryDays: 45, proposal: 'لدي خبرة واسعة في إنتاج المحتوى التعليمي وأضمن تقديم فيديوهات بجودة عالية.', createdAt: '2024-07-22', attachments: [], links: [] },
    { id: 'b5', projectId: 'p3', educatorId: 'e2', bidTasks: [{ taskId: 't3-1', status: BidStatus.REJECTED, amount: 700, rejectionReason: 'العرض المقدم أعلى من الميزانية المتاحة.' }], deliveryDays: 10, proposal: 'خبرة في الأدب العربي ومستعد لتقديم مادة علمية غنية.', createdAt: '2024-08-02', attachments: [], links: [] },
    { id: 'b6', projectId: 'p1', educatorId: 'e2', bidTasks: [{ taskId: 't1-1', status: BidStatus.PENDING, amount: 1300 }], deliveryDays: 20, proposal: 'يمكنني إنجاز الفصل الأول بكفاءة عالية.', createdAt: '2024-08-05', attachments: [{id: 'att1', name: 'portfolio.pdf', url: '#', size: '2.3MB', type: 'PDF'}], links: [{id: 'link1', title: 'My Work', url: '#'}] },
    { id: 'b7', projectId: 'p5', educatorId: 'e3', bidTasks: [{ taskId: 't5-1', status: BidStatus.PENDING, amount: 3800 }, { taskId: 't5-2', status: BidStatus.PENDING, amount: 4800 }], deliveryDays: 60, proposal: 'فريقنا جاهز لتنفيذ المشروع بأعلى المعايير.', createdAt: '2024-08-16', attachments: [], links: [] },
    { id: 'b8', projectId: 'p5', educatorId: 'e2', bidTasks: [{ taskId: 't5-1', status: BidStatus.APPROVED, amount: 3900, approvalMessage: 'عرض جيد، نود مناقشة بعض التفاصيل.' }], deliveryDays: 55, proposal: 'لدي خبرة في تصميم الواجهات التعليمية.', createdAt: '2024-08-17', attachments: [], links: [] },
    { id: 'b9', projectId: 'p3', educatorId: 'e6', bidTasks: [{ taskId: 't3-2', status: BidStatus.PENDING, amount: 1100 }], deliveryDays: 8, proposal: 'يمكنني تصميم عرض تقديمي احترافي وجذاب.', createdAt: '2024-08-03', attachments: [], links: [] },
];

export const NOTIFICATIONS: AppNotification[] = [
    { id: 'n1', message: 'لديك دعوة جديدة للمشاركة في مهمة "إعداد الاختبار النصفي".', link: { view: 'tasks' }, isRead: false, timestamp: 'منذ ساعة', icon: 'task' },
    { id: 'n2', message: 'مشروع جديد في الفيزياء منشور الآن! قد يهمك.', link: { view: 'opportunities' }, isRead: false, timestamp: 'منذ 4 ساعات', icon: 'project' },
    { id: 'n3', message: 'تم استلام دفعة مالية بقيمة 1,200 ريال لمهمة مكتملة.', link: { view: 'earnings' }, isRead: true, timestamp: 'منذ يومين', icon: 'invoice' },
    { id: 'n4', message: 'تم قبول عرضك مبدئياً لمهمة "بناء الواجهة الأمامية".', link: { view: 'proposals' }, isRead: false, timestamp: 'منذ 30 دقيقة', icon: 'bid' },
];

export const WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
    { id: 'w1', amount: 5000, status: 'PROCESSED', requestedAt: '2024-07-15', processedAt: '2024-07-17' },
    { id: 'w2', amount: 2500, status: 'PENDING', requestedAt: '2024-08-01' },
    { id: 'w3', amount: 1200, status: 'PROCESSED', requestedAt: '2024-06-20', processedAt: '2024-06-22' },
];

export const TRANSACTIONS: Transaction[] = [
    { id: 'tr1', type: 'DEPOSIT', description: 'مهمة: تحليل البيانات وكتابة التقرير', amount: 1200, date: '2024-08-18' },
    { id: 'tr2', type: 'WITHDRAWAL', description: 'سحب إلى حساب بنكي', amount: -5000, date: '2024-07-17' },
    { id: 'tr3', type: 'DEPOSIT', description: 'مهمة: تصميم الاختبار النهائي', amount: 800, date: '2024-07-10' },
    { id: 'tr4', type: 'DEPOSIT', description: 'مهمة: الفصل الأول: مقدمة في الجبر', amount: 1450, date: '2024-08-12' },
    { id: 'tr5', type: 'WITHDRAWAL', description: 'سحب إلى حساب بنكي', amount: -1200, date: '2024-06-22' },
];

export const INBOX_MESSAGES: InboxMessage[] = [
    { id: 'm1', from: 'ADMIN', content: 'مرحباً فاطمة، نود إعلامك بتحديث سياسة الخصوصية لدينا. يرجى الاطلاع عليها.', timestamp: 'اليوم، 10:30 صباحاً', isRead: false },
    { id: 'm2', from: 'YOU', content: 'شكراً لكم، تم الاطلاع.', timestamp: 'أمس، 05:00 مساءً', isRead: true },
    { id: 'm3', from: 'ADMIN', content: 'تمت معالجة طلب السحب الخاص بك بنجاح.', timestamp: '2024-07-17', isRead: true },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
    { 
        id: 's1', 
        educatorId: 'e2',
        subject: 'مشكلة في رفع ملفات التسليم', 
        category: 'تقني',
        status: SupportTicketStatus.OPEN, 
        createdAt: '2024-08-15', 
        lastReply: 'منذ ساعة', 
        messages: [
            { 
                sender: 'educator', 
                senderName: 'فاطمة الزهراء', 
                senderAvatar: 'https://i.pravatar.cc/100?u=e2', 
                content: 'أواجه مشكلة في رفع ملف فيديو بحجم كبير، هل هناك حل؟ هذا هو الخطأ الذي يظهر لي.', 
                timestamp: 'منذ 3 ساعات',
                attachments: [
                    { id: 'att-s1-1', name: 'error-screenshot.png', url: 'https://via.placeholder.com/400x200.png?text=Error+Message', size: '128KB', type: 'Image' }
                ]
            },
            { 
                sender: 'admin', 
                senderName: ADMIN_USER.name, 
                senderAvatar: ADMIN_USER.avatarUrl, 
                content: 'أهلاً بك، فريق الدعم الفني يراجع المشكلة وسيعود إليك قريباً. هل يمكنك إرسال سجلات الخطأ؟', 
                timestamp: 'منذ ساعة' 
            },
        ]
    },
    { 
        id: 's2', 
        educatorId: 'e3',
        subject: 'استفسار عن طريقة حساب الأرباح', 
        category: 'مالي',
        status: SupportTicketStatus.CLOSED, 
        createdAt: '2024-07-20', 
        lastReply: '2024-07-21', 
        messages: [
            { sender: 'educator', senderName: 'علي حسن', senderAvatar: 'https://i.pravatar.cc/100?u=e3', content: 'السلام عليكم، كيف يتم حساب نسبة المنصة من الأرباح؟', timestamp: '2024-07-20' },
            { 
                sender: 'admin', 
                senderName: ADMIN_USER.name, 
                senderAvatar: ADMIN_USER.avatarUrl, 
                content: 'وعليكم السلام، نسبة المنصة هي 15% من قيمة كل مهمة مكتملة. شكراً لتواصلك.', 
                timestamp: '2024-07-21',
                attachments: [
                    { id: 'att-s2-1', name: 'policy.pdf', url: '#', size: '256KB', type: 'PDF' }
                ]
            },
        ]
    },
    { 
        id: 's3', 
        educatorId: 'e2',
        subject: 'تأخر في مراجعة عرض مقدم', 
        category: 'مشاريع',
        status: SupportTicketStatus.OPEN, 
        createdAt: '2024-08-18', 
        lastReply: 'اليوم', 
        messages: [
            { sender: 'educator', senderName: 'فاطمة الزهراء', senderAvatar: 'https://i.pravatar.cc/100?u=e2', content: 'لقد قدمت عرضاً منذ يومين لمشروع "ورشة عمل عن الشعر الجاهلي" ولم تتم مراجعته بعد.', timestamp: 'اليوم' }
        ] 
    },
];

export const USERS: User[] = [
  { id: 'u1', name: 'أحمد محمود', email: 'ahmed.m@example.com', phone: '+966501234567', city: 'الرياض', address: 'شارع الملك فهد', avatarUrl: 'https://i.pravatar.cc/100?u=u1', registrationDate: '2024-06-15', status: UserStatus.ACTIVE },
  { id: 'u2', name: 'سارة عبدالله', email: 'sara.a@example.com', phone: '+966555555555', city: 'جدة', address: 'حي الروضة', avatarUrl: 'https://i.pravatar.cc/100?u=u2', registrationDate: '2024-05-20', status: UserStatus.SUSPENDED },
  { id: 'u3', name: 'خالد الفهد', email: 'khaled.f@example.com', phone: '+966509876543', city: 'الدمام', address: 'حي الشاطئ', avatarUrl: 'https://i.pravatar.cc/100?u=u3', registrationDate: '2024-08-01', status: UserStatus.ACTIVE },
  { id: 'u4', name: 'ريم القحطاني', email: 'reem.q@example.com', phone: '+966561112233', city: 'مكة', address: 'العوالي', avatarUrl: 'https://i.pravatar.cc/100?u=u4', registrationDate: '2024-07-25', status: UserStatus.ACTIVE },
  { id: 'u5', name: 'عبدالله المطيري', email: 'abdullah.m@example.com', phone: '+966543210987', city: 'الرياض', address: 'حي النخيل', avatarUrl: 'https://i.pravatar.cc/100?u=u5', registrationDate: '2024-04-10', status: UserStatus.BANNED },
];

export const EDUCATIONAL_REQUESTS: EducationalRequest[] = [
    { id: 'er1', title: 'مساعدة في بحث تخرج عن الذكاء الاصطناعي', description: 'أحتاج مساعدة في...', subject: 'علوم الحاسب', educationLevel: 'جامعي', requesterId: 'u1', status: EducationalRequestStatus.ACCEPTED, paymentStatus: PaymentStatus.PAID, fulfillmentStatus: FulfillmentStatus.IN_PROGRESS, budget: 5000, pricingType: PricingType.FIXED, expectedDeliveryDate: '2024-09-30', attachments: [], finalAgreement: '', activityLog: [], createdAt: '2024-07-10' },
    { id: 'er2', title: 'دروس تقوية في الفيزياء للمرحلة الثانوية', description: 'ابني يحتاج دروس تقوية...', subject: 'الفيزياء', educationLevel: 'ثانوي', requesterId: 'u2', status: EducationalRequestStatus.PENDING, paymentStatus: PaymentStatus.UNPAID, fulfillmentStatus: FulfillmentStatus.PENDING, budget: null, pricingType: PricingType.HOURLY, expectedDeliveryDate: null, attachments: [], finalAgreement: '', activityLog: [], createdAt: '2024-08-01' },
    { id: 'er3', title: 'مادة علمية عن الكيمياء العضوية', description: 'أحتاج محتوى تفاعلي لمادة الكيمياء العضوية لطلاب السنة الأولى.', subject: 'الكيمياء', educationLevel: 'جامعي', requesterId: 'u3', status: EducationalRequestStatus.ACCEPTED, paymentStatus: PaymentStatus.PAID, fulfillmentStatus: FulfillmentStatus.PENDING, budget: 6500, pricingType: PricingType.FIXED, expectedDeliveryDate: '2024-10-01', attachments: [], finalAgreement: '', activityLog: [], createdAt: '2024-08-04' },
    { id: 'er4', title: 'تطوير موقع تعليمي بسيط', description: 'مطلوب تطوير موقع بسيط لعرض بعض الدروس.', subject: 'برمجة', educationLevel: 'عام', requesterId: 'u4', status: EducationalRequestStatus.PENDING, paymentStatus: PaymentStatus.UNPAID, fulfillmentStatus: FulfillmentStatus.PENDING, budget: 9000, pricingType: PricingType.FIXED, expectedDeliveryDate: '2024-11-01', attachments: [], finalAgreement: '', activityLog: [], createdAt: '2024-08-14' },
    { id: 'er5', title: 'بحث تاريخي عن الدولة الأموية', description: 'أحتاج مساعدة في جمع مصادر.', subject: 'التاريخ', educationLevel: 'دراسات عليا', requesterId: 'u5', status: EducationalRequestStatus.REJECTED, paymentStatus: PaymentStatus.UNPAID, fulfillmentStatus: FulfillmentStatus.PENDING, budget: 2000, pricingType: PricingType.FIXED, expectedDeliveryDate: null, attachments: [], finalAgreement: '', activityLog: [], createdAt: '2024-08-10' },
];

export const EDUCATOR_APPLICATIONS: EducatorApplication[] = [
    {
        id: 'ea1', educatorId: 'e4', status: EducatorStatus.PENDING_REVIEW, applicationDate: '2024-08-15',
        personalId: { id: 'doc-e4-1', fileName: 'noura_id.pdf', fileUrl: '#', status: VerificationStatus.PENDING },
        certifications: [ { id: 'cert-e4-1', title: 'ماجستير أدب عربي', issuingAuthority: 'جامعة الإمارات', issueDate: '2018-06-01', status: VerificationStatus.PENDING, document: { id: 'doc-e4-2', fileName: 'master_degree.pdf', fileUrl: '#', status: VerificationStatus.PENDING } } ],
        experiences: []
    },
    {
        id: 'ea2', educatorId: 'e5', status: EducatorStatus.REJECTED, applicationDate: '2024-08-12', rejectionReason: 'المستندات المقدمة غير واضحة والجودة غير كافية.',
        personalId: { id: 'doc-e5-1', fileName: 'youssef_id.jpg', fileUrl: '#', status: VerificationStatus.REJECTED, rejectionReason: 'الصورة غير واضحة.' },
        certifications: [ { id: 'cert-e5-1', title: 'بكالوريوس كيمياء', issuingAuthority: 'جامعة الإسكندرية', issueDate: '2010-07-01', status: VerificationStatus.REJECTED, rejectionReason: 'المستند غير واضح.', document: { id: 'doc-e5-2', fileName: 'bachelor.pdf', fileUrl: '#', status: VerificationStatus.REJECTED, rejectionReason: 'المستند غير واضح.' } } ],
        experiences: []
    }
];

export const INVOICES: Invoice[] = [
    { id: 'inv1', invoiceNumber: '2024-001', requesterId: 'u1', projectId: 'p1', issueDate: '2024-07-25', dueDate: '2024-08-10', totalAmount: 6000, status: InvoiceStatus.PAID },
    { id: 'inv2', invoiceNumber: '2024-002', requesterId: 'u2', projectId: 'p2', issueDate: '2024-08-01', dueDate: '2024-08-15', totalAmount: 3500, status: InvoiceStatus.ISSUED },
    { id: 'inv3', invoiceNumber: '2024-003', requesterId: 'u3', projectId: 'p4', issueDate: '2024-08-06', dueDate: '2024-08-20', totalAmount: 6500, status: InvoiceStatus.OVERDUE },
    { id: 'inv4', invoiceNumber: '2024-004', requesterId: 'u1', projectId: 'p6', issueDate: '2024-08-11', dueDate: '2024-08-25', totalAmount: 5000, status: InvoiceStatus.PAID },
    { id: 'inv5', invoiceNumber: '2024-005', requesterId: 'u4', projectId: 'p5', issueDate: '2024-08-16', dueDate: '2024-08-30', totalAmount: 9000, status: InvoiceStatus.DRAFT },
    { id: 'inv6', invoiceNumber: '2024-006', requesterId: 'u2', projectId: 'p7', issueDate: '2024-08-12', dueDate: '2024-08-26', totalAmount: 1000, status: InvoiceStatus.CANCELED },
];

export const ADMIN_MESSAGES_FOR_EDUCATOR: AdminMessage[] = [
    { id: 'msg1', type: 'urgent', title: 'تحديث عاجل لسياسة المنصة', content: 'يرجى مراجعة سياسة الخصوصية الجديدة والموافقة عليها لمتابعة العمل.', timestamp: 'منذ ساعتين', isRead: false },
    { id: 'msg2', type: 'info', title: 'صيانة مجدولة للمنصة', content: 'سيتم إجراء صيانة للمنصة يوم الجمعة القادم من الساعة 2 صباحاً حتى 4 صباحاً.', timestamp: 'منذ يوم', isRead: false },
    { id: 'msg3', type: 'warning', title: 'تذكير: تحديث بيانات الدفع', content: 'لضمان استلام أرباحك في الوقت المحدد، يرجى التأكد من تحديث بيانات الدفع الخاصة بك.', timestamp: 'منذ 3 أيام', isRead: true },
];

export const ADMIN_ACTIVITY_FEED: AdminActivity[] = [
    { id: 'act1', icon: 'application', messageKey: 'activityFeed.newApplication', actorName: 'نورة خالد', actorAvatar: 'https://i.pravatar.cc/100?u=e4', timestamp: 'منذ 5 دقائق', link: { view: 'educatorApplications', id: 'ea1' } },
    { id: 'act2', icon: 'invoice', messageKey: 'activityFeed.paidInvoice', messagePayload: { invoiceNumber: '2024-001' }, actorName: 'أحمد محمود', actorAvatar: 'https://i.pravatar.cc/100?u=u1', timestamp: 'منذ ساعة', link: { view: 'finance', id: 'inv1' } },
    { id: 'act3', icon: 'project', messageKey: 'activityFeed.newTask', messagePayload: { projectName: 'منهج الرياضيات' }, actorName: 'المدير العام', actorAvatar: 'https://i.pravatar.cc/100?u=admin1', timestamp: 'منذ 3 ساعات', link: { view: 'projectDetail', id: 'p1' } },
    { id: 'act4', icon: 'request', messageKey: 'activityFeed.newRequest', actorName: 'ريم القحطاني', actorAvatar: 'https://i.pravatar.cc/100?u=u4', timestamp: 'منذ 8 ساعات', link: { view: 'requestDetail', id: 'er4' } },
    { id: 'act5', icon: 'user', messageKey: 'activityFeed.profileUpdate', actorName: 'علي حسن', actorAvatar: 'https://i.pravatar.cc/100?u=e3', timestamp: 'منذ 12 ساعة', link: { view: 'educators', id: 'e3' } },
    { id: 'act6', icon: 'invoice', messageKey: 'activityFeed.newInvoice', messagePayload: { invoiceNumber: '2024-003' }, actorName: 'المدير العام', actorAvatar: 'https://i.pravatar.cc/100?u=admin1', timestamp: 'أمس', link: { view: 'finance', id: 'inv3' } },
    { id: 'act7', icon: 'project', messageKey: 'activityFeed.projectStatusChange', messagePayload: { projectName: 'موسوعة تاريخية', status: 'مكتمل' }, actorName: 'المدير العام', actorAvatar: 'https://i.pravatar.cc/100?u=admin1', timestamp: 'أمس', link: { view: 'projectDetail', id: 'p6' } },
    { id: 'act8', icon: 'application', messageKey: 'activityFeed.rejectedApplication', actorName: 'المدير العام', actorAvatar: 'https://i.pravatar.cc/100?u=admin1', timestamp: 'منذ يومين', link: { view: 'rejectedEducators', id: 'ea2' } }
];
