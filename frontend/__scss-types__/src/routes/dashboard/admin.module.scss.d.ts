export type Styles = {
  admin: string;
  "event-name": string;
  "select-event": string;
  spinner: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
