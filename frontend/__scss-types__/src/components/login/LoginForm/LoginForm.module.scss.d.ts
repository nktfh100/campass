export type Styles = {
  form: string;
  form__error: string;
  form__password: string;
  form__username: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
