export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  categoryBreakdown: { [key: string]: number };
}

export enum PopulationChange {
  BOUGHT = 'BOUGHT',
  BIRTH = 'BIRTH',
  SOLD = 'SOLD',
  DEATH = 'DEATH'
}

export interface AnimalSpecies {
  id: string;
  name: string;
  tag: string;
  breed: string;
  count: number;
  estimatedValue: number;
  minSustainabilityLevel: number;
}

export interface AnimalLog {
  id: string;
  speciesId: string;
  date: string;
  type: PopulationChange;
  quantity: number;
  note: string;
  valueAtTime: number;
}

// Added missing types to fix errors in InventoryManager.tsx
export enum MovementType {
  IN = 'IN',
  OUT = 'OUT'
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  unitCost: number;
  minStockLevel: number;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  note: string;
  date: string;
  unitCostAtTime: number;
}

export enum AssetCategory {
  EQUIPMENT = 'EQUIPMENT',
  VEHICLE = 'VEHICLE',
  REAL_ESTATE = 'REAL_ESTATE',
  TECHNOLOGY = 'TECHNOLOGY',
  LIVESTOCK = 'LIVESTOCK',
  OTHER = 'OTHER'
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  description: string;
}

export enum LiabilityCategory {
  LOAN = 'LOAN',
  CREDIT_CARD = 'CREDIT_CARD',
  MORTGAGE = 'MORTGAGE',
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  OTHER = 'OTHER'
}

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  dueDate?: string;
  description: string;
}
