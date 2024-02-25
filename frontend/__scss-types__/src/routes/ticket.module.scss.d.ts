export type Styles = {
  qr: string;
  ticket: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
