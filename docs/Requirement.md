# System Requirements — Room Rental Management System

## 1. Overview

The system helps a landlord manage multiple rental areas, each containing multiple rooms with individual rental prices. It covers the full business workflow from signing contracts, generating monthly invoices, and processing payments to revenue statistics. The system has **only 1 user — the landlord**, used internally on a LAN, and requires no authentication or login.

---

## 2. Main Entities

| Entity | Description |
|---|---|
| **Landlord (Manager)** | Owner and sole operator of the system; single user, no login required |
| **Rental Area** | A landlord may manage multiple areas; each has a name and address |
| **Room Type** | Classifies rooms by capacity (1–4 people); each type has its own rental price and electricity/water rates |
| **Room** | Belongs to one area and one room type |
| **Customer** | May rent multiple rooms at different times; may be renting multiple rooms simultaneously |
| **Rental Contract** | Binds a customer to a specific room, with a start date and expiry date |
| **Monthly Invoice** | Aggregates all charges payable for a room in a given month |
| **Operating Cost** | Landlord's expenses (total utility bills, common area repairs, etc.) used to calculate profit |

---

## 3. High-Level Business Rules

### 3.1 Rooms & Room Types
- Each room belongs to a **room type** with a standard capacity of 1 to 4 people.
- Rooms with higher capacity have a **higher rent** but **lower electricity/water rates** than rooms with fewer occupants.
- Each room has its own **electricity meter and water meter**.
- A room can be rented by different customers at different times (consecutive rentals).
- Room names must be **unique within the same area**.
- A room can only be deleted when it is **Vacant** and has no unpaid invoices.
- Each time the **rent of a specific room** changes, the system saves a price history record (effective date, old price, new price); the new price only applies from the next monthly invoice onward.

### 3.2 Contracts & Deposits
- A customer may **pay a deposit in advance** to hold a room before moving in; the room then changes to "Deposited" status. When the customer moves in, the manager signs the official contract and the room changes to "Rented".
- When signing a contract, the customer must pay a deposit equal to exactly **1 month's rent** at the time of signing.
- A contract has a defined **start date** and **expiry date**. The start date cannot be earlier than **30 days** before the current date.
- **1 month before** a contract expires, the system automatically shows an alert prompting the manager to contact the customer about renewal or settlement.
- The contract records: Party A info (landlord), Party B info (customer representative), room, start date, expiry date, initial rental price, deposit amount, unit prices for services (electricity, water, sanitation, motorbike parking, bicycle parking), actual number of occupants.
- The manager can **renew a contract** by updating the expiry date; the original contract history is preserved.

### 3.3 Monthly Invoices
Each invoice includes the following line items (quantity – unit price – amount):

| Charge | Calculation |
|---|---|
| Rent | Current monthly rent (full month; first/last month calculated on actual days if tenant moves in/out mid-month) |
| Electricity | Based on meter reading (old reading, new reading, unit price, subtotal) |
| Water | Based on meter reading (old reading, new reading, unit price, subtotal) |
| Sanitation | Based on actual number of occupants in the month — **required for all rooms** |
| Motorbike parking | Based on vehicle count entered by the manager at invoice creation — **required for all rooms** |
| Bicycle parking | Based on vehicle count entered by the manager at invoice creation — **required for all rooms** |
| Previous balance | Unpaid amount from the previous month's invoice (0 if none) |
| **Total** | Sum of all items above |

- The landlord reads electricity and water meters for each room at the **end of each month** then creates invoices.
- Customers must pay **within 1 week** of receiving the invoice.
- **No interest** is applied for late payment; instead, the contract cancellation rule applies (see section 3.5).
- New meter readings must be **greater than or equal to** old readings; the system shows an error for invalid input.

### 3.4 Payments
- An invoice must be paid **in full in a single payment**; partial payments are not accepted.
- When the customer pays, the manager records the **payment method** (cash or bank transfer); for bank transfers, a transaction reference can optionally be entered for reconciliation.
- The system updates the invoice status to "Paid" and records the payment date.

### 3.5 Contract Cancellation
- The manager can cancel a contract when a customer **has not paid for 2 or more consecutive months**.
- Upon cancellation: the full deposit is forfeited, the system prints a cancellation record, and the room returns to "Vacant".
- When a customer rents multiple rooms, cancelling one room's contract **does not affect** the other contracts of the same customer.

### 3.6 Operating Costs
- The manager can record **operating costs** by month: total utility bills paid to providers, common area repair costs, and other expenses.
- Operating costs are used to calculate **actual profit** in the statistics module: Profit = Revenue − Operating Costs.
- Operating costs are **not directly linked** to customer invoices; they are used solely for internal reporting.

---

## 4. Functional Modules

| Module | Description |
|---|---|
| **4.1 Area Management** | Add, edit, delete areas; view room list by area |
| **4.2 Room Information Management** | Add, edit, delete room and room type info; view rent price history per room |
| **4.3 Customer Management** | View customer list, search, view rental history and debt breakdown per room per customer |
| **4.4 Deposit & Room Hold** | Record a deposit before contract signing; change room status to "Deposited" |
| **4.5 Rental Contract Creation** | Find a vacant or deposited room, enter customer info, create and print the contract |
| **4.6 Contract Renewal** | Update the expiry date; save renewal history |
| **4.7 Monthly Invoice Generation** | Enter meter readings and vehicle counts; calculate and print monthly invoices |
| **4.8 Monthly Payment Processing** | Look up and confirm invoice payment; record payment method |
| **4.9 Revenue & Profit Statistics** | Statistics by month/quarter/year; show revenue, costs, and profit when cost data is available |
| **4.10 Contract Settlement** | Close a contract, calculate deposit refund, print settlement record; supports selecting the correct room when a customer rents multiple rooms |
| **4.11 Contract Cancellation** | Cancel contract due to payment breach, forfeit deposit, print cancellation record |
| **4.12 Room Occupant Management** | Track actual occupants per room to accurately calculate sanitation charges |
| **4.13 Service Price Management** | Update and maintain service price history per room type |
| **4.14 Alerts & Dashboard Overview** | Dashboard showing overall KPIs (occupancy rate, monthly revenue, etc.) and real-time alerts |
| **4.15 Advanced Reports** | Occupancy, debt, and revenue reports by area/room; Excel/PDF export |
| **4.16 Maintenance & Repair Management** | Record and track incidents and maintenance costs per room |
| **4.17 Contract List & Search** | View all contracts (active / settled / cancelled), filter and search |
| **4.18 Operating Cost Management** | Record total utility bills, common repairs, and other monthly expenses |

---

## 5. Non-Functional Requirements

| # | Requirement |
|---|---|
| NFR-1 | The system stores all data in a database. |
| NFR-2 | The system supports printing contracts, settlement records, cancellation records, and invoices. |
| NFR-3 | The UI supports room search by name (substring/keyword search). |
| NFR-4 | The system automatically detects and alerts when a customer has unpaid invoices for ≥ 2 consecutive months. |
| NFR-5 | The system saves history of service price changes (by room type) and rent price changes per specific room. |
| NFR-6 | The dashboard displays real-time alerts and overall KPIs when the manager opens the application. |
| NFR-7 | The system supports exporting reports to Excel / PDF files. |
| NFR-8 | The system is an **internal web application** built on React (frontend), Node.js/Express (backend), MongoDB (database); runs on a LAN, requires no internet connection. |
| NFR-9 | The system supports manual data backup and restore. |
| NFR-10 | Response time for standard lookup operations must not exceed 3 seconds. |
| NFR-11 | All deletions of important data (rooms, contracts, areas) must require a second confirmation before proceeding. |
