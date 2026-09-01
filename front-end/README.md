# KING - Men's Fashion E-commerce (React)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Project Structure

```
src/
 ├─ components/
 │   ├─ Header.jsx       -> Top bar + navigation
 │   ├─ Hero.jsx         -> Hero banner section
 │   ├─ Categories.jsx   -> Category quick links
 │   ├─ ProductCard.jsx  -> Single product card
 │   ├─ ProductSection.jsx -> Section with grid of products
 │   ├─ Newsletter.jsx   -> Subscribe section
 │   ├─ Footer.jsx       -> Footer
 │   └─ Login.jsx        -> Login / Signup page
 ├─ pages/
 │   └─ Home.jsx         -> Main landing page (assembles all sections)
 ├─ data/
 │   └─ products.js      -> All product data (shirt, t-shirt, pant, shoes, jacket, night dress)
 ├─ App.jsx              -> Routes ("/" -> Home, "/login" -> Login)
 ├─ main.jsx             -> Entry point
 └─ index.css            -> Tailwind imports
```

Visit `/login` route for the login/signup page.
