export type Styles = {
  spinner: string;
  user: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
