// English dictionary. This file is the source of truth for the shape of every
// dictionary — `ar.ts` is typed as `Dictionary`, so adding a key here without
// adding it to Arabic is a build error. (CLAUDE.md rule 4.)

export const en = {
  common: {
    appName: "Expertise Wave HCIS",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    create: "Create",
    edit: "Edit",
    view: "View",
    back: "Back",
    actions: "Actions",
    noResults: "Nothing here yet.",
    required: "Required",
    optional: "optional",
    reason: "Reason for this change",
    reasonPlaceholder: "Why is this being recorded? (kept in the audit log)",
    none: "—",
    language: "Language",
    english: "English",
    arabic: "العربية",
  },

  auth: {
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    loginTitle: "Sign in",
    loginSubtitle: "Expertise Wave HCIS — staff accounts only.",
    signUpTitle: "Create an account",
    signUpSubtitle: "Internal accounts only.",
    email: "Email",
    password: "Password",
    repeatPassword: "Repeat password",
    forgotPassword: "Forgot your password?",
    signingIn: "Signing in…",
    creatingAccount: "Creating account…",
    needAccount: "Need an account?",
    haveAccount: "Already have an account?",
    passwordsDoNotMatch: "The two passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
  },

  nav: {
    dashboard: "Dashboard",
    departments: "Departments",
    jobTitles: "Job titles",
    employees: "Employees",
    documents: "Documents",
  },

  documents: {
    title: "Document expiry",
    subtitle:
      "Passports, residency permits and labour cards, soonest to expire first.",
    dashboardCard: "Track passports, Iqamas and labour cards before they lapse.",

    add: "Add document",
    editTitle: "Edit document",
    addTitle: "Add a document",

    type: "Document type",
    description: "Description",
    descriptionHelp: "Used when the type is “Other”.",
    number: "Document number",
    issuingCountry: "Issuing country",
    issuingCountryHelp: "Mainly relevant for passports.",
    issueDate: "Issue date",
    expiryDate: "Expiry date",
    expiryDateHelp: "Required — a document with no expiry cannot be tracked.",
    employee: "Employee",

    empty: "No documents on file yet.",
    emptyForPerson: "No documents recorded for this person.",
    emptyFiltered: "Nothing matches this filter.",

    sectionTitle: "Documents",
    sectionHelp:
      "Belong to the person, not the employment — they survive leaving and being rehired.",

    windowAll: "All",
    window30: "Next 30 days",
    window60: "Next 60 days",
    window90: "Next 90 days",
    windowExpired: "Expired",

    includeFormer: "Include former employees",
    formerEmployee: "Former employee",

    expires: "Expires",
    expired: "Expired",
    noExpiryTracked: "—",
  },

  documentType: {
    passport: "Passport",
    residency_permit: "Residency permit (Iqama)",
    labour_card: "Labour card",
    other: "Other",
  },

  documentStatus: {
    expired: "Expired",
    critical: "Expiring soon",
    upcoming: "Upcoming",
    ok: "Valid",
  },

  dashboard: {
    title: "HCIS",
    subtitle: "Internal human capital information system.",
    departmentsCard: "Org units, bilingual, nestable.",
    jobTitlesCard: "The roles people are assigned to.",
    employeesCard: "People, their employment, and where they sit.",
  },

  departments: {
    title: "Departments",
    subtitle: "Org units. A department may sit under a parent department.",
    newTitle: "New department",
    nameEn: "Name (English)",
    nameAr: "Name (Arabic)",
    parent: "Parent department",
    noParent: "No parent (top level)",
    created: "Department created.",
    empty: "No departments yet. Create the first one to get started.",
    columnName: "Name",
    columnParent: "Parent",
  },

  jobTitles: {
    title: "Job titles",
    subtitle: "The roles employees are assigned to.",
    newTitle: "New job title",
    nameEn: "Title (English)",
    nameAr: "Title (Arabic)",
    created: "Job title created.",
    empty: "No job titles yet. Create the first one to get started.",
    columnName: "Title",
  },

  employees: {
    title: "Employees",
    subtitle: "People currently or previously employed by Expertise Wave.",
    newTitle: "New employee",
    newSubtitle:
      "Creates a person record, an employment period, and their first assignment.",
    created: "Employee created.",
    empty: "No employees yet. Add the first one to get started.",

    sectionPerson: "The person",
    sectionPersonHelp:
      "Facts about the human being. These survive employment — they stay true after someone leaves.",
    sectionEmployment: "The employment",
    sectionEmploymentHelp:
      "A period of being employed. A person can have several of these over time.",
    sectionAssignment: "The assignment",
    sectionAssignmentHelp:
      "Where they sit and who they report to. This is effective-dated — changing it later creates a new record rather than overwriting this one.",

    firstNameEn: "First name (English)",
    lastNameEn: "Last name (English)",
    firstNameAr: "First name (Arabic)",
    lastNameAr: "Last name (Arabic)",
    email: "Email",
    phone: "Phone",
    nationality: "Nationality",
    nationalId: "National ID / Iqama",
    dateOfBirth: "Date of birth",

    hireDate: "Hire date",
    employmentType: "Employment type",
    status: "Status",

    department: "Department",
    jobTitle: "Job title",
    manager: "Manager",
    noManager: "No manager",
    effectiveFrom: "Effective from",

    columnName: "Name",
    columnJobTitle: "Job title",
    columnDepartment: "Department",
    columnStatus: "Status",
    columnHireDate: "Hired",
    showFormer: "Show former employees",

    detailsTitle: "Employee record",
    currentAssignment: "Current assignment",
    noCurrentAssignment: "No current assignment on record.",
    noEmployment: "No employment on record — this person is not currently an employee.",
    employmentDetails: "Employment",
    personDetails: "Personal details",
    terminationDate: "Last working day",
    notFound: "That employee record does not exist.",
  },

  termination: {
    sectionTitle: "End of employment",
    terminate: "End employment",
    title: "End employment",
    help: "Records the last working day and closes their current assignment on that date. Nothing is deleted — the employment stays as history.",

    lastWorkingDay: "Last working day",
    lastWorkingDayHelp: "Inclusive — the final day they are employed.",
    reason: "Reason for leaving",
    notes: "Notes",
    notesHelp: "Anything worth recording about the departure.",
    confirm: "End employment",

    endedOn: "Employment ended",
    reasonLabel: "Reason",
    notesLabel: "Notes",

    undo: "Undo termination",
    undoTitle: "Reopen this employment",
    undoHelp:
      "For a termination entered by mistake. Clears the end date and reason, and reopens the assignment that was closed.",
    undoConfirm: "Reopen employment",

    rehire: "Add employment",
    rehireTitle: "Add a new employment",
    rehireHelp:
      "A second period of employment for the same person. Their previous employment, documents and history all stay attached — no duplicate record is created.",
    previousEnded: "Previous employment ended",
  },

  terminationReason: {
    resignation: "Resignation",
    end_of_contract: "End of contract",
    dismissal: "Dismissal",
    death: "Death",
    other: "Other",
  },

  edit: {
    title: "Edit employee",

    personSection: "Personal details",
    personHelp:
      "Facts about the person. Updated in place — these are not effective-dated. The audit log keeps the before and after.",
    savePerson: "Save personal details",

    assignmentSection: "Department, job title and manager",
    assignmentHelp:
      "Where they sit in the org. This is effective-dated, so how you save it matters.",
    saveAssignment: "Save assignment",

    modeLabel: "What kind of update is this?",
    modeChange: "A real change",
    modeChangeHelp:
      "They moved, were promoted, or changed manager. Closes the current record on the effective date and opens a new one. The old record stays in the timeline.",
    modeCorrection: "A correction",
    modeCorrectionHelp:
      "The current record was entered wrong and never reflected reality. Fixes it in place — no new timeline entry, but the audit log records what changed.",

    effectiveFrom: "Effective from",
    effectiveFromHelp:
      "The day the new assignment starts. Must be after the current one began.",
    currentSince: "Current assignment began",
    currentValues: "Currently",
  },

  history: {
    title: "Assignment history",
    subtitle:
      "Every placement is kept. A change adds a record — it never overwrites one.",
    empty: "No assignment history on record.",

    current: "Current",
    initial: "Initial assignment",
    changed: "Changed",
    changedDepartment: "Department",
    changedJobTitle: "Job title",
    changedManager: "Manager",

    from: "From",
    to: "To",
    ongoing: "Ongoing",

    asOfTitle: "Role on a given date",
    asOfLabel: "Show the assignment in force on",
    asOfHelp:
      "Answers “what was true on this date?” — the question an audit, a back-pay calculation, or an end-of-service settlement asks.",
    asOfClear: "Clear",
    asOfNone: "No assignment was in force on that date.",
    asOfBeforeHire: "That date is before the hire date.",
    asOfInForce: "In force on the selected date",
  },

  employmentType: {
    full_time: "Full time",
    part_time: "Part time",
    contractor: "Contractor",
  },

  status: {
    active: "Active",
    on_leave: "On leave",
    terminated: "Terminated",
  },

  errors: {
    generic: "Something went wrong. Nothing was saved.",
    required: "This field is required.",
    invalidDate: "That is not a valid date.",
    duplicateNationalId: "Another person already has that national ID.",
    overlappingAssignment:
      "That assignment overlaps one that already exists for this employment.",
    personCreatedButNot:
      "The person record was saved, but their employment details could not be. Check the data and try again — the person already exists, so re-entering them will create a duplicate.",
    noCurrentAssignment:
      "This employee has no open assignment to change.",
    effectiveDateTooEarly:
      "The effective date must be after the day the current assignment began. Backdating over history that is already closed is not allowed.",
    nothingChanged:
      "Nothing changed, so no record was created. Pick a different department, job title or manager.",
    assignmentLeftClosed:
      "The previous assignment was closed, the replacement could not be created, and reopening the old one also failed. This employee now has NO active assignment — fix this before doing anything else.",

    alreadyTerminated: "This employment has already ended.",
    notTerminated: "This employment is still active — there is nothing to undo.",
    terminationBeforeHire:
      "The last working day cannot be before the hire date.",
    terminationBeforeAssignmentStart:
      "The last working day cannot be before the current assignment began. Change the assignment first, or pick a later date.",
    terminationLeftInconsistent:
      "The employment was ended but its assignment could not be closed, and undoing the termination also failed. The record is inconsistent — fix it before doing anything else.",
    cannotReopenAssignment:
      "The assignment closed by this termination has been edited since, so it cannot be safely reopened. Undo was refused rather than guessing which record to restore.",
    hasOpenEmployment:
      "This person already has an employment that has not ended. End it before adding a new one.",
    personRehiredSince:
      "This person has been rehired since this employment ended. End the newer employment first — nobody can hold two open employments at once.",
    rehireBeforeTermination:
      "The new hire date must be after the previous employment ended.",
    employmentCreatedWithoutAssignment:
      "The employment was created but its first assignment was not. Open the record and set the department and job title before relying on it.",
  },
};

// No `as const` above — deliberately. We want every value typed as `string`, so
// that `ar.ts` can be typed `Dictionary` and be checked for *missing keys*
// rather than for matching the English text.
export type Dictionary = typeof en;
