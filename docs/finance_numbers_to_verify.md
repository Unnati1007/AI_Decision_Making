# Finance Numbers Verification Checklist & Internal Conflicts

This document contains a verification checklist of all numbers, tax rules, interest rates, and financial claims extracted from `ai_curated` files in `data/finance/`, along with internal conflicts identified across files.

---

## 1. Numbers Verification Checklist

| File Name | Line Number | Extracted Line Text | Official Value | Match (Yes/No) |
| :--- | :--- | :--- | :--- | :--- |
| `asset_allocation_investments.md` | 15 | `- **Equity (60%)**: Low-cost Index Funds (Nifty 50, S&P 500) + Flexi-cap mutual funds for long-term compounding (7+ years).` | | |
| `asset_allocation_investments.md` | 16 | `- **Debt (20%)**: PPF, Debt Mutual Funds, Sovereign Gold Bonds for capital preservation and rebalancing liquidity.` | | |
| `asset_allocation_investments.md` | 17 | `- **Direct Stocks / Alpha (20%)**: Direct equity research for high-growth potential.` | | |
| `asset_allocation_investments.md` | 20 | `1. **Rule of 100 Minus Age**: Percentage allocated to equity = 100 - your age (e.g., at age 25, 75% in equity).` | | |
| `credit_score_loans.md` | 15 | `1. **Credit Utilization Ratio**: Keep total monthly credit card spend **under 30% of total credit limit**.` | | |
| `credit_score_loans.md` | 16 | `2. **On-Time Payment History**: Set up auto-debit for 100% of statement balance (never pay minimum amount due).` | | |
| `crypto_alternative_assets.md` | 15 | `- **Gold / SGB**: 5-10% of total portfolio as a hedge against inflation and currency depreciation.` | | |
| `crypto_alternative_assets.md` | 17 | `- **Crypto / High Risk Speculative Assets**: Capped strictly at **< 5% of investable surplus** due to extreme volatility and regulatory taxation (30% tax + 1% TDS in India).` | | |
| `debt_payoff_vs_investing.md` | 15 | `- **High Interest Debt (> 10% p.a.)**: Credit cards (36-42%), Personal loans (12-18%). **Prepay immediately** before investing.` | | |
| `debt_payoff_vs_investing.md` | 16 | `- **Low Interest Debt (< 8.5% p.a.)**: Home loans, education loans. Pay standard EMI and invest extra cash in equities where historical CAGR exceeds 12%.` | | |
| `emergency_fund_insurance.md` | 17 | `3. **Health Insurance**: Base policy of ₹10L–₹25L for self & immediate family + super top-up policy.` | | |
| `mutual_funds_sip.md` | 15 | `- **Large Cap / Nifty 50 Index Funds**: Low expense ratio (< 0.2%), core foundation of long-term portfolios, low volatility.` | | |
| `mutual_funds_sip.md` | 17 | `- **Small-Cap Funds**: High volatility, limit allocation to < 15% of total portfolio.` | | |
| `real_estate_rent_vs_buy.md` | 15 | `- **Rental Yield in Indian Metro Cities**: Typically 2.5% to 3.5% annually.` | | |
| `real_estate_rent_vs_buy.md` | 16 | `- **Home Loan Interest Rate**: Typically 8.5% to 9.5% per annum.` | | |
| `real_estate_rent_vs_buy.md` | 17 | `- **Opportunity Cost**: Down payment capital (20-30%) plus higher EMI vs Rent difference invested in Nifty Index Funds (historical 12-14% CAGR).` | | |
| `real_estate_rent_vs_buy.md` | 20 | `- Only purchase residential property if you plan to live in that specific city for **at least 7 to 10 years**, as registration fees, stamp duty (5-7%), and interest loading erode early equity buildup.` | | |
| `retirement_nps_ppf.md` | 15 | `- **EPF (Employees Provident Fund)**: Mandatory 12% basic contribution, high interest (8%+), tax-free at maturity.` | | |
| `retirement_nps_ppf.md` | 16 | `- **PPF (Public Provident Fund)**: 15-year lock-in, tax-free interest and maturity (EEE status), capped at ₹1.5L/year.` | | |
| `retirement_nps_ppf.md` | 17 | `- **NPS (National Pension System)**: Market-linked retirement account with equity allocation (up to 75%), extra ₹50k tax benefit under 80CCD(1B).` | | |
| `stock_market_basics.md` | 16 | `- **Passive Indexing**: 85% of active fund managers fail to beat benchmark indices over a 10-year period. Index funds provide market-matching returns with minimal management costs.` | | |
| `tax_saving_strategies.md` | 15 | `- **Section 80C (up to ₹1,500,000)**: ELSS Tax Saving Mutual Funds (3-year lock-in), PPF, EPF, Senior Citizen Savings Scheme.` | | |
| `tax_saving_strategies.md` | 16 | `- **Section 80CCD(1B) NPS (up to ₹50,000)**: Additional deduction for National Pension System.` | | |
| `tax_saving_strategies.md` | 17 | `- **Section 80D Health Insurance**: Up to ₹25,000 for self/family + ₹25,000 to ₹50,000 for parents.` | | |
| `tax_saving_strategies.md` | 18 | `- **HRA Exemption**: Minimum of (Actual HRA received, Rent paid - 10% of basic, 50% basic for metro).` | | |
| `tax_saving_strategies.md` | 21 | `- If your total eligible deductions exceed **₹3.75 Lakhs to ₹4.25 Lakhs** annually, Old Tax Regime usually yields lower tax liability. Otherwise, New Tax Regime is simpler and cheaper.` | | |

---

## 2. Internal Conflicts Across `data/finance/` Files

1. **Section 80C Limit Typo / Discrepancy** [manual / script]
   - `tax_saving_strategies.md:15`: Stated as `Section 80C (up to ₹1,500,000)` (written as ₹15 Lakhs).
   - `retirement_nps_ppf.md:16`: Stated as `PPF ... capped at ₹1.5L/year` (₹150,000 / ₹1.5 Lakhs).
   - **Conflict**: ₹1,500,000 (15 Lakhs) in `tax_saving_strategies.md` is a 10x typographical error; the statutory Section 80C cap is ₹1,500,00 (₹1.5 Lakhs).

2. **Home Loan Interest Rate Range** [manual]
   - `real_estate_rent_vs_buy.md:16`: Stated as `Home Loan Interest Rate: Typically 8.5% to 9.5% per annum.`
   - `debt_payoff_vs_investing.md:16`: Stated as `Low Interest Debt (< 8.5% p.a.): Home loans, education loans.`
   - **Conflict**: `debt_payoff_vs_investing.md` categorizes home loans as strictly `< 8.5%`, whereas `real_estate_rent_vs_buy.md` states the range starts at `8.5%` up to `9.5%`.

3. **Active Mutual Fund Underperformance vs Recommended Allocation** [manual]
   - `stock_market_basics.md:16`: Stated that `85% of active fund managers fail to beat benchmark indices over a 10-year period.`
   - `asset_allocation_investments.md:15`: Recommends `Flexi-cap mutual funds` and `Direct equity research (20%)` for high-growth potential.
   - **Conflict**: High active fund underperformance stat (85%) conflicts with recommending active flexi-cap funds and direct stock picking as core allocation strategies.
