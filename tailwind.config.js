/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#111827',      // สีพื้นหลังหลัก (เทาเข้ม-น้ำเงิน)
        'brand-surface': '#1F2937', // สีพื้นผิวของ component (เทาเข้ม)
        'brand-surface-light': '#374151', // สีพื้นผิวสว่าง (สำหรับ hover)
        'brand-primary': '#FBBF24', // สีหลักสำหรับเน้น (สีเหลืองอำพัน)
        'brand-secondary': '#38BDF8', // สีรอง (สีฟ้า)
        'brand-danger': '#F87171',   // สีสำหรับแจ้งเตือน/ลบ (สีแดง)
      },
    },
  },
  plugins: [],
};