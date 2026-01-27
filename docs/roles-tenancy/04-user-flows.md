# User Flows (High Level)

## 1) Admin Provisioning
- Developer membuat akun Admin secara manual (seed/provisioning).
- Tidak ada proses registrasi Admin di aplikasi.

## 2) Setup Organisasi oleh Owner
- Owner membuat Principal.
- Owner membuat Company di bawah Principal.
- Owner membuat Customer di bawah Company.
- Owner atau Principal melakukan assign device ke Customer.

## 3) Operasional Principal
- Principal mengelola Company dan Customer pada branch miliknya.
- Principal memantau device pada scope branch tersebut.

## 4) Operasional Company
- Company membuat dan mengelola Customer yang mereka reach.
- Company memantau device milik Customer di bawahnya.

## 5) Customer Monitoring
- Customer login dan melihat device miliknya saja.
- Jika ada lebih dari satu device, Customer melihat semuanya pada satu akun.

## 6) Demo/Testing (Owner Testing Account)
- Owner testing account dipakai untuk demo hardware saat Customer belum membeli.
- Data demo dapat dipakai untuk kebutuhan logger dan summary marketing.
