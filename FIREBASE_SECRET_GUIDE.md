# 🔐 Somiti 360 - Firebase Configuration for GitHub CI/CD

If your GitHub Actions build fails with:
`File google-services.json is missing. The Google Services Plugin cannot function without it.`

Follow these steps to store your `google-services.json` securely as a GitHub Secret.

---

### 1. GitHub Secrets এ `GOOGLE_SERVICES_JSON` যোগ করার নিয়ম

1. আপনার গিটহাব রিপোজিটরিতে যান: **GitHub Repo** ➜ **Settings**
2. বাম পাশের মেনু থেকে: **Secrets and variables** ➜ **Actions**
3. **New repository secret** বাটনে ক্লিক করুন।
4. **Name**: 
   ```text
   GOOGLE_SERVICES_JSON
   ```
5. **Secret (Value)**: নিচের পুরো JSON টেক্সটটি কপি করে পেস্ট করুন:

```json
{
  "project_info": {
    "project_number": "364340009000",
    "project_id": "hisabkitab-360-backup-511708",
    "storage_bucket": "hisabkitab-360-backup-511708.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:364340009000:android:045144121c3b435827bd1d",
        "android_client_info": {
          "package_name": "com.aistudio.somiti360.bxmpzq"
        }
      },
      "oauth_client": [
        {
          "client_id": "364340009000-6j25sr4eupkg52dv31d6vaf68unaq12h.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.aistudio.somiti360.bxmpzq",
            "certificate_hash": "ea32644d76fefcc635bcf02e1dda5e0d872cf1a7"
          }
        },
        {
          "client_id": "364340009000-rnu9nuvjuga5jj295u28b16d9u4fhbsh.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "AIzaSyD8kDuzz6SUig8L0K8iU1pBDdEP2oGdego"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": [
            {
              "client_id": "364340009000-r85tnfahp2i5l9a8v2ng6m2t4t15usqm.apps.googleusercontent.com",
              "client_type": 3
            }
          ]
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

6. **Add secret** বাটনে ক্লিক করুন।

---

### বিকল্প: Base64 ফরম্যাট (ঐচ্ছিক)
যদি আপনি এক লাইনের Base64 হিসেবে সেভ করতে চান, তবে Secret Name দিন `GOOGLE_SERVICES_BASE64` এবং ভ্যালু দিন:
```text
ewogICJwcm9qZWN0X2luZm8iOiB7CiAgICAicHJvamVjdF9udW1iZXIiOiAiMzY0MzQwMDA5MDAwIiwKICAgICJwcm9qZWN0X2lkIjogImhpc2Fia2l0YWItMzYwLWJhY2t1cC01MTE3MDgiLAogICAgInN0b3JhZ2VfYnVja2V0IjogImhpc2Fia2l0YWItMzYwLWJhY2t1cC01MTE3MDguZmlyZWJhc2VzdG9yYWdlLmFwcCIKICB9LAogICJjbGllbnQiOiBbCiAgICB7CiAgICAgICJjbGllbnRfaW5mbyI6IHsKICAgICAgICAibW9iaWxlc2RrX2FwcF9pZCI6ICIxOjM2NDM0MDAwOTAwMDphbmRyb2lkOjA0NTE0NDEyMWMzYjQzNTgyN2JkMWQiLAogICAgICAgICJhbmRyb2lkX2NsaWVudF9pbmZvIjogewogICAgICAgICAgInBhY2thZ2VfbmFtZSI6ICJjb20uYWlzdHVkaW8uc29taXRpMzYwLmJ4bXB6cSIKICAgICAgICB9CiAgICAgIH0sCiAgICAgICJvYXV0aF9jbGllbnQiOiBbCiAgICAgICAgewogICAgICAgICAgImNsaWVudF9pZCI6ICIzNjQzNDAwMDkwMDAtNmoyNXNyNGV1cGtnNTJkdjMxZDZ2YWY2OHVuYXExMmguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLAogICAgICAgICAgImNsaWVudF90eXBlIjogMSwKICAgICAgICAgICJhbmRyb2lkX2luZm8iOiB7CiAgICAgICAgICAgICJwYWNrYWdlX25hbWUiOiAiY29tLmFpc3R1ZGlvLnNvbWl0aTM2MC5ieG1wenEiLAogICAgICAgICAgICAiY2VydGlmaWNhdGVfaGFzaCI6ICJlYTMyNjQ0ZDc2ZmVmY2M2MzViY2YwMmUxZGRhNWUwZDg3MmNmMWE3IgogICAgICAgICAgfQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgImNsaWVudF9pZCI6ICIzNjQzNDAwMDkwMDAtcm51OW51dmp1Z2E1amoyOTV1MjhiMTZkOXU0Zmhic2guYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLAogICAgICAgICAgImNsaWVudF90eXBlIjogMwogICAgICAgIH0KICAgICAgXSwKICAgICAgImFwaV9rZXkiOiBbCiAgICAgICAgewogICAgICAgICAgImN1cnJlbnRfa2V5IjogIkFJemFTeUQ4a0R1eno2U1VpZzhMMEs4aVUxcEJEZEVQMm9HZGVnbyIKICAgICAgICB9CiAgICAgIF0sCiAgICAgICJzZXJ2aWNlcyI6IHsKICAgICAgICAiYXBwaW52aXRlX3NlcnZpY2UiOiB7CiAgICAgICAgICAib3RoZXJfcGxhdGZvcm1fb2F1dGhfY2xpZW50IjogWwogICAgICAgICAgICB7CiAgICAgICAgICAgICAgImNsaWVudF9pZCI6ICIzNjQzNDAwMDkwMDAtcjg1dG5mYWhwMmk1bDlhOHYybmc2bTJ0NHQxNXVzcW0uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLAogICAgICAgICAgICAgICJjbGllbnRfdHlwZSI6IDMKICAgICAgICAgICAgfQogICAgICAgICAgXQogICAgICAgIH0KICAgICAgfQogICAgfQogIF0sCiAgImNvbmZpZ3VyYXRpb25fdmVyc2lvbiI6ICIxIgp9
```

---

### 2. গিটহাব অ্যাকশনস ওয়ার্কফ্লো কিভাবে এটা হ্যান্ডেল করছে:
`.github/workflows/build-and-release.yml`-এ আমরা স্বয়ংক্রিয় ৩-স্তরীয় (3-Tier) ইনজেকশন যুক্ত করেছি:
1. **প্রথম পছন্দ:** যদি `${{ secrets.GOOGLE_SERVICES_JSON }}` থাকে, তা সরাসরি ডিকোড ও ভ্যালিডেট করে `app/google-services.json`-এ ইনজেক্ট করে।
2. **দ্বিতীয় পছন্দ:** যদি রিপোজিটরির ভেতর অলরেডি `app/google-services.json` ফাইলটি থাকে, তা ব্যবহার করে।
3. **তৃতীয় সুরক্ষা (Fallback):** যদি সিক্রেট বা রিপো কোনোটিতেই না পাওয়া যায়, তবে ওয়ার্কফ্লো নিজে থেকেই সমিতির নির্ধারিত ফায়ারবেস কনফিগারেশন ইনজেক্ট করে বিল্ড চালিয়ে নেয়—ফলে বিল্ড কখনো ফেইল হবে না।
