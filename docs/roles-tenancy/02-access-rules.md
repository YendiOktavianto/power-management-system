# Access Rules

Dokumen ini menjelaskan aturan akses per role berdasarkan hirarki organisasi.

## Aturan Umum

- Admin bersifat global: bisa mengakses semua organisasi dan data.
- Owner bisa mengakses seluruh cabang di bawah Owner.
- Principal hanya mengakses cabang miliknya.
- Company hanya mengakses Customer yang berada di bawahnya.
- Customer hanya mengakses device miliknya sendiri.
- Akun Admin tidak tersedia via registrasi; dibuat manual oleh developer.

## Aturan Per Role

Admin (Developer)
- Akses penuh ke seluruh data dan organisasi.
- Mengelola akun Admin lain jika diperlukan.

Owner
- Akses penuh ke seluruh data dalam organisasi Owner dan turunannya.
- Dapat membuat/mengelola Principal, Company, dan Customer.
- Dapat melihat dan mengelola semua device pada scope Owner.
- Akun Owner testing memiliki akses yang sama dengan Owner, dipakai untuk demo/marketing saat Customer belum ada.

Principal
- Dapat mengelola Company dan Customer pada branch miliknya.
- Dapat melihat device yang berada dalam branch tersebut.

Company
- Dapat mengelola Customer yang berada di bawah Company.
- Dapat melihat device milik Customer pada scope Company.

Customer
- Hanya dapat melihat device miliknya sendiri (bisa lebih dari satu device).
