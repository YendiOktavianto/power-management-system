# Permission Matrix

Catatan:
- Owner testing memiliki permission yang sama dengan Owner.
- "ALL" artinya akses ke seluruh organisasi, "BRANCH" akses ke cabang sendiri, "CUSTOMERS" akses ke customer di bawah company, "OWN" akses hanya ke milik sendiri.

| Capability | Admin | Owner | Principal | Company | Customer |
| --- | --- | --- | --- | --- | --- |
| Manage org tree (create/update Principal, Company, Customer) | ALL | ALL | BRANCH | CUSTOMERS | NO |
| Manage users within scope | ALL | ALL | BRANCH | CUSTOMERS | NO |
| Manage devices (assign/unassign) | ALL | ALL | BRANCH | CUSTOMERS | NO |
| View devices data within scope | ALL | ALL | BRANCH | CUSTOMERS | OWN |
| View reports/summary within scope | ALL | ALL | BRANCH | CUSTOMERS | OWN |
