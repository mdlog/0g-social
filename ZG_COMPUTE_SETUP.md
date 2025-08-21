# 🔧 Setup Manual 0G Compute - Panduan Lengkap

## Status Saat Ini
- ✅ SDK 0G Compute telah dikonfigurasi dengan benar
- ✅ Private key wallet sudah terpasang  
- ✅ Koneksi ke 0G Network berhasil
- ⚠️ Akun 0G Compute belum dibuat (perlu manual setup)

## Mengapa Manual Setup Diperlukan?
SDK 0G Compute memiliki issue internal dengan fungsi `toFixed` yang menyebabkan error saat membuat akun otomatis. Manual setup adalah solusi yang pasti berhasil.

## 🚀 Langkah Setup Manual

### Opsi 1: Via Terminal/Command Prompt

1. **Buka Terminal** (Windows: Command Prompt, Mac/Linux: Terminal)

2. **Jalankan perintah sesuai OS Anda:**

**Windows:**
```cmd
curl -X POST -H "Content-Type: application/json" -d "{\"action\":\"add_account\",\"amount\":\"0.1\"}" http://localhost:8080/ledger
```

**Mac/Linux:**
```bash
curl -X POST -H 'Content-Type: application/json' -d '{"action":"add_account","amount":"0.1"}' http://localhost:8080/ledger
```

3. **Tunggu respon dari server** (biasanya 5-10 detik)

4. **Refresh halaman DeSocialAI** untuk melihat status terbaru

### Opsi 2: Via Browser Console

1. **Buka Developer Console** (tekan F12)
2. **Masuk ke tab Console**
3. **Jalankan kode berikut:**

```javascript
// Setup 0G Compute Account via Browser
fetch('/api/zg/compute/manual-setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: '0.1' })
})
.then(res => res.json())
.then(data => {
  console.log('Setup Result:', data);
  if (data.success) {
    alert('✅ 0G Compute account berhasil dibuat!');
    window.location.reload();
  }
});
```

### Opsi 3: Tunggu Mainnet Launch

Jika manual setup tidak berhasil, sistem DeSocialAI akan otomatis menggunakan mode simulasi yang tetap memberikan pengalaman Personal AI Feed yang optimal. 

Mode autentik 0G Compute akan tersedia penuh saat mainnet diluncurkan (Q2-Q3 2025).

## ✅ Verifikasi Setup Berhasil

Setelah menjalankan salah satu opsi di atas:

1. **Refresh halaman DeSocialAI**
2. **Cek Personal AI Feed** - harusnya muncul badge "0G NETWORK" 
3. **Lihat status**: "Connected to authentic 0G Compute"
4. **Personal AI Feed** menggunakan model LLaMA 3.3 70B dari 0G Compute

## 🔍 Troubleshooting

**Error "Connection refused":**
- Pastikan server DeSocialAI sedang berjalan (npm run dev)

**Error "Private key not found":**  
- Hubungi developer untuk konfigurasi ZG_PRIVATE_KEY

**Setup berhasil tapi masih simulation:**
- Tunggu 2-3 menit untuk konfirmasi blockchain
- Refresh halaman beberapa kali

## 💡 Catatan Penting

- Setup ini hanya perlu dilakukan sekali
- Account akan permanent tersimpan di blockchain 0G  
- Minimal deposit 0.1 OG untuk aktivasi
- Mode simulasi tetap memberikan pengalaman AI yang berkualitas

## 📞 Bantuan

Jika masih mengalami masalah, screenshot error message dan tanyakan ke developer.

---

**DeSocialAI - Truly Decentralized Social Media Platform**