// frontend/src/utils/insuranceCoverage.ts
// COMPLETE REPLACEMENT FILE
// Fixes:
//  - Was applying one flat % to entire cart
//  - Now supports per-medicine coverage rules fetched from backend
//  - calculateCoverage() now takes medicine-level rules into account
//  - Adds helper to check if a medicine is on the reimbursable formulary

export interface InsurancePlan {
  provider: string
  shortCode: string
  planName: string
  coveragePercent: number
  patientCopayPercent: number
  requiresPrescription: boolean
  claimSubmissionType: 'DIGITAL' | 'PAPER' | 'BOTH'
  notes: string
  color: string
  icon: string
}

export interface InsuranceProvider {
  id: string
  name: string
  shortName: string
  icon: string
  color: string
  plans: InsurancePlan[]
  claimRequirements: string[]
}

// ── Per-medicine coverage rule (from backend InsuranceCoverageRule model) ─────
export interface CoverageRule {
  insuranceProvider: string
  planCode: string
  medicineId?: string
  category?: string
  isOnFormulary: boolean
  coveragePercent: number   // overrides plan default
  priceCap?: number         // max reimbursable per unit in RWF
  requiresPreAuth: boolean
}

// ── Coverage calculation result ───────────────────────────────────────────────
export interface CoverageResult {
  medicineId: string
  medicineName: string
  unitPrice: number
  quantity: number
  lineTotal: number
  isOnFormulary: boolean
  effectiveCoveragePercent: number
  reimbursableAmount: number   // what insurance pays
  patientAmount: number        // what patient pays
  priceCapped: boolean         // true if price cap was applied
  requiresPreAuth: boolean
}

export interface CartCoverageResult {
  lines: CoverageResult[]
  totalInsuranceAmount: number
  totalPatientAmount: number
  totalCartAmount: number
  nonFormularyItems: string[]   // names of items not on formulary
  preAuthRequired: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION: calculateCartCoverage
// Replace your old flat-percentage calculation with this.
//
// Usage:
//   const result = calculateCartCoverage(cartItems, plan, coverageRules)
//   → gives you per-line breakdown + totals
// ─────────────────────────────────────────────────────────────────────────────
export function calculateCartCoverage(
  cartItems: Array<{
    medicineId: string
    medicineName: string
    category?: string
    unitPrice: number
    quantity: number
  }>,
  plan: InsurancePlan,
  // rules fetched from GET /api/insurance-rules?provider=X&planCode=Y
  coverageRules: CoverageRule[] = []
): CartCoverageResult {
  const lines: CoverageResult[] = []
  const nonFormularyItems: string[] = []
  let preAuthRequired = false

  for (const item of cartItems) {
    const lineTotal = item.unitPrice * item.quantity

    // Find the most specific rule: medicine-level first, then category-level
    const rule = findApplicableRule(
      item.medicineId,
      item.category,
      plan.shortCode,
      plan.provider,
      coverageRules
    )

    // If a rule says not on formulary, patient pays 100%
    if (rule && !rule.isOnFormulary) {
      nonFormularyItems.push(item.medicineName)
      lines.push({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal,
        isOnFormulary: false,
        effectiveCoveragePercent: 0,
        reimbursableAmount: 0,
        patientAmount: lineTotal,
        priceCapped: false,
        requiresPreAuth: false
      })
      continue
    }

    const coveragePercent = rule?.coveragePercent ?? plan.coveragePercent
    const requiresPreAuth = rule?.requiresPreAuth ?? false
    if (requiresPreAuth) preAuthRequired = true

    // Apply price cap if set (cap is per-unit, multiply by quantity)
    let reimbursableBase = lineTotal * (coveragePercent / 100)
    let priceCapped = false

    if (rule?.priceCap) {
      const maxReimbursable = rule.priceCap * item.quantity
      if (reimbursableBase > maxReimbursable) {
        reimbursableBase = maxReimbursable
        priceCapped = true
      }
    }

    const reimbursableAmount = Math.round(reimbursableBase)
    const patientAmount = lineTotal - reimbursableAmount

    lines.push({
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal,
      isOnFormulary: true,
      effectiveCoveragePercent: coveragePercent,
      reimbursableAmount,
      patientAmount,
      priceCapped,
      requiresPreAuth
    })
  }

  const totalInsuranceAmount = lines.reduce((s, l) => s + l.reimbursableAmount, 0)
  const totalPatientAmount = lines.reduce((s, l) => s + l.patientAmount, 0)
  const totalCartAmount = lines.reduce((s, l) => s + l.lineTotal, 0)

  return {
    lines,
    totalInsuranceAmount,
    totalPatientAmount,
    totalCartAmount,
    nonFormularyItems,
    preAuthRequired
  }
}

// ── Simple flat-rate calculation (used as fallback when no rules loaded) ──────
// This is your original logic — kept for backward compatibility
export function calculateFlatCoverage(
  totalAmount: number,
  plan: InsurancePlan
): { insuranceAmount: number; patientAmount: number } {
  const insuranceAmount = Math.round(totalAmount * (plan.coveragePercent / 100))
  return {
    insuranceAmount,
    patientAmount: totalAmount - insuranceAmount
  }
}

// ── Internal helper ───────────────────────────────────────────────────────────
function findApplicableRule(
  medicineId: string,
  category: string | undefined,
  planCode: string,
  provider: string,
  rules: CoverageRule[]
): CoverageRule | undefined {
  const planRules = rules.filter(
    r => r.insuranceProvider === provider && r.planCode === planCode
  )

  // Medicine-level rule takes priority over category-level
  const medicineRule = planRules.find(r => r.medicineId === medicineId)
  if (medicineRule) return medicineRule

  if (category) {
    const categoryRule = planRules.find(r => r.category === category && !r.medicineId)
    if (categoryRule) return categoryRule
  }

  return undefined
}

// ── Insurance provider definitions (unchanged from original) ──────────────────
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
        notes: 'Covers 85% of approved medicines on RSSB reimbursable list. Per-medicine price caps may apply.',
        color: 'blue',
        icon: '🏛️'
      }
    ],
    claimRequirements: [
      'Affiliate Number (Beneficiary Number)',
      'Beneficiary full name & relationship',
      'Date of birth & gender',
      'Employer name & category (Public/Private)',
      "Prescribing doctor name & signature",
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
        notes: 'Fully subsidized. 10% co-pay. Only covers medicines on CBHI essential medicines list.',
        color: 'green',
        icon: '🌿'
      },
      {
        provider: 'CBHI',
        shortCode: 'CBHI-CAT2',
        planName: 'Category II (3,000 RWF/year)',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: true,
        claimSubmissionType: 'PAPER',
        notes: '3,000 RWF annual premium. 10% co-pay.',
        color: 'green',
        icon: '🌿'
      },
      {
        provider: 'CBHI',
        shortCode: 'CBHI-CAT3',
        planName: 'Category III (3,000 RWF/year)',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: true,
        claimSubmissionType: 'PAPER',
        notes: '3,000 RWF annual premium. Standard Mutuelle coverage.',
        color: 'green',
        icon: '🌿'
      },
      {
        provider: 'CBHI',
        shortCode: 'CBHI-CAT4',
        planName: 'Category IV (7,000 RWF/year)',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: true,
        claimSubmissionType: 'PAPER',
        notes: '7,000 RWF annual premium. Higher income bracket.',
        color: 'green',
        icon: '🌿'
      }
    ],
    claimRequirements: [
      'Mutuelle membership card number',
      'Ubudehe category (I, II, III, or IV)',
      "Doctor's prescription (fiche de prescription)",
      'Paper invoice submitted to district CBHI office',
      'Verification of active membership'
    ]
  },
  {
    id: 'OLD_MUTUAL',
    name: 'Old Mutual Rwanda',
    shortName: 'Old Mutual',
    icon: '🏦',
    color: 'amber',
    plans: [
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-PLAT',
        planName: 'Platinum Plan',
        coveragePercent: 95,
        patientCopayPercent: 5,
        requiresPrescription: false,
        claimSubmissionType: 'DIGITAL',
        notes: 'Top tier. Near full coverage.',
        color: 'amber',
        icon: '🏦'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-GOLD',
        planName: 'Gold Plan',
        coveragePercent: 90,
        patientCopayPercent: 10,
        requiresPrescription: false,
        claimSubmissionType: 'DIGITAL',
        notes: 'Comprehensive inpatient/outpatient coverage.',
        color: 'amber',
        icon: '🏦'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-SILVER',
        planName: 'Silver Plan',
        coveragePercent: 80,
        patientCopayPercent: 20,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Mid-range plan.',
        color: 'amber',
        icon: '🏦'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-BRONZE',
        planName: 'Bronze Plan',
        coveragePercent: 70,
        patientCopayPercent: 30,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Entry-level plan.',
        color: 'amber',
        icon: '🏦'
      },
      {
        provider: 'OLD_MUTUAL',
        shortCode: 'OM-HEZA',
        planName: 'Heza Care (Budget)',
        coveragePercent: 80,
        patientCopayPercent: 20,
        requiresPrescription: true,
        claimSubmissionType: 'BOTH',
        notes: 'Budget plan. Annual outpatient limit applies.',
        color: 'amber',
        icon: '🏦'
      }
    ],
    claimRequirements: [
      'Insurance card number & plan code',
      "Doctor's prescription",
      'Old Mutual claim form',
      'Pharmacy stamp & signature',
      'Itemized medicine list with generic names'
    ]
  }
]

// Helper to find a plan by shortCode across all providers
export function getPlanByCode(shortCode: string): InsurancePlan | undefined {
  for (const provider of INSURANCE_PROVIDERS) {
    const plan = provider.plans.find(p => p.shortCode === shortCode)
    if (plan) return plan
  }
  return undefined
}

// Helper to get provider by id
export function getProviderById(id: string): InsuranceProvider | undefined {
  return INSURANCE_PROVIDERS.find(p => p.id === id)
}