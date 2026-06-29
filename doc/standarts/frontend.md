# 

> **Format:** Each rule is in English (for AI agents to follow precisely). The `→` line under it is the Uzbek explanation (for you). Give agents the English rules; read the Uzbek for understanding.
> 
> 
> **Eslatma:** Har qoida inglizcha (agent aniq amal qilishi uchun). Ostidagi `→` qatori — o'zbekcha izoh (siz uchun). Agentга inglizcha qatorlarni bering.
> 

---

## ALWAYS (minimum, every component)

- [ ]  `[ ]` **No `any` — use a precise type or `unknown`.**
→ `any` TypeScript'ni o'chiradi. `unknown` tekshirishga majbur qiladi.
- [ ]  `[ ]` **Sanitize all user input; protect against XSS.**
→ Foydalanuvchi inputi tozalansin, XSS hujumidan himoyalansin.
- [ ]  `[ ]` **Every async path has error handling (try-catch / .catch).**
→ Har async kodда xato boshqarilsin.
- [ ]  `[ ]` **Handle edge cases: null, undefined, empty array/string/object.**
→ Chekka holatlar ko'rilsin: null, undefined, bo'sh qiymatlar.
- [ ]  `[ ]` **`key` prop must be unique and stable (never index or Math.random).**
→ key unique va barqaror bo'lsin (index emas).
- [ ]  `[ ]` **No magic numbers/strings — use named constants.**
→ Sehrli raqam/satr yo'q — nomlangan konstanta.
- [ ]  `[ ]` *Clear naming (handle, is*/has*, use*, PascalCase components).**
→ Tushunarli nomlash konvensiyasi.

---

## 1. TypeScript

- [ ]  `[ ]` **Enable strict mode in tsconfig (strict: true).**
→ tsconfig'да strict mode yoqilsin.
- [ ]  `[ ]` **noImplicitAny and strictNullChecks must be true.**
→ Bu ikki flag yoqilgan bo'lsin.
- [ ]  `[ ]` **Define all prop types (interface/type).**
→ Barcha prop turlari aniqlansin.
- [ ]  `[ ]` **Declare function return types (void, Promise<T>).**
→ Funksiya return type'i aniqlansin.
- [ ]  `[ ]` **Use generics correctly; avoid over-generic signatures.**
→ Generic'lar to'g'ri ishlatilsin.
- [ ]  `[ ]` **Use type assertion (`as`) only when truly necessary.**
→ `as` faqat zarur bo'lganда — u tekshiruvni o'chiradi.
- [ ]  `[ ]` **Validate API responses at runtime (Zod), not just compile-time types.**
→ API javobini runtime'да Zod bilan tekshir — TS faqat compile-time.

---

## 2. Security (client-side)

- [ ]  `[ ]` **Sanitize input with DOMPurify / sanitize-html.**
→ Input DOMPurify bilan tozalansin.
- [ ]  `[ ]` **Avoid dangerouslySetInnerHTML; if used, sanitize first.**
→ dangerouslySetInnerHTML ishlatilmasin (yoki sanitize qilinsin).
- [ ]  `[ ]` **Filter dangerous tags (iframe, script, object).**
→ Xavfli teglar filtrlansin.
- [ ]  `[ ]` **Limit input length (maxLength).**
→ Input uzunligi cheklansin.
- [ ]  `[ ]` **Keep secrets in env, never hardcoded in code.**
→ Sirlar env'da, kodда hardcode emas.
- [ ]  `[ ]` **Never put sensitive data in URL/query params.**
→ Sensitive ma'lumot URL'да bo'lmasin.
- [ ]  `[ ]` **Set up Content Security Policy (CSP).**
→ CSP o'rnatilsin.
- [ ]  `[ ]` **Use HTTPS.**
→ HTTPS ishlatilsin.
- [ ]  `[ ]` **Correct auth token expiration and refresh logic.**
→ Token muddati va refresh logikasi to'g'ri bo'lsin.
- [ ]  `[ ]` **Check dependencies (npm audit / Dependabot).**
→ Dependency'lar tekshirilsin.

---

## 3. Error Handling

- [ ]  `[ ]` **Set up an Error Boundary (React).**
→ Error Boundary o'rnatilsin.
- [ ]  `[ ]` **Provide fallback UI.**
→ Zaxira ko'rinish (fallback UI) bo'lsin.
- [ ]  `[ ]` **Show user-friendly error messages.**
→ Xato foydalanuvchiga tushunarli ko'rsatilsin.
- [ ]  `[ ]` **Handle network (offline) and timeout states.**
→ Tarmoq (offline) va timeout holatlari ko'rilsin.
- [ ]  `[ ]` **Distinguish Loading / Empty / Error states explicitly.**
→ Loading / Empty / Error holatlari aniq ajratilsin.
- [ ]  `[ ]` **Report errors to monitoring (Sentry, LogRocket).**
→ Xatolar monitoring tizimiga yuborilsin.

---

## 4. Performance (only with a measured reason)

- [ ]  `[ ]` **Use React.memo / useMemo / useCallback only when measured as needed.**
→ Faqat o'lchangan ehtiyoj bo'lganда — premature optimization zarar.
- [ ]  `[ ]` **Use useTransition / useDeferredValue for heavy updates.**
→ Og'ir update'lar uchun.
- [ ]  `[ ]` **Virtualize large lists (react-window).**
→ Katta ro'yxatlar virtualizatsiya qilinsin.
- [ ]  `[ ]` **Code-split with React.lazy + Suspense.**
→ Code splitting qilinsin.
- [ ]  `[ ]` **Debounce/throttle scroll, resize, input.**
→ Debounce/throttle ishlatilsin.
- [ ]  `[ ]` **No unnecessary re-renders in useEffect.**
→ useEffect'да keraksiz re-render yo'q.
- [ ]  `[ ]` **Lazy-load images and components.**
→ Rasm va komponentlar lazy yuklansin.
- [ ]  `[ ]` **Provide skeleton / progressive loading.**
→ Skeleton / progressive loading bo'lsin.
- [ ]  `[ ]` **Optimize image format (WebP/AVIF, srcset).**
→ Rasm formati optimallashtirilsin.
- [ ]  `[ ]` **Optimize font loading (font-display: swap).**
→ Font yuklash optimallashtirilsin.
- [ ]  `[ ]` **Measure Web Vitals (LCP, INP, CLS).**
→ Web Vitals o'lchansin.
- [ ]  `[ ]` **Check bundle size.**
→ Bundle hajmi tekshirilsin.

---

## 5. State Management

- [ ]  `[ ]` **Single source of truth.**
→ Yagona haqiqat manbasi.
- [ ]  `[ ]` **Colocate state (keep it as local as possible).**
→ State imkon qadar mahalliy turilsin.
- [ ]  `[ ]` **Avoid prop drilling (use Context / state manager).**
→ Props drilling'дан qochilsin.
- [ ]  `[ ]` **Local → useState; Global → Context/Redux/Zustand; Server → React Query/SWR.**
→ State turini to'g'ri tanlang.
- [ ]  `[ ]` **Never duplicate server state into useState; derive instead.**
→ Server state'ni useState'ga ko'chirma — derive qil (eski bo'lib qoladi).
- [ ]  `[ ]` **Use immutable updates (spread, Immer).**
→ Immutable yangilash.

---

## 6. Side Effects (useEffect)

- [ ]  `[ ]` **Correct dependency array (all deps included, no infinite loop).**
→ Dependency array to'g'ri, cheksiz loop yo'q.
- [ ]  `[ ]` **Stabilize object/function deps (useMemo/useCallback) or depend on primitives.**
→ Object/function dependency'ni barqarorlashtir yoki primitive'ga ajrat.
- [ ]  `[ ]` **Provide cleanup (listeners, intervals, subscriptions).**
→ Cleanup function bo'lsin.
- [ ]  `[ ]` **No direct async/await in useEffect body (use IIFE/inner fn).**
→ useEffect'да to'g'ridan-to'g'ri async yo'q.
- [ ]  `[ ]` **Cancel stale async results to avoid race conditions.**
→ Eski async natijani bekor qil (race condition'дан himoya).

---

## 7. React-specific

- [ ]  `[ ]` **Follow Rules of Hooks (top-level, React functions only).**
→ Hooks qoidalariga rioya.
- [ ]  `[ ]` **Choose controlled vs uncontrolled deliberately.**
→ Controlled/uncontrolled ongli tanlansin.
- [ ]  `[ ]` **Use refs correctly (useRef, forwardRef).**
→ Ref'lar to'g'ri ishlatilsin.
- [ ]  `[ ]` **Extract reusable logic into custom hooks.**
→ Takrorlanuvchi mantiq custom hook'ga.
- [ ]  `[ ]` **For SSR/RSC, mark "use client" boundary deliberately (leaf components).**
→ SSR'да "use client" chegarasini ongli belgila.

---

## 8. Code Quality

- [ ]  `[ ]` **Use early returns; avoid deep nesting (>3 levels).**
→ Early return; chuqur nesting yo'q.
- [ ]  `[ ]` **Single Responsibility per function/module.**
→ Bir funksiya — bir mas'uliyat.
- [ ]  `[ ]` **Apply DRY / KISS / YAGNI.**
→ Takrorlama / sodda qil / kerakmasini qo'shma.
- [ ]  `[ ]` **Keep functions short (~20-30 lines) — measure complexity, not just lines.**
→ Funksiya qisqa, lekin asosiysi murakkablik (cyclomatic), qator emas.
- [ ]  `[ ]` **Comments explain WHY, not WHAT.**
→ Izoh NEGA'ni tushuntirsin.
- [ ]  `[ ]` **Format with Prettier.**
→ Prettier bilan formatlash.

---

## 9. Accessibility (a11y)

- [ ]  `[ ]` **Use semantic HTML (button, nav, main).**
→ Semantik HTML.
- [ ]  `[ ]` **Correct ARIA attributes (aria-label, role).**
→ ARIA atributlari to'g'ri.
- [ ]  `[ ]` **Support keyboard navigation (Tab, Enter, Esc).**
→ Klaviatura navigatsiyasi.
- [ ]  `[ ]` **Manage focus (focus trap in modals).**
→ Focus boshqaruvi.
- [ ]  `[ ]` **Sufficient color contrast (WCAG AA: 4.5:1).**
→ Rang kontrasti yetarli.
- [ ]  `[ ]` **alt text on images; labels linked to inputs (htmlFor).**
→ alt text va label bog'langan.
- [ ]  `[ ]` **Don't convey info by color alone.**
→ Faqat rang orqali ma'lumot bermaslik.
- [ ]  `[ ]` **Respect prefers-reduced-motion.**
→ prefers-reduced-motion hurmat qilinsin.

---

## 10. i18n (if multilingual)

- [ ]  `[ ]` **No hardcoded text (i18next, react-intl).**
→ Hardcoded matn yo'q.
- [ ]  `[ ]` **Localize date/time (Intl.DateTimeFormat) and numbers (Intl.NumberFormat).**
→ Sana/raqam lokalizatsiya.
- [ ]  `[ ]` **Support RTL languages.**
→ RTL tillar.
- [ ]  `[ ]` **Correct pluralization.**
→ Pluralization to'g'ri.

---

## 11. Testing

- [ ]  `[ ]` **Unit tests (render, state, event handlers).**
→ Unit test.
- [ ]  `[ ]` **Integration tests (user interaction, API).**
→ Integration test.
- [ ]  `[ ]` **E2E tests (Playwright, Cypress) for critical flows.**
→ Kritik oqimlar uchun E2E.
- [ ]  `[ ]` **a11y tests (jest-axe).**
→ Accessibility test.
- [ ]  `[ ]` **Test behavior, not implementation.**
→ Behavior'ni test qil, implementation'ni emas.
- [ ]  `[ ]` **Cover edge cases and error states.**
→ Chekka holat va xatolar test qilinsin.

---

## 12. Deployment & Tooling

- [ ]  `[ ]` **Correct env variables (NEXT_PUBLIC_ / VITE_ prefix).**
→ Env variable'lar to'g'ri prefiks bilan.
- [ ]  `[ ]` **Test the production build.**
→ Production build sinovdan o'tsin.
- [ ]  `[ ]` **Good Lighthouse score (>90).**
→ Lighthouse score yaxshi.
- [ ]  `[ ]` **Mobile responsive; cross-browser compatible.**
→ Mobil va brauzerlararo moslik.
- [ ]  `[ ]` **Set up ESLint + Prettier + Husky + lint-staged.**
→ Lint/format vositalari.
- [ ]  `[ ]` **CI/CD pipeline (GitHub Actions).**
→ CI/CD bo'lsin.
- [ ]  `[ ]` **Error & performance monitoring in place.**
→ Monitoring o'rnatilgan.

---

## Most Dangerous Mistakes

- [ ]  `[ ]` Using `any` → disables TypeScript's protection.
`[ ]` Wrong/missing useEffect deps → infinite loop.
`[ ]` Not sanitizing input → XSS.
`[ ]` No error handling → app crash.
`[ ]` Index as key → render bugs.
`[ ]` Premature optimization → needless complexity.