export type Styles = {
  modal: string;
  "modal-footer": string;
  "modal-header": string;
  "modal-header__name": string;
  "modal-header__title": string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
