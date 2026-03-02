# Folder 01 - Auth Provisioning (Role Creation) - Detail Request Per Role

Dokumen ini mencatat detail request Postman untuk folder:

- `01 - Auth Provisioning (Role Creation)`

Catatan:

- Status update saat ini sudah mencakup role `Admin / Programmer` dan `Owner`.
- Role lain (`Principal`, `Company`, `Customer`) akan ditambahkan bertahap.

---

## Role: Admin / Programmer

### 1. POST HP - Create Principal

1. Nama Request: `POST HP - Create Principal`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{admin_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "principal.admin.demo01@pms.local",
  "username": "principal_admin_demo01",
  "phoneNumber": "081100001101",
  "orgName": "PT Principal Demo 01",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response (opsional):
```javascript
const j = pm.response.json();
pm.environment.set("principal_user_id", j.userId);
pm.environment.set("principal_org_id", j.orgId);
if (j.inviteToken) pm.environment.set("principal_invite_token", j.inviteToken);
```
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 2. POST HP - Create Company

1. Nama Request: `POST HP - Create Company`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{admin_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "company.admin.demo01@pms.local",
  "username": "company_admin_demo01",
  "phoneNumber": "081100001102",
  "orgName": "PT Company Demo 01",
  "parentOrgId": "{{principal_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response (opsional):
```javascript
const j = pm.response.json();
pm.environment.set("company_user_id", j.userId);
pm.environment.set("company_org_id", j.orgId);
if (j.inviteToken) pm.environment.set("company_invite_token", j.inviteToken);
```
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 3. POST HP - Create Customer

1. Nama Request: `POST HP - Create Customer`  
2. URL: `{{base_url}}/auth/provisioning/customers`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{admin_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "customer.admin.demo01@pms.local",
  "username": "customer_admin_demo01",
  "phoneNumber": "081100001103",
  "orgName": "PT Customer Demo 01",
  "parentOrgId": "{{company_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 4. POST NG - Missing x-actor-user-id

1. Nama Request: `POST NG - Missing x-actor-user-id`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "principal.ng.missing.actor@pms.local",
  "username": "principal_ng_missing_actor",
  "phoneNumber": "081100001104",
  "orgName": "PT NG Missing Actor",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 5. POST NG - Forbidden role

1. Nama Request: `POST NG - Forbidden role`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "company.ng.forbidden@pms.local",
  "username": "company_ng_forbidden",
  "phoneNumber": "081100001105",
  "orgName": "PT NG Forbidden",
  "parentOrgId": "{{principal_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 6. POST NG - Invalid parentOrgId

1. Nama Request: `POST NG - Invalid parentOrgId`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{admin_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "principal.ng.invalid.parent@pms.local",
  "username": "principal_ng_invalid_parent",
  "phoneNumber": "081100001106",
  "orgName": "PT NG Invalid Parent",
  "parentOrgId": "{{unknown_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 7. POST NG - Wrong parent type

1. Nama Request: `POST NG - Wrong parent type`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{admin_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "company.ng.wrong.parent.type@pms.local",
  "username": "company_ng_wrong_parent_type",
  "phoneNumber": "081100001107",
  "orgName": "PT NG Wrong Parent Type",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 8. POST NG - Duplicate email/username/phone

1. Nama Request: `POST NG - Duplicate email/username/phone`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{admin_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "principal.admin.demo01@pms.local",
  "username": "principal_admin_demo01",
  "phoneNumber": "081100001101",
  "orgName": "PT Principal Demo 01 Duplicate",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

## Role: Owner

### 1. POST HP - Create Principal (Owner)

1. Nama Request: `POST HP - Create Principal (Owner)`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{owner_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "principal.owner.demo11@pms.local",
  "username": "principal_owner_demo11",
  "phoneNumber": "081100002211",
  "orgName": "PT Principal Owner Demo 11",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response (opsional):
```javascript
const j = pm.response.json();
pm.environment.set("principal_user_id", j.userId);
pm.environment.set("principal_org_id", j.orgId);
if (j.inviteToken) pm.environment.set("principal_invite_token", j.inviteToken);
```
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 2. POST HP - Create Company (Owner)

1. Nama Request: `POST HP - Create Company (Owner)`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{owner_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "company.owner.demo11@pms.local",
  "username": "company_owner_demo11",
  "phoneNumber": "081100002212",
  "orgName": "PT Company Owner Demo 11",
  "parentOrgId": "{{principal_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response (opsional):
```javascript
const j = pm.response.json();
pm.environment.set("company_user_id", j.userId);
pm.environment.set("company_org_id", j.orgId);
if (j.inviteToken) pm.environment.set("company_invite_token", j.inviteToken);
```
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 3. POST NG - Create Customer (Owner Forbidden)

1. Nama Request: `POST NG - Create Customer (Owner Forbidden)`  
2. URL: `{{base_url}}/auth/provisioning/customers`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{owner_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "customer.owner.ng11@pms.local",
  "username": "customer_owner_ng11",
  "phoneNumber": "081100002213",
  "orgName": "PT Customer Owner NG 11",
  "parentOrgId": "{{company_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 4. POST NG - Missing x-actor-user-id

1. Nama Request: `POST NG - Missing x-actor-user-id`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "principal.owner.missing.actor11@pms.local",
  "username": "principal_owner_missing_actor11",
  "phoneNumber": "081100002214",
  "orgName": "PT Owner Missing Actor 11",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 5. POST NG - Forbidden role

1. Nama Request: `POST NG - Forbidden role`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "company.ng.forbidden.owner11@pms.local",
  "username": "company_ng_forbidden_owner11",
  "phoneNumber": "081100002215",
  "orgName": "PT NG Forbidden Owner 11",
  "parentOrgId": "{{principal_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 6. POST NG - Invalid parentOrgId

1. Nama Request: `POST NG - Invalid parentOrgId`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{owner_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "principal.owner.invalid.parent11@pms.local",
  "username": "principal_owner_invalid_parent11",
  "phoneNumber": "081100002216",
  "orgName": "PT Owner Invalid Parent 11",
  "parentOrgId": "{{unknown_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 7. POST NG - Wrong parent type

1. Nama Request: `POST NG - Wrong parent type`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{owner_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "company.owner.wrong.parent.type11@pms.local",
  "username": "company_owner_wrong_parent_type11",
  "phoneNumber": "081100002217",
  "orgName": "PT Owner Wrong Parent Type 11",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 8. POST NG - Duplicate email/username/phone

1. Nama Request: `POST NG - Duplicate email/username/phone`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{owner_user_id}}`
   - `x-actor-org-id: {{owner_org_id}}`
4. Body:
```json
{
  "email": "principal.owner.demo11@pms.local",
  "username": "principal_owner_demo11",
  "phoneNumber": "081100002211",
  "orgName": "PT Principal Owner Demo 11",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

## Role: Principal

### 1. POST NG - Create Principal (Principal Forbidden)

1. Nama Request: `POST NG - Create Principal (Principal Forbidden)`  
2. URL: `{{base_url}}/auth/provisioning/principals`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "principal.principal.ng31@pms.local",
  "username": "principal_principal_ng31",
  "phoneNumber": "081100003301",
  "orgName": "PT Principal Principal NG 31",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 2. POST NG - Create Company (Principal Forbidden)

1. Nama Request: `POST NG - Create Company (Principal Forbidden)`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "company.principal.ng31@pms.local",
  "username": "company_principal_ng31",
  "phoneNumber": "081100003302",
  "orgName": "PT Company Principal NG 31",
  "parentOrgId": "{{principal_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 3. POST NG - Create Customer (Principal Forbidden)

1. Nama Request: `POST NG - Create Customer (Principal Forbidden)`  
2. URL: `{{base_url}}/auth/provisioning/customers`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "customer.principal.ng31@pms.local",
  "username": "customer_principal_ng31",
  "phoneNumber": "081100003303",
  "orgName": "PT Customer Principal NG 31",
  "parentOrgId": "{{company_org_id}}" 
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 4. POST NG - Missing x-actor-user-id (Principal Case)

1. Nama Request: `POST NG - Missing x-actor-user-id (Principal Case)`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "company.principal.missing.actor31@pms.local",
  "username": "company_principal_missing_actor31",
  "phoneNumber": "081100003304",
  "orgName": "PT Principal Missing Actor 31",
  "parentOrgId": "{{principal_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 5. POST NG - Forbidden role (Principal Baseline)

1. Nama Request: `POST NG - Forbidden role (Principal Baseline)`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "company.principal.forbidden31@pms.local",
  "username": "company_principal_forbidden31",
  "phoneNumber": "081100003305",
  "orgName": "PT Principal Forbidden 31",
  "parentOrgId": "{{principal_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 6. POST NG - Invalid parentOrgId (Principal Case)

1. Nama Request: `POST NG - Invalid parentOrgId (Principal Case)`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "company.principal.invalid.parent31@pms.local",
  "username": "company_principal_invalid_parent31",
  "phoneNumber": "081100003306",
  "orgName": "PT Principal Invalid Parent 31",
  "parentOrgId": "{{unknown_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 7. POST NG - Wrong parent type (Principal Case)

1. Nama Request: `POST NG - Wrong parent type (Principal Case)`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "company.principal.wrong.parent31@pms.local",
  "username": "company_principal_wrong_parent31",
  "phoneNumber": "081100003307",
  "orgName": "PT Principal Wrong Parent 31",
  "parentOrgId": "{{owner_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

### 8. POST NG - Duplicate email/username/phone (Principal Case)

1. Nama Request: `POST NG - Duplicate email/username/phone (Principal Case)`  
2. URL: `{{base_url}}/auth/provisioning/companies`  
3. Headers:
   - `Content-Type: application/json`
   - `x-actor-user-id: {{principal_user_id}}`
   - `x-actor-org-id: {{principal_org_id}}`
4. Body:
```json
{
  "email": "company.principal.ng31@pms.local",
  "username": "company_principal_ng31",
  "phoneNumber": "081100003302",
  "orgName": "PT Company Principal NG 31 Duplicate",
  "parentOrgId": "{{principal_org_id}}"
}
```
5. Post / Pre Response:
   - Pre-request: Tidak ada
   - Post-response: Tidak ada
6. Apakah request sudah dibuat? Jawaban: `Sudah`  
7. Apakah request sudah ditesting? Jawaban: `Belum`  

---

## Role: Company

Status dokumentasi detail request: `Belum`

## Role: Customer

Status dokumentasi detail request: `Belum`
