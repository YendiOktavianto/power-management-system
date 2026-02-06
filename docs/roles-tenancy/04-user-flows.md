# User Flows (High Level)

## 1) Admin & Owner Provisioning
- Admin dan Owner dibuat dari awal (seed/provisioning) dan jumlahnya fixed.
- Tidak ada proses registrasi Admin/Owner di aplikasi.

## 2) Setup Organisasi oleh Admin/Owner
- Admin/Owner membuat Principal.
- Admin/Owner membuat Company di bawah Principal.
- Company membuat Customer di bawahnya.
- Owner/Principal/Company melakukan assign device ke Customer (sesuai scope).

## 3) Operasional Principal
- Principal mengelola Company dan Customer pada branch miliknya.
- Principal memantau device pada scope branch tersebut.

## 4) Operasional Company
- Company membuat dan mengelola Customer yang berada di bawahnya.
- Company memantau device milik Customer di bawahnya.

## 5) Customer Monitoring
- Customer login dan melihat device miliknya saja.
- Jika ada lebih dari satu device, Customer melihat semuanya pada satu akun.

## 6) Demo/Testing (Owner Testing Account)
- Owner testing account dipakai untuk demo hardware saat Customer belum membeli.
- Data demo dapat dipakai untuk kebutuhan logger dan summary marketing.
 
