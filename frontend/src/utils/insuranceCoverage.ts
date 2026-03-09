export interface InsurancePlan {
  provider: string;
  shortCode: string;
  planName: string;
  coveragePercent: number;      // % of bill covered by insurance
  patientCopayPercent: number;  // % patient pays
  requiresPrescription: boolean;
  claimSubmissionType: 'DIGITAL' | 'PAPER' | 'BOTH';
  notes: string;
  color: string;
  icon: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string; // tailwind color class
  plans: InsurancePlan[];
  claimRequirements: string[];
}

export const INSURANCE_PROVIDERS: InsuranceProvider[] = [
  {
    id: 'RSSB',
    name: 'Rwanda Social Security Board',
    shortName: 'RSSB',
    icon: '🏛️',
    color: 'blue',
    plans: [
      {
        provider: 'RSSB',
        shortCode: 'RSSB-MED',
        planName: 'Medical Scheme (Public/Private Sector)',
        coveragePercent: 85,
        patientCopayPercent: 15,
        requiresPrescription: true,
        claimSubmissionType: 'DIGITAL',
        notes: 'Covers 85% of approved medicines. Must be on RSSB reimbursable medicines list. GET_AFFILIATES verification required.',
        color: 'blue',
        icon: '🏛️'
      }
    ],
    claimRequirements: [
      'Affiliate Number (Beneficiary Number)',
      'Beneficiary full name & relationship (Self/Spouse/Child)',
      'Date of birth & gender',
      'Employer name & category (Public/Private)',
      'Prescribing doctor name & signature',
      'Medicines must be on RSSB reimbursable list',
      'Digital submission via authorized pharmacy software'
    ]
  },
  {
    id: 'CBHI',
    name: 'Community-Based Health Insurance (Mutuelle de Santé)',
    shortName: 'CBHI / Mutuelle',
    icon: '🌿',
    color: 'green',
    plans: [
      {
        provider: 'CBHI',
        shortCode: 'CBHI-CAT1',
        planName: 'Category I (Government subsidized)',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: true,
        claimSubmissionType: 'PAPER',
        notes: 'Fully subsidized by government. 10% co-payment by patient.',
        color: 'green',
        icon: '🌿'
      },
      {
        provider: 'CBHI',
        shortCode: 'CBHI-CAT2',
        planName: 'Category II (3,000 Frw/year)',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: true,
        claimSubmissionType: 'PAPER',
        notes: '3,000 Frw annual premium per person. 10% co-payment at point of service.',
        color: 'green',
        icon: '🌿'
      },
      {
        provider: 'CBHI',
        shortCode: 'CBHI-CAT3',
        planName: 'Category III (3,000 Frw/year)',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: true,
        claimSubmissionType: 'PAPER',
        notes: '3,000 Frw annual premium. Standard Mutuelle coverage.',
        color: 'green',
        icon: '🌿'
      },
      {
        provider: 'CBHI',
        shortCode: 'CBHI-CAT4',
        planName: 'Category IV (7,000 Frw/year)',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: true,
        claimSubmissionType: 'PAPER',
        notes: '7,000 Frw annual premium per person. Higher income bracket.',
        color: 'green',
        icon: '🌿'
      }
    ],
    claimRequirements: [
      'Mutuelle membership card number',
      'Ubudehe category (I, II, III, or IV)',
      "Doctor's prescription (fiche de prescription)",
      'Prescribing doctor name & signature',
      'Paper invoice submitted to district CBHI office',
      'Verification of active membership'
    ]
  },
  {
    id: 'OLD_MUTUAL',
    name: 'Old Mutual Rwanda (Formerly UAP)',
    shortName: 'Old Mutual',
    icon: '🦁',
    color: 'amber',
    plans: [
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-HEZA',
        planName: 'Heza Care (Budget, Local)',
        coveragePercent: 80,
        patientCopayPercent: 20,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Budget plan. Inpatient: 1.5M–3.75M Frw. Outpatient: 250k–450k Frw annual limits.',
        color: 'amber',
        icon: '🦁'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-FAMILY',
        planName: 'Health Family Cover (Regional)',
        coveragePercent: 85,
        patientCopayPercent: 15,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Regional/international coverage. Premium varies by family size (M, M+1, etc.).',
        color: 'amber',
        icon: '🦁'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-PLAT',
        planName: 'Platinum Plan',
        coveragePercent: 95,
        patientCopayPercent: 5,
        requiresPrescription: false,
        claimSubmissionType: 'DIGITAL',
        notes: 'Top tier. Inpatient up to 75,000,000 Frw. Near full coverage.',
        color: 'amber',
        icon: '🦁'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-GOLD',
        planName: 'Gold Plan',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: false,
        claimSubmissionType: 'DIGITAL',
        notes: 'Premium plan with comprehensive inpatient/outpatient coverage.',
        color: 'amber',
        icon: '🦁'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-SILVER',
        planName: 'Silver Plan',
        coveragePercent: 80,
        patientCopayPercent: 20,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Mid-range plan with moderate inpatient limits.',
        color: 'amber',
        icon: '🦁'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-BRONZE',
        planName: 'Bronze Plan',
        coveragePercent: 70,
        patientCopayPercent: 30,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Entry-level plan. Inpatient limit ~750,000 Frw.',
        color: 'amber',
        icon: '🦁'
      }
    ],
    claimRequirements: [
      'Insurance card number & plan code',
      "Doctor's prescription",
      'Claim form (OM-specific format)',
      'Pharmacy stamp & signature',
      'Itemized medicine list with generic names',
      'Submit to Old Mutual directly or via digital portal'
    ]
  },
  {
    id: 'RADIANT',
    name: 'Radiant Insurance Rwanda',
    shortName: 'Radiant',
    icon: '⭐',
    color: 'purple',
    plans: [
      {
        provider: 'RADIANT',
        shortCode: 'RAD-BASIC',
        planName: 'Basic Outpatient',
        coveragePercent: 85,
        patientCopayPercent: 15,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Outpatient limit 300,000 Frw. Partnership pharmacy co-pay of 15%.',
        color: 'purple',
        icon: '⭐'
      },
      {
        provider: 'RADIANT',
        shortCode: 'RAD-PLUS',
        planName: 'Plus Outpatient',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Outpatient limit up to 1,500,000 Frw. 10% co-pay at partnership pharmacies.',
        color: 'purple',
        icon: '⭐'
      }
    ],
    claimRequirements: [
      'Radiant insurance card number',
      "Prescribing doctor's details & signature",
      'Radiant-specific claim form',
      'Itemized prescription with quantities',
      'Pharmacy details (name, stamp, signature)',
      'Total amount & co-payment breakdown'
    ]
  },
  {
    id: 'BRITAM',
    name: 'Britam Rwanda',
    shortName: 'Britam',
    icon: '🔷',
    color: 'cyan',
    plans: [
      {
        provider: 'BRITAM',
        shortCode: 'BRIT-OUT',
        planName: 'Standard Outpatient',
        coveragePercent: 80,
        patientCopayPercent: 20,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Covers outpatient, chronic, and maternity services. 20% co-pay.',
        color: 'cyan',
        icon: '🔷'
      },
      {
        provider: 'BRITAM',
        shortCode: 'BRIT-COMP',
        planName: 'Comprehensive',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: false,
        claimSubmissionType: 'DIGITAL',
        notes: 'Comprehensive inpatient + outpatient. Digital claim submission preferred.',
        color: 'cyan',
        icon: '🔷'
      }
    ],
    claimRequirements: [
      'Britam member card & policy number',
      'Completed Britam claim form',
      "Doctor's diagnosis & prescription",
      'Itemized pharmacy invoice',
      'Patient ID copy',
      'Electronic submission preferred'
    ]
  },
  {
    id: 'PRIME',
    name: 'Prime Insurance Rwanda',
    shortName: 'Prime',
    icon: '💎',
    color: 'rose',
    plans: [
      {
        provider: 'PRIME',
        shortCode: 'PRIME-MED',
        planName: 'Prime Medical Insurance',
        coveragePercent: 85,
        patientCopayPercent: 15,
        requiresPrescription: true,
        claimSubmissionType: 'DIGITAL',
        notes: 'Inpatient 22.5M–50M Frw. Includes dental & optical. Electronic submission required.',
        color: 'rose',
        icon: '💎'
      }
    ],
    claimRequirements: [
      'Prime member number & policy details',
      'Electronic submission (Prime portal)',
      'Detailed medicine list (generic names, strength, dosage)',
      "Prescribing doctor's details",
      'Pharmacy details & stamp',
      'Financial breakdown: total, co-pay, reimbursement amount'
    ]
  }
];

// Get a specific plan by shortCode
export const getPlanByCode = (shortCode: string): InsurancePlan | undefined => {
  for (const provider of INSURANCE_PROVIDERS) {
    const plan = provider.plans.find(p => p.shortCode === shortCode);
    if (plan) return plan;
  }
  return undefined;
};

// Get provider by ID
export const getProvider = (id: string): InsuranceProvider | undefined =>
  INSURANCE_PROVIDERS.find(p => p.id === id);

// Calculate coverage for a given total
export interface CoverageCalculation {
  totalAmount: number;
  insurancePays: number;
  patientPays: number;
  coveragePercent: number;
  patientCopayPercent: number;
  planName: string;
  providerName: string;
}

export const calculateCoverage = (
  totalAmount: number,
  planShortCode: string
): CoverageCalculation | null => {
  const plan = getPlanByCode(planShortCode);
  if (!plan) return null;

  const insurancePays = Math.round((totalAmount * plan.coveragePercent) / 100);
  const patientPays = totalAmount - insurancePays;

  return {
    totalAmount,
    insurancePays,
    patientPays,
    coveragePercent: plan.coveragePercent,
    patientCopayPercent: plan.patientCopayPercent,
    planName: plan.planName,
    providerName: plan.provider
  };
};

// Flat list of all plans for dropdown selects
export const getAllPlans = (): Array<InsurancePlan & { providerFullName: string }> =>
  INSURANCE_PROVIDERS.flatMap(provider =>
    provider.plans.map(plan => ({
      ...plan,
      providerFullName: provider.name
    }))
  );

// Color utilities
export const providerColorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  RSSB:       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700' },
  CBHI:       { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700' },
  OLD_MUTUAL: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700' },
  RADIANT:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  BRITAM:     { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200',   badge: 'bg-cyan-100 text-cyan-700' },
  PRIME:      { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-700' },
};