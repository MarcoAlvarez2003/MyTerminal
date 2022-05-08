import { green, magenta, yellow, bold, red, white } from "../../imports/color.ts";
import { Theme } from "./index.ts";

export const themes: Record<string, Theme> = {
  /* 
    ? Default
  */

  default: {
    ShellColors: {
      lastFolder: green,
      name: magenta,
      link: yellow,
    },
    Colors: {
      answer: green,
      input: bold,
    },
  },

  /* 
    ? Red
  */

  red: {
    ShellColors: {
      lastFolder: green,
      link: yellow,
      name: red,
    },
    Colors: {
      answer: white,
      input: bold,
    },
  },

  /* 
    ? Popcorn
  */

  popcorn: {
    ShellColors: {
      lastFolder: yellow,
      name: white,
      link: green,
    },
    Colors: {
      answer: white,
      input: bold,
    },
  },
};
