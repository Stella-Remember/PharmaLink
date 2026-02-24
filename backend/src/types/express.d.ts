import { User, Pharmacy, Staff } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user: User & {
        ownedStores?: Pharmacy[]
        staffEntries?: (Staff & {
          pharmacy: Pharmacy
        })[]
      }
    }
  }
}