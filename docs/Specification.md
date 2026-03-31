# Detailed Specification — Room Rental Management System

## 1. Module Specifications

---

### 1.1 Module: Area Management

**Function:** Add, edit, delete rental areas and view the room list per area.

**Area information includes:** area name, address, notes.

**Workflow (Add area):**
1. Manager selects **Area Management** → clicks **Add New Area**.
2. Manager enters area name and address → clicks **Save** → system saves to database and shows success message.

**Workflow (Edit / Delete area):**
- **Edit**: Manager selects an area → clicks **Edit** → updates info → **Save**.
- **Delete**: An area can only be deleted when **all rooms in it are Vacant** and there are no unpaid invoices. If the condition is violated, the system shows an error. The system requires a **second confirmation** before deleting.

---

### 1.2 Module: Room Information Management

**Function:** Add, edit, delete room and room type information; view rent price history per room.

**Room information includes:** room name, area, room type (standard capacity), rent, electricity rate, water rate, status.

**Workflow (Add room):**
1. Manager selects **Room Management** → clicks **Add New Room**.
2. Manager selects area, enters room name, selects room type, enters rent, electricity rate, water rate.
3. Manager clicks **Save** → system checks name uniqueness within the same area → saves to database; default status is "Vacant".

**Workflow (Edit room info):**
1. Manager selects **Room Management** → management page appears.
2. Manager selects **Edit Room Info** → room search by name appears.
3. Manager enters room name and clicks **Search** → matching rooms appear.
4. Manager selects **Edit** on a room → edit form appears with current info.
5. Manager enters new info and clicks **Update** → if rent changed, system saves a price history record (old price, new price, effective date) before saving; shows success message.

**Workflow (View rent price history):**
1. Manager selects a room → clicks **Rent Price History**.
2. System displays a table: Effective Date – Rent – Notes (if any), sorted newest to oldest.

**Workflow (Delete room):**
1. Manager finds a room and clicks **Delete**.
2. System checks conditions:
   - Room is currently **Vacant**.
   - No unpaid invoices linked to it.
3. If conditions are met: shows **second confirmation** dialog → Manager confirms → system deletes and shows success.
4. If not met: shows error message describing why deletion is not possible.

**Workflow (Manage room types):**
- Manager can **add / edit / delete room types** (type name, standard capacity).
- A room type can only be deleted when **no rooms** are using it.

---

### 1.3 Module: Customer Management

**Function:** View customer list, search, and view rental history.

**Workflow:**
1. Manager selects **Customer Management** → customer list appears (full name, ID number, phone, list of currently rented rooms).
2. Manager enters a keyword (name / ID number) and clicks **Search** → filtered list appears.
3. Manager clicks on a customer → system displays:
   - Personal info (full name, date of birth, ID number, phone, hometown).
   - **Rental history**: list of all contracts, each row showing room name – area – start date – end date – contract status.
   - **Debt status per room**: if the customer is renting multiple rooms, debt is shown separately per room (room name – amount owed – consecutive months overdue); total debt is shown at the bottom.

---

### 1.4 Module: Deposit & Room Hold

**Function:** Allow a customer to pay a deposit to hold a room before moving in and signing the official contract.

**Workflow:**
1. Manager selects **Deposit & Room Hold** → searches for a vacant room by name or area.
2. Manager selects a room → enters customer info (find existing or add new) and the deposit amount.
3. Manager clicks **Confirm Deposit** → system:
   - Saves deposit record (customer, room, amount, deposit date).
   - Changes room status to **"Deposited"**.
4. When customer arrives: Manager selects the "Deposited" room → proceeds to **Create Contract** (module 1.5) — system pre-fills the deposit amount received.

**Rules:**
- A "Deposited" room **cannot have a new contract created** for another customer until the deposit is cancelled.
- Manager can **cancel a deposit** (customer does not show up): enter a reason, handle refund/forfeiture per agreement, room returns to "Vacant".

---

### 1.5 Module: Rental Contract Creation

**Workflow:**
1. Manager selects **Find Vacant Room** → vacant room search appears (including "Deposited" rooms).
2. Manager enters move-in date, contract expiry date, and the price the customer agrees to → system shows matching rooms (with room type, capacity, electricity/water rates).
3. Manager selects a room → customer info form appears:
   - System allows **searching for an existing customer** (by ID number or name) to reuse info; or entering a new customer if not found.
   - **Contract representative (Party B)**: full name, date of birth, ID number, phone, hometown.
   - **Actual number of occupants** at move-in (used to calculate sanitation fee).
   - **Deposit amount**: if the room is already "Deposited", system pre-fills the amount already received; otherwise the manager enters it.
4. System displays the **full contract preview** including the number of occupants.
5. Customer reviews and accepts → Manager clicks **Confirm** → system prints the contract, creates the initial occupant list, changes room status to "Rented", and saves everything.

**Validation rules:**
- Expiry date must be **at least 1 month after** the start date.
- Start date cannot be earlier than **30 days** before the current date.
- Cannot create a contract for a room that is currently "Rented" or "Under Repair".

---

### 1.6 Module: Contract Renewal

**Workflow:**
1. Manager selects **Contract Renewal** → searches by customer name / room name; if customer rents multiple rooms, a list of contracts appears to select the correct one.
2. Manager selects the contract to renew → system displays current contract info.
3. Manager enters **new expiry date** (must be after the old expiry date) → clicks **Confirm Renewal**.
4. System saves the new expiry date, records renewal history (renewal date, old expiry, new expiry), and shows success.

---

### 1.7 Module: Monthly Invoice Generation

**Workflow:**
1. Manager selects **Monthly Invoice** → system shows the list of rented rooms without an invoice this month.
2. Manager clicks on a room → electricity/water meter reading and vehicle entry form appears:
   - **Old reading** (electricity/water): system pre-fills from the new reading of the previous month.
   - **New reading**: Manager enters after physically reading the meter (must be ≥ old reading).
   - **Motorbikes** and **bicycles**: Manager enters the count for this month.
3. Manager fills in all fields → system auto-calculates consumption and displays the **full monthly invoice**, including any previous balance.
4. Manager reviews and clicks **Confirm** → system saves and prints the invoice for that room.
5. Repeat until all rooms are done.

**First / last month rules:**
- First month (customer moves in mid-month): rent = rental price × (actual days stayed / total days in month), rounded to nearest 1,000 VND.
- Last month (customer leaves mid-month on settlement): same — calculated based on actual days stayed.

---

### 1.8 Module: Monthly Payment Processing

**Workflow:**
1. Customer brings invoice to pay; Manager selects **Payment**.
2. System shows invoice search (by invoice ID / customer name / room name).
3. Manager enters search info and clicks **Find** → matching invoice appears.
4. Manager selects **payment method**:
   - **Cash**: Manager receives payment directly.
   - **Bank transfer**: Manager enters bank transaction reference (optional, for reconciliation).
5. Manager clicks **Confirm Payment** → system updates invoice status to "Paid", records payment date and method.
6. Manager signs and returns the invoice to the customer.

---

### 1.9 Module: Revenue & Profit Statistics

**Workflow:**
1. Manager selects **Revenue Statistics** → system shows options: by **month / quarter / year**.
2. Manager selects period type → system displays a summary table, each row containing:
   - Month (or quarter/year) – Total Revenue – Total Operating Costs (if available) – Profit (= revenue − costs).
   - Sorted from most recent to oldest.
   - If no operating cost data exists for a period, Cost and Profit columns show "—".
3. Manager clicks a row → system shows the **list of paid invoices** in that period, each row containing:
   - Invoice ID – Customer Name – Room Name – Total Amount – Payment Method.

---

### 1.10 Module: Contract Settlement

**Workflow:**
1. Manager selects **Contract Settlement** → contract search by customer name / room name appears.
   - If searching by customer name and the customer rents **multiple rooms**, system shows all active contracts for that customer for the manager to select the **correct room**.
2. Manager selects the contract to settle → system displays:
   - Contract info, deposit held.
   - Any unpaid invoices (if any).
3. Manager enters move-out info: date, damage notes (if any) with compensation amount.
4. System automatically calculates **deposit refund** = Deposit − Outstanding debt − Compensation.
   - If outstanding debt > 0: system prompts manager to resolve debt first (collect cash or deduct from deposit).
   - Refund amount minimum is 0 (never negative).
5. Manager confirms → system prints the **settlement record**, updates room status to "Vacant".

---

### 1.11 Module: Contract Cancellation

**Condition:** Customer has not paid for 2 or more consecutive months.

**Workflow:**
1. Manager selects **Cancel Contract** (or accesses from the "Contract at Risk" alert on dashboard).
   - If customer rents **multiple rooms**, system shows the contract list for the manager to select the correct room.
2. System displays contract info and list of unpaid invoices.
3. Manager confirms cancellation reason: "Payment obligation breach".
4. Manager clicks **Confirm Cancellation** → system:
   - Records cancellation reason and date.
   - **Forfeits entire deposit** (no refund).
   - Changes room status to "Vacant".
   - Prints the **contract cancellation record**.

---

### 1.12 Module: Room Occupant Management

**Function:** Track the actual list of occupants in each room to accurately calculate sanitation fees.

**Rules:**
- A room has only **1 representative who signs the contract**, but the actual number of occupants may be higher.
- Each room type has a **standard capacity of 1 to 4 people**. The system shows a warning if occupants exceed the standard, but **the manager can still allow it** (e.g. 2 people in a 1-person room due to circumstances).
- The occupant list is initialized at contract signing and can be updated at any time.

**Workflow:**
1. Manager selects a room → views current occupant list (full name, ID number, move-in date).
2. Manager can **add / remove occupants** with start/end dates.
3. When generating a monthly invoice, the system automatically uses the actual occupant count for that month to calculate the sanitation fee.

---

### 1.13 Module: Service Price Management

**Function:** Allow the manager to update service unit prices per room type over time.

**Rules:**
- Electricity/water rates are **not uniform** — each room type has its own rates (higher capacity rooms have lower rates).
- Sanitation, motorbike parking, and bicycle parking rates apply **uniformly** to all rooms.
- Each time a price changes, the system saves the **price history** with the effective date.
- When generating invoices, the system automatically applies the **price for the corresponding room type effective at the invoice creation date**.
- Manager can view price change history by room type and service type.

---

### 1.14 Module: Alerts & Dashboard Overview

**Function:** Display overall KPIs and important alerts on the manager's home page.

**Overview KPIs (displayed as metric cards):**

| Metric | Content |
|---|---|
| Occupancy rate | Rooms currently rented / total rooms (%), broken down by area |
| This month's revenue | Total paid invoice amounts in the current month |
| Contracts expiring soon | Number of contracts with ≤ 1 month until expiry |
| Rooms under repair | Number of rooms currently in "Under Repair" status |

**Alerts (displayed as grouped cards by type):**

| Alert type | Display condition |
|---|---|
| Room missing invoice | Past end of month but room has no invoice yet |
| Invoice due soon | ≤ 2 days until payment deadline |
| Invoice overdue | More than 1 week past due without payment |
| Contract at risk | Customer has ≥ 2 consecutive unpaid invoices |
| Contract expiring soon | Exactly 1 month until contract expiry |

**Actions from alerts:**
- Each alert card has a **View Details** button to navigate directly to the relevant handling screen.
- Manager can **mark an alert as seen** to hide it from the list; it will reappear the next day if the condition still exists.

---

### 1.15 Module: Advanced Reports

**Report types available to the manager:**

1. **Room occupancy report**: Rooms rented / total rooms, per area.
2. **Customer debt report**: List of customers with outstanding debt, total owed, consecutive months overdue (highlighted red if ≥ 2 months); if a customer rents multiple rooms, debt is itemized per room.
3. **Revenue by area / by room**: Compare revenue across areas and rooms in a given period.
4. **Export reports**: Supports export to Excel or PDF.

---

### 1.16 Module: Maintenance & Repair Management

**Function:** Manager records and tracks incidents and maintenance work per room/area.

**Workflow:**
1. Manager creates a repair request: select room, describe the issue, enter date, estimated cost.
2. Manager updates status: `Pending` → `In Progress` → `Completed`.
3. When completed, Manager enters actual cost → system records it in the room's maintenance history.
4. Repair costs may be **deducted from the deposit** at settlement (if caused by the tenant).

---

### 1.17 Module: Contract List & Search

**Function:** View all contracts in the system, filter and search.

**Workflow:**
1. Manager selects **Contract List** → system displays a table of all contracts: Contract ID – Customer Name – Room Name – Area – Start Date – Expiry Date – Status.
2. Manager can **filter** by:
   - Status: Active / Settled / Cancelled.
   - Rental area.
   - Date range (start date or end date).
   - Customer name or room name (keyword search).
3. Manager clicks on a contract → system displays full contract details and offers actions (Renew, Settle, Cancel).

---

### 1.18 Module: Operating Cost Management

**Function:** Record the landlord's expenses to calculate actual profit.

**Cost types:**

| Type | Description |
|---|---|
| Total utilities | Electricity/water bills paid to providers based on the area's master meter |
| Common area repairs | Maintenance costs for shared infrastructure (roof, corridors, etc.) |
| Other costs | Other miscellaneous expenses (area cleaning, taxes, etc.) |

**Workflow:**
1. Manager selects **Operating Costs** → selects **Add Cost**.
2. Manager selects month, cost type, area (if applicable), amount, and notes.
3. Manager clicks **Save** → system records it and updates profit data in the statistics module.
4. Manager can view costs by month/area, edit or delete individual entries.

---

## 2. Detailed Business Rules

### 2.1 Room Status
Rooms have 4 clearly defined statuses:

| Status | Description | Can transition to |
|---|---|---|
| Vacant | No tenant, available to rent | Rented (on contract signing), Deposited (on deposit), Under Repair |
| Rented | Has an active contract | Vacant (on settlement / cancellation) |
| Deposited | Deposit received, waiting for tenant to move in | Rented (on official contract signing), Vacant (on deposit cancellation) |
| Under Repair | Temporarily unavailable | Vacant (on repair completion) |

### 2.2 Deposits
- Deposits are not counted as revenue until the contract is settled.
- On settlement: full refund if no debt/damage; deductions applied in order: unpaid invoices → compensation → return remainder.
- On contract cancellation (due to payment breach): entire deposit is forfeited, no refund.

### 2.3 Mid-Term Rent Adjustments
- Manager updates rent **without requiring customer confirmation** in the system.
- When the manager changes rent, the system saves the **new price effective date** and the old price in the rent history table.
- Previous months' invoices are not affected; the new price only applies from the next month.

### 2.4 Overdue Debt & Contract Cancellation
- No interest is applied to overdue invoices.
- If a customer **has not paid for 2 or more consecutive months**, the manager may perform **contract cancellation**:
  - System records cancellation reason: payment obligation breach.
  - **Entire deposit is forfeited**, no refund.
  - Room status changes to "Vacant".
  - System prints the contract cancellation record.
- When a customer rents multiple rooms, cancelling one room's contract **does not affect** the other contracts of the same customer.

### 2.5 Input Validation
- New meter readings must be **≥ old readings**; if violated the system shows a clear error and prevents saving.
- Contract expiry date must be **at least 1 month after** the start date.
- Contract start date cannot be earlier than **30 days** before the current date (prevents accidental past-date or wrong-year entry).
- Room name must be **unique within the same area**; system checks and reports an error on duplicate.
- Number of occupants, motorbikes, and bicycles must be **non-negative integers**.
- Required fields (customer name, ID number, phone) cannot be empty when creating a contract.
- Operating cost amounts must be **positive numbers**; negative values are not allowed.
