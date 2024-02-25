export type Styles = {
  cards: string;
  "cards--admin": string;
  "cards--user": string;
  pagination: string;
  spinner: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
