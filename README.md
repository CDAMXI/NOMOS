# NOMOS

Personal finance tracker: monthly expenses, incomes and net worth, in the spirit of the
original mockups. Layered .NET architecture with a web front end served by the API itself.
Multi-user: cookie login, per-user data, editable profile with avatar, and a **Supabase
(PostgreSQL)** database.

## Architecture

```
Nomos.Domain          Entities: User, Category, Expense, Income, Account, NetWorthSnapshot. No dependencies.
Nomos.Application     DTOs, repository interfaces, PBKDF2 hashing, auto-icon picker, business services
                      (AuthService, CategoryService, ExpenseService, IncomeService, NetWorthService).
Nomos.Infrastructure  EF Core + Npgsql (PostgreSQL): NomosDbContext, repositories, migrations, DbSeeder, DI.
Nomos.Api             ASP.NET Core minimal API + cookie auth + static front end (wwwroot).
```

Dependency flow: `Api → Infrastructure → Application → Domain`.

## Database (Supabase / PostgreSQL)

Hosted on Supabase project **`nomos`** (ref `pwcggulwqgpizlbaoory`, region eu-west-3).
The schema is managed with **EF Core migrations** (`Nomos.Infrastructure/Migrations`); the app
runs `Database.Migrate()` on startup and seeds a demo user on first run. Every row carries a
`UserId`; all queries are scoped to the signed-in user. Row Level Security is enabled on all
tables so the public Supabase Data API cannot read the data — only the backend, which connects
as the `postgres` pooler role (bypasses RLS).

**Demo user**: `demo` / `demo123`.

### Connection string

The app reads connection string `Nomos` from configuration. It lives in
`Nomos.Api/appsettings.Development.json` (git-ignored — it holds the Supabase DB password):

```json
{
  "ConnectionStrings": {
    "Nomos": "Host=aws-0-eu-west-3.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.pwcggulwqgpizlbaoory;Password=<DB_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true"
  }
}
```

Use the **Session pooler** host (IPv4). Get/reset the password in the Supabase dashboard:
Project Settings → Database → *Reset database password*.

## Run

```
dotnet run --project Nomos.Api --urls http://localhost:5210
```

Then open http://localhost:5210 and log in (or register a new account).

## API

| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/register | `{username, password, photoDataUrl?}` → session cookie (+ default categories) |
| POST | /api/auth/login | `{username, password}` → session cookie |
| POST | /api/auth/logout | End session |
| GET | /api/auth/me | Current user |
| PUT | /api/auth/profile | `{username?, photoDataUrl?}` |
| PUT | /api/auth/password | `{currentPassword, newPassword}` |
| GET | /api/categories | The user's categories |
| POST / PUT / DELETE | /api/categories[/{id}] | Create / edit / delete a category (icon auto-derived from the name) |
| GET | /api/transactions | All movements (expenses + incomes) merged, newest first |
| GET | /api/expenses/dashboard?days=30 | Month totals, delta, income total, series, by-category, recent |
| POST / PUT / DELETE | /api/expenses[/{id}] | Create / edit / delete an expense |
| POST / PUT / DELETE | /api/incomes[/{id}] | Create / edit / delete an income |
| GET | /api/networth | Net worth, assets/liabilities, annual series, accounts |
| POST / PUT / DELETE | /api/accounts[/{id}] | Create / update / delete an account |

## Front end

Single page, no frameworks or CDNs. Login/register screen (with avatar picker), two views
(Gastos / Patrimonio), profile sheet (rename, change photo, change password, **manage
categories**, logout), full-screen sheets with a numeric keypad for new/edited movements
(Gasto ↔ Ingreso toggle, category chips, date field) and accounts, hand-rolled SVG charts,
persisted dark mode. Dates are shown as **DD/MM/YYYY**. Tap any row in "Recientes" / "Ver todo"
to edit or delete it. Creating or editing a category auto-picks an emoji icon from its name.
# NOMOS
