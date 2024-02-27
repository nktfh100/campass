export type Styles = {
  cards: string;
  container: string;
  spinner: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
