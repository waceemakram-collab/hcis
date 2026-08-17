import type { Dictionary } from "./en";

// Arabic dictionary. Typed as `Dictionary`, so a key added to en.ts and missed
// here is a compile error. (CLAUDE.md rule 4.)

export const ar: Dictionary = {
  common: {
    appName: "نظام معلومات رأس المال البشري — إكسبيرتيز ويف",
    save: "حفظ",
    saving: "جارٍ الحفظ…",
    cancel: "إلغاء",
    create: "إنشاء",
    edit: "تعديل",
    view: "عرض",
    back: "رجوع",
    actions: "إجراءات",
    noResults: "لا توجد بيانات بعد.",
    required: "مطلوب",
    optional: "اختياري",
    reason: "سبب هذا التغيير",
    reasonPlaceholder: "لماذا يتم تسجيل هذا؟ (يُحفظ في سجل التدقيق)",
    none: "—",
    language: "اللغة",
    english: "English",
    arabic: "العربية",
  },

  auth: {
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    signOut: "تسجيل الخروج",
    loginTitle: "تسجيل الدخول",
    loginSubtitle: "نظام معلومات رأس المال البشري — للموظفين فقط.",
    signUpTitle: "إنشاء حساب",
    signUpSubtitle: "حسابات داخلية فقط.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    repeatPassword: "تأكيد كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    signingIn: "جارٍ تسجيل الدخول…",
    creatingAccount: "جارٍ إنشاء الحساب…",
    needAccount: "ليس لديك حساب؟",
    haveAccount: "لديك حساب بالفعل؟",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    passwordTooShort: "يجب ألا تقل كلمة المرور عن ٨ أحرف.",
  },

  nav: {
    dashboard: "الرئيسية",
    departments: "الإدارات",
    jobTitles: "المسميات الوظيفية",
    employees: "الموظفون",
    documents: "الوثائق",
  },

  documents: {
    title: "انتهاء صلاحية الوثائق",
    subtitle:
      "جوازات السفر والإقامات وبطاقات العمل، مرتبة من الأقرب انتهاءً.",
    dashboardCard: "متابعة الجوازات والإقامات وبطاقات العمل قبل انتهائها.",

    add: "إضافة وثيقة",
    editTitle: "تعديل الوثيقة",
    addTitle: "إضافة وثيقة",

    type: "نوع الوثيقة",
    description: "الوصف",
    descriptionHelp: "يُستخدم عند اختيار النوع «أخرى».",
    number: "رقم الوثيقة",
    issuingCountry: "بلد الإصدار",
    issuingCountryHelp: "يخص جوازات السفر بشكل أساسي.",
    issueDate: "تاريخ الإصدار",
    expiryDate: "تاريخ الانتهاء",
    expiryDateHelp: "مطلوب — لا يمكن متابعة وثيقة بدون تاريخ انتهاء.",
    employee: "الموظف",

    empty: "لا توجد وثائق مسجَّلة بعد.",
    emptyForPerson: "لا توجد وثائق مسجَّلة لهذا الشخص.",
    emptyFiltered: "لا توجد نتائج مطابقة لهذا التصفية.",

    sectionTitle: "الوثائق",
    sectionHelp:
      "الوثائق تخص الشخص وليس فترة التوظيف — تبقى بعد ترك العمل وعند إعادة التعيين.",

    windowAll: "الكل",
    window30: "خلال ٣٠ يومًا",
    window60: "خلال ٦٠ يومًا",
    window90: "خلال ٩٠ يومًا",
    windowExpired: "منتهية",

    includeFormer: "تضمين الموظفين السابقين",
    formerEmployee: "موظف سابق",

    expires: "تنتهي",
    expired: "منتهية",
    noExpiryTracked: "—",
  },

  documentType: {
    passport: "جواز السفر",
    residency_permit: "الإقامة",
    labour_card: "بطاقة العمل",
    other: "أخرى",
  },

  documentStatus: {
    expired: "منتهية",
    critical: "توشك على الانتهاء",
    upcoming: "قادمة",
    ok: "سارية",
  },

  dashboard: {
    title: "نظام معلومات رأس المال البشري",
    subtitle: "نظام داخلي لإدارة معلومات الموارد البشرية.",
    departmentsCard: "الوحدات التنظيمية، ثنائية اللغة، قابلة للتفريع.",
    jobTitlesCard: "المسميات التي يُعيَّن عليها الموظفون.",
    employeesCard: "الأشخاص، وعلاقات التوظيف، ومواقعهم التنظيمية.",
  },

  departments: {
    title: "الإدارات",
    subtitle: "الوحدات التنظيمية. يمكن أن تندرج الإدارة تحت إدارة أعلى.",
    newTitle: "إدارة جديدة",
    nameEn: "الاسم (بالإنجليزية)",
    nameAr: "الاسم (بالعربية)",
    parent: "الإدارة الأعلى",
    noParent: "بدون إدارة أعلى (المستوى الأول)",
    created: "تم إنشاء الإدارة.",
    empty: "لا توجد إدارات بعد. أنشئ أول إدارة للبدء.",
    columnName: "الاسم",
    columnParent: "الإدارة الأعلى",
  },

  jobTitles: {
    title: "المسميات الوظيفية",
    subtitle: "المسميات التي يُعيَّن عليها الموظفون.",
    newTitle: "مسمى وظيفي جديد",
    nameEn: "المسمى (بالإنجليزية)",
    nameAr: "المسمى (بالعربية)",
    created: "تم إنشاء المسمى الوظيفي.",
    empty: "لا توجد مسميات وظيفية بعد. أنشئ أول مسمى للبدء.",
    columnName: "المسمى",
  },

  employees: {
    title: "الموظفون",
    subtitle: "الأشخاص العاملون حاليًا أو سابقًا في إكسبيرتيز ويف.",
    newTitle: "موظف جديد",
    newSubtitle: "يُنشئ سجل الشخص، وفترة التوظيف، وأول تعيين تنظيمي له.",
    created: "تم إنشاء الموظف.",
    empty: "لا يوجد موظفون بعد. أضف أول موظف للبدء.",

    sectionPerson: "بيانات الشخص",
    sectionPersonHelp:
      "معلومات عن الشخص نفسه. تبقى صحيحة بعد انتهاء التوظيف.",
    sectionEmployment: "فترة التوظيف",
    sectionEmploymentHelp:
      "فترة العمل في الشركة. قد يكون للشخص أكثر من فترة توظيف عبر الزمن.",
    sectionAssignment: "التعيين التنظيمي",
    sectionAssignmentHelp:
      "الموقع التنظيمي والمدير المباشر. هذا السجل مؤرَّخ السريان — أي تغيير لاحق يُنشئ سجلًا جديدًا بدلًا من استبدال هذا السجل.",

    firstNameEn: "الاسم الأول (بالإنجليزية)",
    lastNameEn: "اسم العائلة (بالإنجليزية)",
    firstNameAr: "الاسم الأول (بالعربية)",
    lastNameAr: "اسم العائلة (بالعربية)",
    email: "البريد الإلكتروني",
    phone: "رقم الجوال",
    nationality: "الجنسية",
    nationalId: "رقم الهوية / الإقامة",
    dateOfBirth: "تاريخ الميلاد",

    hireDate: "تاريخ التعيين",
    employmentType: "نوع التوظيف",
    status: "الحالة",

    department: "الإدارة",
    jobTitle: "المسمى الوظيفي",
    manager: "المدير المباشر",
    noManager: "بدون مدير مباشر",
    effectiveFrom: "ساري اعتبارًا من",

    columnName: "الاسم",
    columnJobTitle: "المسمى الوظيفي",
    columnDepartment: "الإدارة",
    columnStatus: "الحالة",
    columnHireDate: "تاريخ التعيين",
    showFormer: "عرض الموظفين السابقين",

    detailsTitle: "سجل الموظف",
    currentAssignment: "التعيين الحالي",
    noCurrentAssignment: "لا يوجد تعيين حالي مسجَّل.",
    noEmployment: "لا توجد فترة توظيف مسجَّلة — هذا الشخص ليس موظفًا حاليًا.",
    employmentDetails: "التوظيف",
    personDetails: "البيانات الشخصية",
    terminationDate: "آخر يوم عمل",
    notFound: "سجل الموظف غير موجود.",
  },

  termination: {
    sectionTitle: "انتهاء الخدمة",
    terminate: "إنهاء الخدمة",
    title: "إنهاء الخدمة",
    help: "يسجّل آخر يوم عمل ويُغلق التعيين الحالي في ذلك التاريخ. لا يُحذف شيء — تبقى فترة التوظيف ضمن السجل.",

    lastWorkingDay: "آخر يوم عمل",
    lastWorkingDayHelp: "شامل — آخر يوم في الخدمة.",
    reason: "سبب انتهاء الخدمة",
    notes: "ملاحظات",
    notesHelp: "أي تفاصيل تستحق التوثيق حول انتهاء الخدمة.",
    confirm: "إنهاء الخدمة",

    endedOn: "انتهت الخدمة في",
    reasonLabel: "السبب",
    notesLabel: "ملاحظات",

    undo: "التراجع عن إنهاء الخدمة",
    undoTitle: "إعادة فتح فترة التوظيف",
    undoHelp:
      "لحالات الإدخال الخاطئ. يمسح تاريخ الانتهاء والسبب، ويعيد فتح التعيين الذي أُغلق.",
    undoConfirm: "إعادة فتح فترة التوظيف",

    rehire: "إضافة فترة توظيف",
    rehireTitle: "إضافة فترة توظيف جديدة",
    rehireHelp:
      "فترة توظيف ثانية للشخص نفسه. تبقى فترة التوظيف السابقة والوثائق والسجل مرتبطة به — دون إنشاء سجل مكرر.",
    previousEnded: "انتهت فترة التوظيف السابقة في",
  },

  terminationReason: {
    resignation: "استقالة",
    end_of_contract: "انتهاء العقد",
    dismissal: "فصل",
    death: "وفاة",
    other: "أخرى",
  },

  edit: {
    title: "تعديل بيانات الموظف",

    personSection: "البيانات الشخصية",
    personHelp:
      "معلومات عن الشخص نفسه. تُحدَّث مباشرة ولا تخضع للتأريخ الفعّال. يحتفظ سجل التدقيق بالقيمة قبل التعديل وبعده.",
    savePerson: "حفظ البيانات الشخصية",

    assignmentSection: "الإدارة والمسمى الوظيفي والمدير",
    assignmentHelp:
      "الموقع التنظيمي للموظف. هذا السجل مؤرَّخ السريان، لذا تختلف النتيجة حسب طريقة الحفظ.",
    saveAssignment: "حفظ التعيين",

    modeLabel: "ما نوع هذا التحديث؟",
    modeChange: "تغيير فعلي",
    modeChangeHelp:
      "انتقل الموظف أو تمت ترقيته أو تغيّر مديره. يُغلق السجل الحالي في تاريخ السريان ويُفتح سجل جديد، ويبقى السجل السابق في السجل الزمني.",
    modeCorrection: "تصحيح خطأ",
    modeCorrectionHelp:
      "السجل الحالي أُدخل بشكل خاطئ ولم يعبّر عن الواقع. يُصحَّح السجل مباشرة دون إضافة سجل جديد، مع تسجيل التغيير في سجل التدقيق.",

    effectiveFrom: "ساري اعتبارًا من",
    effectiveFromHelp:
      "تاريخ بدء التعيين الجديد. يجب أن يكون بعد تاريخ بدء التعيين الحالي.",
    currentSince: "بدأ التعيين الحالي في",
    currentValues: "الوضع الحالي",
  },

  history: {
    title: "سجل التعيينات",
    subtitle:
      "يُحفَظ كل تعيين. أي تغيير يضيف سجلًا جديدًا ولا يستبدل السجل السابق.",
    empty: "لا يوجد سجل تعيينات.",

    current: "الحالي",
    initial: "التعيين الأول",
    changed: "تغيّر",
    changedDepartment: "الإدارة",
    changedJobTitle: "المسمى الوظيفي",
    changedManager: "المدير المباشر",

    from: "من",
    to: "إلى",
    ongoing: "مستمر",

    asOfTitle: "التعيين في تاريخ محدد",
    asOfLabel: "عرض التعيين الساري بتاريخ",
    asOfHelp:
      "يجيب عن سؤال: ما الذي كان ساريًا في هذا التاريخ؟ — وهو ما يسأل عنه التدقيق أو احتساب الفروقات أو تصفية نهاية الخدمة.",
    asOfClear: "مسح",
    asOfNone: "لا يوجد تعيين ساري في هذا التاريخ.",
    asOfBeforeHire: "التاريخ المحدد يسبق تاريخ التعيين.",
    asOfInForce: "الساري في التاريخ المحدد",
  },

  employmentType: {
    full_time: "دوام كامل",
    part_time: "دوام جزئي",
    contractor: "متعاقد",
  },

  status: {
    active: "على رأس العمل",
    on_leave: "في إجازة",
    terminated: "منتهي الخدمة",
  },

  errors: {
    generic: "حدث خطأ. لم يتم حفظ أي بيانات.",
    required: "هذا الحقل مطلوب.",
    invalidDate: "التاريخ غير صالح.",
    duplicateNationalId: "يوجد شخص آخر مسجَّل بنفس رقم الهوية.",
    overlappingAssignment:
      "هذا التعيين يتداخل مع تعيين قائم لفترة التوظيف نفسها.",
    personCreatedButNot:
      "تم حفظ سجل الشخص، لكن تعذّر حفظ بيانات التوظيف. راجع البيانات وحاول مرة أخرى — الشخص مسجَّل بالفعل، وإعادة إدخاله ستُنشئ سجلًا مكررًا.",
    noCurrentAssignment: "لا يوجد تعيين حالي مفتوح لهذا الموظف لتعديله.",
    effectiveDateTooEarly:
      "يجب أن يكون تاريخ السريان بعد تاريخ بدء التعيين الحالي. لا يُسمح بالتأريخ الرجعي فوق سجلات مغلقة.",
    nothingChanged:
      "لم يتغيّر شيء، ولم يُنشأ أي سجل. اختر إدارة أو مسمى وظيفي أو مديرًا مختلفًا.",
    assignmentLeftClosed:
      "تم إغلاق التعيين السابق، وتعذّر إنشاء التعيين الجديد، كما فشلت إعادة فتح السجل السابق. هذا الموظف الآن بدون تعيين ساري — عالج هذه المشكلة قبل أي إجراء آخر.",

    alreadyTerminated: "انتهت خدمة هذا الموظف بالفعل.",
    notTerminated: "فترة التوظيف ما زالت سارية — لا يوجد ما يمكن التراجع عنه.",
    terminationBeforeHire:
      "لا يمكن أن يسبق آخر يوم عمل تاريخ التعيين.",
    terminationBeforeAssignmentStart:
      "لا يمكن أن يسبق آخر يوم عمل تاريخ بدء التعيين الحالي. عدّل التعيين أولًا أو اختر تاريخًا لاحقًا.",
    terminationLeftInconsistent:
      "تم إنهاء الخدمة لكن تعذّر إغلاق التعيين، كما فشل التراجع عن الإنهاء. السجل غير متسق — عالج هذه المشكلة قبل أي إجراء آخر.",
    cannotReopenAssignment:
      "التعيين الذي أُغلق بهذا الإنهاء تم تعديله لاحقًا، ولا يمكن إعادة فتحه بأمان. رُفض التراجع بدلًا من التخمين.",
    hasOpenEmployment:
      "لدى هذا الشخص فترة توظيف سارية بالفعل. أنهِ الفترة الحالية قبل إضافة فترة جديدة.",
    personRehiredSince:
      "أُعيد تعيين هذا الشخص بعد انتهاء فترة التوظيف هذه. أنهِ فترة التوظيف الأحدث أولًا — لا يمكن أن تكون لدى الشخص فترتا توظيف ساريتان في الوقت نفسه.",
    rehireBeforeTermination:
      "يجب أن يكون تاريخ التعيين الجديد بعد انتهاء فترة التوظيف السابقة.",
    employmentCreatedWithoutAssignment:
      "تم إنشاء فترة التوظيف لكن لم يُنشأ التعيين الأول. افتح السجل وحدّد الإدارة والمسمى الوظيفي قبل الاعتماد عليه.",
  },
};
