export type Styles = {
  "modal-body": string;
  "modal-footer": string;
  "modal-header": string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
