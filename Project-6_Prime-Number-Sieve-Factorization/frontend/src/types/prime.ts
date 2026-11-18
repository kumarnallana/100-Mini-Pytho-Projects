export interface SieveStep {
  step_num: number;
  prime: number;
  multiples_marked: number[];
  newly_eliminated_count: number;
  total_eliminated_so_far: number;
}

export interface SieveResponse {
  limit: number;
  primes: number[];
  prime_count: number;
  composite_count: number;
  prime_density_percent: number;
  pnt_expected_count: number;
  twin_primes: [number, number][];
  max_prime_gap: number;
  max_gap_pair: [number, number] | null;
  steps: SieveStep[];
}

export interface FactorNode {
  value: number;
  is_prime: boolean;
  left?: FactorNode | null;
  right?: FactorNode | null;
}

export interface FactorizationResponse {
  number: number;
  is_prime: boolean;
  prime_factors: number[];
  factor_exponents: Record<string, number>;
  canonical_formula: string;
  factor_tree: FactorNode;
  all_divisors: number[];
  divisor_count: number;
  proper_divisor_sum: number;
  classification: "prime" | "perfect" | "abundant" | "deficient" | "unit" | string;
  euler_totient: number;
  goldbach_pairs: [number, number][];
}

export interface PrimalityResponse {
  number: number;
  is_prime: boolean;
  previous_prime: number | null;
  next_prime: number;
}
