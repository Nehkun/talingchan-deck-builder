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
        'brand-bg': '#0D1117',        // พื้นหลังหลัก (ดำ)
        'brand-surface': '#161B22',   // พื้นผิว component (เทาเข้ม)
        'brand-border': '#30363D',    // สีขอบ (เทา)
        'brand-primary': '#F7B32B',   // สีหลัก (เหลืองทอง)
        'brand-secondary': '#38BDF8',  // สีรอง (ฟ้า)
        'brand-danger': '#E54B4B',     // สีสำหรับลบ (แดง)
        'brand-text': '#C9D1D9',       // สีข้อความหลัก (ขาวนวล)
        'brand-text-muted': '#8B949E', // สีข้อความรอง (เทา)
      },
    },
  },
  plugins: [],
};