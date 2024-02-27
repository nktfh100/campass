export type Styles = {
  card: string;
  card__body: string;
  card__header: string;
  "card__loading-bar": string;
  card__warning: string;
  "card--error": string;
  "card--success": string;
  "card--warning": string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
