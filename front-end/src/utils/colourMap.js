// Maps the colour names used in the admin "Add Product" form to real hex
// codes. Plain CSS `background-color` only understands single-word colour
// keywords (e.g. "navy", "skyblue") — multi-word names like "Navy Blue" or
// "Light Grey" are invalid CSS and silently render as nothing (which looks
// white). This map guarantees every colour option always renders correctly.

const COLOUR_HEX_MAP = {
  black: "#000000",
  white: "#FFFFFF",
  blue: "#1E3A8A",
  "navy blue": "#001F54",
  "sky blue": "#87CEEB",
  "light blue": "#ADD8E6",
  "dark blue": "#00008B",
  grey: "#808080",
  gray: "#808080",
  "light grey": "#D3D3D3",
  "light gray": "#D3D3D3",
  "dark grey": "#4B4B4B",
  "dark gray": "#4B4B4B",
  charcoal: "#36454F",
  red: "#DC2626",
  maroon: "#800000",
  pink: "#FFC0CB",
  "light pink": "#FFD1DC",
  green: "#16A34A",
  "olive green": "#556B2F",
  "dark green": "#014421",
  "mint green": "#98FF98",
  yellow: "#FACC15",
  mustard: "#E1AD01",
  orange: "#F97316",
  brown: "#8B4513",
  "dark brown": "#5C4033",
  beige: "#F5F5DC",
  khaki: "#C3B091",
  cream: "#FFFDD0",
  "off white": "#FAF9F6",
  purple: "#7E22CE",
  lavender: "#E6E6FA",
  turquoise: "#40E0D0",
  teal: "#008080",
  wine: "#722F37",
  peach: "#FFE5B4",
  rust: "#B7410E",
  camel: "#C19A6B",
  coffee: "#6F4E37",
  burgundy: "#800020",
  chocolate: "#7B3F00",
  "denim blue": "#1560BD",
};

// fallback for any colour name that isn't in the map above, so it never
// silently renders as invisible/white
const FALLBACK_HEX = "#9CA3AF"; // neutral grey

export function getColourHex(name) {
  if (!name) {
    return FALLBACK_HEX;
  }
  const key = String(name).trim().toLowerCase();
  return COLOUR_HEX_MAP[key] || FALLBACK_HEX;
}
