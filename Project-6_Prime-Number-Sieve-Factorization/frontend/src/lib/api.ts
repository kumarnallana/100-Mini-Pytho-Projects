import {
  SieveResponse,
  SieveStep,
  FactorNode,
  FactorizationResponse,
  PrimalityResponse,
} from "../types/prime";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function runSieve(limit: number): Promise<SieveResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/sieve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit, record_steps: true }),
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return fallbackSieve(limit);
  }
}

export async function factorizeNumber(num: number): Promise<FactorizationResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/factorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: num }),
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return fallbackFactorize(num);
  }
}

export async function checkPrimality(num: number): Promise<PrimalityResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/primality/${num}`, { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return fallbackPrimality(num);
  }
}

// ----------------------------------------------------------------------------
// Client-side Mathematical Fallbacks
// ----------------------------------------------------------------------------

function isPrimeLocal(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function fallbackSieve(limit: number): SieveResponse {
  const safeLimit = Math.max(2, Math.min(2000, Math.floor(limit)));
  const arr = new Array<boolean>(safeLimit + 1).fill(true);
  arr[0] = false;
  arr[1] = false;

  const steps: SieveStep[] = [];
  let totalElim = 0;
  let stepNum = 0;
  const sq = Math.floor(Math.sqrt(safeLimit));

  for (let p = 2; p <= sq; p++) {
    if (arr[p]) {
      const marked: number[] = [];
      for (let m = p * p; m <= safeLimit; m += p) {
        if (arr[m]) {
          arr[m] = false;
          totalElim++;
          marked.push(m);
        }
      }
      stepNum++;
      steps.push({
        step_num: stepNum,
        prime: p,
        multiples_marked: marked,
        newly_eliminated_count: marked.length,
        total_eliminated_so_far: totalElim,
      });
    }
  }

  const primes: number[] = [];
  for (let i = 2; i <= safeLimit; i++) {
    if (arr[i]) primes.push(i);
  }

  const twin_primes: [number, number][] = [];
  let maxGap = 0;
  let maxGapPair: [number, number] | null = null;
  for (let i = 0; i < primes.length - 1; i++) {
    const gap = primes[i + 1] - primes[i];
    if (gap === 2) twin_primes.push([primes[i], primes[i + 1]]);
    if (gap > maxGap) {
      maxGap = gap;
      maxGapPair = [primes[i], primes[i + 1]];
    }
  }

  return {
    limit: safeLimit,
    primes,
    prime_count: primes.length,
    composite_count: safeLimit - 1 - primes.length,
    prime_density_percent: Number(((primes.length / safeLimit) * 100).toFixed(2)),
    pnt_expected_count: Number((safeLimit / Math.log(safeLimit)).toFixed(2)),
    twin_primes,
    max_prime_gap: maxGap,
    max_gap_pair: maxGapPair,
    steps,
  };
}

function spfLocal(n: number): number {
  if (n % 2 === 0) return 2;
  if (n % 3 === 0) return 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0) return i;
    if (n % (i + 2) === 0) return i + 2;
  }
  return n;
}

function buildTreeLocal(n: number): FactorNode {
  const spf = spfLocal(n);
  if (spf === n) return { value: n, is_prime: true, left: null, right: null };
  return {
    value: n,
    is_prime: false,
    left: { value: spf, is_prime: true, left: null, right: null },
    right: buildTreeLocal(Math.floor(n / spf)),
  };
}

function fallbackFactorize(n: number): FactorizationResponse {
  const num = Math.max(2, Math.floor(n));
  const prime_factors: number[] = [];
  const factor_exponents: Record<string, number> = {};
  let temp = num;

  while (temp % 2 === 0) {
    prime_factors.push(2);
    factor_exponents["2"] = (factor_exponents["2"] || 0) + 1;
    temp = Math.floor(temp / 2);
  }
  let d = 3;
  while (d * d <= temp) {
    while (temp % d === 0) {
      prime_factors.push(d);
      factor_exponents[String(d)] = (factor_exponents[String(d)] || 0) + 1;
      temp = Math.floor(temp / d);
    }
    d += 2;
  }
  if (temp > 1) {
    prime_factors.push(temp);
    factor_exponents[String(temp)] = (factor_exponents[String(temp)] || 0) + 1;
  }

  const is_prime = prime_factors.length === 1;
  const canonical_formula = Object.keys(factor_exponents)
    .map(Number)
    .sort((a, b) => a - b)
    .map((p) => {
      const e = factor_exponents[String(p)];
      return e > 1 ? `${p}^${e}` : `${p}`;
    })
    .join(" × ");

  const small: number[] = [];
  const large: number[] = [];
  for (let i = 1; i * i <= num; i++) {
    if (num % i === 0) {
      small.push(i);
      if (i !== num / i) large.push(num / i);
    }
  }
  const all_divisors = [...small, ...large.reverse()];
  const proper_divisor_sum = all_divisors.reduce((a, b) => a + b, 0) - num;

  let classification = "deficient";
  if (is_prime) classification = "prime";
  else if (proper_divisor_sum === num) classification = "perfect";
  else if (proper_divisor_sum > num) classification = "abundant";

  let totient = num;
  for (const pStr of Object.keys(factor_exponents)) {
    const p = Number(pStr);
    totient = Math.floor(totient / p) * (p - 1);
  }

  const goldbach_pairs: [number, number][] = [];
  if (num > 2 && num % 2 === 0 && num <= 100000) {
    for (let p = 2; p <= num / 2; p++) {
      if (isPrimeLocal(p) && isPrimeLocal(num - p)) {
        goldbach_pairs.push([p, num - p]);
        if (goldbach_pairs.length >= 10) break;
      }
    }
  }

  return {
    number: num,
    is_prime,
    prime_factors,
    factor_exponents,
    canonical_formula,
    factor_tree: buildTreeLocal(num),
    all_divisors,
    divisor_count: all_divisors.length,
    proper_divisor_sum,
    classification,
    euler_totient: totient,
    goldbach_pairs,
  };
}

function fallbackPrimality(n: number): PrimalityResponse {
  let prev: number | null = null;
  if (n > 2) {
    for (let c = n - 1; c >= 2; c--) {
      if (isPrimeLocal(c)) {
        prev = c;
        break;
      }
    }
  }
  let next = Math.max(2, n + 1);
  while (!isPrimeLocal(next)) next++;

  return {
    number: n,
    is_prime: isPrimeLocal(n),
    previous_prime: prev,
    next_prime: next,
  };
}
