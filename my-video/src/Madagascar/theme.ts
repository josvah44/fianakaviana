import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const TITLE_FONT = "Playfair Display";
export const BODY_FONT = "Montserrat";

const fonts: [family: string, weight: string, file: string][] = [
  [TITLE_FONT, "700", "playfair-display-latin-700-normal.woff2"],
  [TITLE_FONT, "900", "playfair-display-latin-900-normal.woff2"],
  [BODY_FONT, "400", "montserrat-latin-400-normal.woff2"],
  [BODY_FONT, "600", "montserrat-latin-600-normal.woff2"],
  [BODY_FONT, "800", "montserrat-latin-800-normal.woff2"],
];

for (const [family, weight, file] of fonts) {
  loadFont({ family, weight, url: staticFile(`fonts/${file}`) });
}

export const colors = {
  flagRed: "#FC3D32",
  flagGreen: "#007E3A",
  cream: "#FFF6E5",
  sand: "#F2D6A2",
  earth: "#B5442B",
  earthDark: "#6E1E12",
  ink: "#141414",
};
