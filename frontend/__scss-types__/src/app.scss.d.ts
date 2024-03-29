export type Styles = {
  app: string;
  "background-color": string;
  "fade-in": string;
  fadeIn: string;
  light: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
