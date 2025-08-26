# 0G DA Client Setup Instructions

## Implementasi 0G Data Availability pada DeSocialAI

Berdasarkan dokumentasi resmi yang Anda berikan, berikut adalah instruksi lengkap untuk mengintegrasikan 0G DA ke dalam aplikasi DeSocialAI.

## 1. Setup DA Client Node dengan Docker

### Siapkan file .env:
```bash
COMBINED_SERVER_CHAIN_RPC=https://0g-galileo-testnet.drpc.org/
COMBINED_SERVER_PRIVATE_KEY=YOUR_PRIVATE_KEY
ENTRANCE_CONTRACT_ADDR=0xE75A073dA5bb7b0eC622170Fd268f35E675a957B
GRPC_SERVER_PORT=51001
```

### Jalankan DA Client Node:
```bash
docker run --env-file .env -p 51001:51001 0g-da-client
```

## 2. Konfigurasi Aplikasi

Aplikasi sudah dikonfigurasi dengan implementasi gRPC client yang benar:

- ✅ Dependencies gRPC sudah terinstall: `@grpc/grpc-js`, `@grpc/proto-loader`
- ✅ Proto definition sudah dibuat: `server/proto/da.proto`
- ✅ gRPC client service sudah diimplementasi: `server/services/zg-da-client.ts`
- ✅ Integrasi dengan DA service sudah selesai: `server/services/zg-da.ts`

## 3. Testing Koneksi

Setelah DA Client Node berjalan, aplikasi akan:

1. **Auto-connect** ke gRPC endpoint `localhost:51001`
2. **Submit blob** untuk setiap interaksi sosial (posts, likes, comments)
3. **Retrieve blob** saat diperlukan untuk verifikasi data

## 4. Monitoring Status

Gunakan endpoint berikut untuk monitoring status DA:

- **DA Stats**: `GET /api/zg/da/stats` - Status transaksi dan blob submissions
- **DA Status**: Cek logs untuk konfirmasi koneksi gRPC

## 5. Error Handling

Jika DA Client Node tidak tersedia:

- ❌ **Error Message**: "0G DA Client Node tidak terhubung pada localhost:51001"
- 🔧 **Solusi**: Pastikan Docker container berjalan dan port 51001 terbuka
- 📊 **Fallback**: Data tetap tersimpan di database lokal untuk sinkronisasi kemudian

## 6. Production Deployment

Untuk deployment production:

1. Setup private key yang aman di environment variables
2. Pastikan firewall rules mengizinkan port 51001
3. Monitor logs untuk konfirmasi DA submissions berhasil
4. Implement health checks untuk DA Client Node

## Status Implementasi

✅ **Selesai**: gRPC integration, proto definitions, client service  
✅ **Selesai**: Error handling dan fallback mechanisms  
✅ **Selesai**: Real blob submission dan retrieval  
🔄 **Menunggu**: DA Client Node Docker setup dari user  

Setelah DA Client Node berjalan, semua social interactions akan otomatis tersimpan di 0G DA network dengan transparansi dan verifikasi blockchain penuh.