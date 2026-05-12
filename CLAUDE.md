# Kiththa Grand — Pure Ceylon Spices
## Project Context for Claude Code

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript (SPA — no framework)
- Database: Supabase (PostgreSQL) with RLS
- Auth: Supabase Auth (Email + Google OAuth)
- Storage: Supabase Storage (product/category images)
- Payments: PayHere (local LK) + 2Checkout (international)
- Shipping: FedEx API
- Hosting: GitHub Pages
- Domain: kiththagrand.com

## Branding & Colors
- Primary Red:   #8B2500  (--red)
- Red Dark:      #6B1A00  (--red-dark)
- Gold:          #C8900A  (--gold)
- Gold Light:    #F0B429  (--gold-light)
- Cream:         #FDF3E3  (--cream)
- Cream Dark:    #F0E0C0  (--cream-dark)
- Brown:         #3D1C02  (--brown)
- Green:         #2A5C3F  (--green)
- Heading Font:  Cinzel Decorative
- Body Font:     IM Fell English
- Sub Font:      Cinzel
- Feel: Traditional Sri Lankan spice market — dark, rich, warm

## Project Structure
```
kiththa-grand/
├── index.html          ← SPA shell (all pages as divs)
├── CLAUDE.md           ← This file
├── _redirects          ← Netlify/GitHub routing
├── css/
│   ├── style.css       ← Main styles + CSS variables
│   └── animations.css  ← All keyframe animations
├── js/
│   ├── app.js          ← Main app (auth, cart, wishlist, toast, currency)
│   ├── router.js       ← SPA router (switches pages by ID)
│   ├── supabase.js     ← Supabase client (window.supabase exposed)
│   └── pages/
│       ├── login.js    ← Login + Register + Forgot password
│       ├── profile.js  ← User profile + addresses + loyalty
│       ├── admin.js    ← Admin dashboard (products, orders, categories)
│       ├── products.js ← Product grid + filter (TODO)
│       ├── product.js  ← Product detail + story (TODO)
│       ├── cart.js     ← Cart page (TODO)
│       ├── checkout.js ← Checkout + payment (TODO)
│       ├── wishlist.js ← Wishlist page (TODO)
│       ├── orders.js   ← Order history (TODO)
│       ├── settings.js ← User settings (TODO)
│       ├── about.js    ← About us (TODO)
│       ├── contact.js  ← Contact page (TODO)
│       └── bulk-orders.js ← Bulk order form (TODO)
└── images/
    └── logo.png        ← Kiththa Grand logo

## Database — 18 Supabase Tables
1.  categories       — slug, name, name_si, image_url, sort_order
2.  users            — id (auth.uid), full_name, email, phone, birthday, loyalty_points, role
3.  user_preferences — email/whatsapp notifications, language, currency, packaging
4.  addresses        — user_id, label, address_line1, city, country, is_default
5.  products         — category_id, name, name_si, price_lkr/usd/eur/gbp, weight_grams, stock, images[], is_featured
6.  cart             — user_id, product_id, quantity
7.  saved_items      — user_id, product_id (wishlist)
8.  coupons          — code, type(percent/fixed), discount_value, min_order, max_uses
9.  orders           — user_id, order_number(KG-2024-0001), status, payment_method, total, shipping details
10. order_items      — order_id, product_id, product_name, quantity, price_each
11. coupon_uses      — coupon_id, user_id, order_id
12. bulk_orders      — name, email, company, country, quantity_kg, status
13. reviews          — user_id, product_id, rating(1-5), comment, is_approved
14. review_images    — review_id, image_url
15. loyalty_points   — user_id, order_id, points, type(earned/redeemed/referral/birthday)
16. notifications    — user_id, type, title, message, is_read
17. referrals        — referrer_id, referred_id, referral_code, points_awarded(500)
18. settings         — key/value store (whatsapp_number, free_shipping_above_usd, etc.)

## Business Rules
- Loyalty: 10 points per $1 spent
- Redeem: 100 points = Rs.10 discount
- Referral: 500 points each (referrer + referred)
- Birthday: 15% discount
- Free shipping: above $150 USD
- Order number format: KG-YYYY-0001
- Currency: LKR / USD / EUR / GBP
- Admin role: set role='admin' in users table

## Pages Status
| Page         | File           | Status     |
|--------------|----------------|------------|
| Home         | index.html     | ✅ Done    |
| Login/Reg    | login.js       | ✅ Done    |
| Profile      | profile.js     | ✅ Done    |
| Admin        | admin.js       | ✅ Done    |
| Products     | products.js    | ✅ Done    |
| Product      | product.js     | ✅ Done    |
| Cart         | cart.js        | ⏳ TODO    |
| Checkout     | checkout.js    | ⏳ TODO    |
| Wishlist     | wishlist.js    | ⏳ TODO    |
| Orders       | orders.js      | ⏳ TODO    |
| Settings     | settings.js    | ⏳ TODO    |
| About        | about.js       | ⏳ TODO    |
| Contact      | contact.js     | ⏳ TODO    |
| Bulk Orders  | bulk-orders.js | ✅ Done    |

## Coding Rules (IMPORTANT)
- NO template literals with nested expressions — use string concatenation instead
- NO backtick strings that contain backticks inside — causes SyntaxError
- Use regular functions instead of arrow functions inside HTML strings
- CSS inject as array of strings joined: [...].join('')
- HTML build using DOM createElement + innerHTML with safe strings
- All pages export: export async function init(container) {} + export default init
- Always syntax check: avoid apostrophes in JS single-quoted strings
- Mobile first design
- All animations must have off option (prefers-reduced-motion)
- Sound effects must have off option

## Common Exports from app.js
- showToast(message, type, duration)
- formatPrice(lkrPrice)
- initReveals()
- loadCart()
- loadWishlist()
- addToCart(productId)
- toggleWishlist(productId)
- launchConfetti()
- state (user, cart, wishlist, currency)

## Supabase Notes
- window.supabase = supabase (globally exposed)
- window.router = router (globally exposed)
- Auth trigger: on_auth_user_created → auto creates users + user_preferences row
- RLS enabled on all tables
- Storage buckets: 'products' (public), 'categories' (public)

## Contact
- WhatsApp: +94771234567
- Email: hello@kiththagrand.com
- Location: Colombo, Sri Lanka
