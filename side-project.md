現在開發一個 web 應用，功能是管理一個月經週期。
- 使用 TS, React, Next.js, Tailwind, shadcn/ui 做開發。
- 樣式以灰階為主，像 shadcn/ui 基本樣式。
- 只支援手機版
- 下排有控制按鈕，歷史、主頁面。
- 主頁面顯示 今天內容 還有多久 下一個月經，如果正在月經中，顯示 還有多久 結束。
- 經期未開始時，有按鈕可以新增月經 開始日期、經期開始，有按鈕可以設定月經 結束日期。
- 歷史頁面顯示一個日曆，可以看過去的月經週期。可以修改月經週期。

- 使用以下 Period 資料做為資料來源，將資料放在 datas/period.json 檔案儲存。

```
[
  { "date": "2022-11-06", "event": "Starts" },
  { "date": "2022-11-12", "event": "Ends" },
  { "date": "2022-12-04", "event": "Starts" },
  { "date": "2022-12-10", "event": "Ends" },

  { "date": "2023-01-08", "event": "Starts" },
  { "date": "2023-01-14", "event": "Ends" },
  { "date": "2023-02-20", "event": "Starts" },
  { "date": "2023-02-26", "event": "Ends" },
  { "date": "2023-03-28", "event": "Starts" },
  { "date": "2023-04-03", "event": "Ends" },
  { "date": "2023-05-02", "event": "Starts" },
  { "date": "2023-05-08", "event": "Ends" },
  { "date": "2023-07-08", "event": "Starts" },
  { "date": "2023-07-14", "event": "Ends" },
  { "date": "2023-08-10", "event": "Starts" },
  { "date": "2023-08-16", "event": "Ends" },
  { "date": "2023-09-13", "event": "Starts" },
  { "date": "2023-09-19", "event": "Ends" },
  { "date": "2023-11-14", "event": "Starts" },
  { "date": "2023-11-20", "event": "Ends" },
  { "date": "2023-12-19", "event": "Starts" },
  { "date": "2023-12-25", "event": "Ends" },

  { "date": "2024-01-21", "event": "Starts" },
  { "date": "2024-01-27", "event": "Ends" },
  { "date": "2024-02-23", "event": "Starts" },
  { "date": "2024-02-29", "event": "Ends" },
  { "date": "2024-03-28", "event": "Starts" },
  { "date": "2024-04-03", "event": "Ends" },
  { "date": "2024-04-27", "event": "Starts" },
  { "date": "2024-05-03", "event": "Ends" },
  { "date": "2024-05-28", "event": "Starts" },
  { "date": "2024-06-03", "event": "Ends" },
  { "date": "2024-06-29", "event": "Starts" },
  { "date": "2024-07-05", "event": "Ends" },
  { "date": "2024-07-31", "event": "Starts" },
  { "date": "2024-08-06", "event": "Ends" },
  { "date": "2024-09-02", "event": "Starts" },
  { "date": "2024-09-08", "event": "Ends" },
  { "date": "2024-10-02", "event": "Starts" },
  { "date": "2024-10-08", "event": "Ends" },
  { "date": "2024-11-03", "event": "Starts" },
  { "date": "2024-11-09", "event": "Ends" },
  { "date": "2024-12-05", "event": "Starts" },
  { "date": "2024-12-11", "event": "Ends" },

  { "date": "2025-01-03", "event": "Starts" },
  { "date": "2025-01-09", "event": "Ends" },
  { "date": "2025-02-08", "event": "Starts" },
  { "date": "2025-02-14", "event": "Ends" },
  { "date": "2025-05-17", "event": "Starts" },
  { "date": "2025-05-23", "event": "Ends" },
  { "date": "2025-06-17", "event": "Starts" },
  { "date": "2025-06-23", "event": "Ends" },
  { "date": "2025-07-21", "event": "Starts" },
  { "date": "2025-07-27", "event": "Ends" },
  { "date": "2025-08-20", "event": "Starts" },
  { "date": "2025-08-26", "event": "Ends" },
  { "date": "2025-09-18", "event": "Starts" },
  { "date": "2025-09-24", "event": "Ends" },
  { "date": "2025-10-24", "event": "Starts" },
  { "date": "2025-10-30", "event": "Ends" },
  { "date": "2025-11-21", "event": "Starts" },
  { "date": "2025-11-27", "event": "Ends" },
  { "date": "2025-12-20", "event": "Starts" },
  { "date": "2025-12-26", "event": "Ends" },

  { "date": "2026-01-19", "event": "Starts" },
  { "date": "2026-01-25", "event": "Ends" }
]
```