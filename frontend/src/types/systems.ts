export type System = {
  name: string;
  displayName: string;
  filters: Filter[];
};

export type Filter = {
  name: string;
  displayName: string;
  code: string;
};
